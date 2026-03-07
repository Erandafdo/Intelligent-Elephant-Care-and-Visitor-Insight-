from flask import Flask, request, jsonify, session, g
from flask_cors import CORS
import sqlite3
import hashlib
import pandas as pd
import os
import cv2  # For video feed
from flask import Response
from core_logic.camera import VideoCamera
from core_logic.antigravity_core import recommend_food
from core_logic.reporting import generate_daily_report
from core_logic import health_predictor

app = Flask(__name__)
app.secret_key = 'super_secret_pinnawala_key' # In prod, use environment variable
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',
)

# Configure CORS so React (running on a different port) can talk to this API and send cookies
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'database.db')

# Clinical Knowledge Base for Vets
RISK_DETAILS = {
    'Bacterial/Viral Infection': {
        'symptoms': 'High Fever (>38°C), Lethargy, Loss of Appetite',
        'action': 'Isolate immediately. Administer antibiotics as per protocol. Monitor fluids.'
    },
    'Colic / Digestion Issue': {
        'symptoms': 'Abdominal discomfort, Bloating, irregular stool',
        'action': 'Restrict solid food. Administer laxatives if constipated. hydration therapy.'
    },
    'Severe Dehydration': {
        'symptoms': 'Dry trunk, Sunken eyes, Lethargy',
        'action': 'Intravenous fluids immediately. Provide electrolyte-rich water. Shade.'
    },
    'Joint Inflammation': {
        'symptoms': 'Joint stiffness, Swelling (Edema), Reluctance to move',
        'action': 'Pain management (NSAIDs). Soft ground bedding. Gentle movement therapy.'
    },
    'No_Diagnosis': {
        'symptoms': 'None',
        'action': 'Routine monitoring.'
    },
    'None': {
        'symptoms': 'None',
        'action': 'Routine monitoring.'
    }
}


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    db = get_db()
    db.commit() # Added commit here in case it's a mutation. Better yet, we should explicitely commit on inserts.
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({'authenticated': True, 'user': session.get('username')}), 200
    return jsonify({'authenticated': False}), 401

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Simple hash check
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    user = query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
    
    if user and user['password'] == password_hash:
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['role'] = user['role']
        return jsonify({
            'message': 'Login successful', 
            'user': {'username': user['username']}
        }), 200
    else:
        return jsonify({'error': 'Invalid Credentials. Try vet_kamal / password'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    # Map model output conditions to display statuses
    STATUS_MAP = {
        'Healthy':     'Healthy',
        'Infection':   'Critical',
        'Dehydration': 'Critical',
        'Arthritis':   'Warning',
        'Indigestion': 'Warning',
        'Error':       'Unknown',
        'Unknown':     'Unknown',
    }

    elephants = query_db('SELECT * FROM elephants')

    # Get latest status for each elephant
    elephant_list = []
    for el in elephants:
        latest_log = query_db(
            'SELECT predicted_status, diagnosis FROM health_logs WHERE elephant_id = ? ORDER BY timestamp DESC LIMIT 1',
            [el['id']], one=True
        )
        raw_status = latest_log['predicted_status'] if latest_log else 'Unknown'
        display_status = STATUS_MAP.get(raw_status, raw_status)  # Fall back to raw if unrecognised
        diagnosis = latest_log['diagnosis'] if latest_log and latest_log['diagnosis'] else 'None'

        elephant_list.append({
            'id':        el['id'],
            'name':      el['name'],
            'age':       el['age'],
            'image_url': el['image_url'],
            'status':    display_status,
            'raw_status': raw_status,
            'diagnosis': diagnosis
        })

    return jsonify({
        'user':      session.get('username'),
        'elephants': elephant_list
    }), 200

@app.route('/api/elephants', methods=['POST'])
def add_elephant():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    name = data.get('name')
    age = data.get('age')
    gender = data.get('gender')
    weight = data.get('weight', 0.0)
    height = data.get('height', 0.0)
    base_health_score = int(data.get('base_health_score', 80))
    activity_level = data.get('activity_level', 'Medium')
    notes = data.get('notes', '')
    image_url = data.get('image_url')
    
    db = get_db()
    cursor = db.execute('''
        INSERT INTO elephants (name, age, gender, weight_kg, height_m, special_notes, image_url, base_health_score, activity_level) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', [name, age, gender, weight, height, notes, image_url, base_health_score, activity_level])
    db.commit()
    
    return jsonify({'message': 'Elephant profile created successfully', 'id': cursor.lastrowid}), 201

@app.route('/api/elephants/<int:elephant_id>', methods=['GET'])
def get_elephant(elephant_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    elephant_row = query_db('SELECT * FROM elephants WHERE id = ?', [elephant_id], one=True)
    if not elephant_row:
        return jsonify({'error': 'Elephant not found'}), 404
        
    elephant = dict(elephant_row)
    logs_rows = query_db('SELECT * FROM health_logs WHERE elephant_id = ? ORDER BY timestamp DESC', [elephant_id])
    logs = [dict(row) for row in logs_rows]
    
    STATUS_MAP = {
        'Healthy':     'Healthy',
        'Infection':   'Critical',
        'Dehydration': 'Critical',
        'Arthritis':   'Warning',
        'Indigestion': 'Warning',
        'Error':       'Unknown',
        'Unknown':     'Unknown',
    }
    raw_status = logs[0]['predicted_status'] if logs else 'Unknown'
    latest_status = STATUS_MAP.get(raw_status, raw_status)
    latest_diagnosis = logs[0]['diagnosis'] if logs else 'None'

    return jsonify({
        'elephant': elephant,
        'logs': logs,
        'latest_status': latest_status,
        'raw_status': raw_status,
        'latest_diagnosis': latest_diagnosis,
        'risk_details': RISK_DETAILS
    }), 200

@app.route('/api/elephants/<int:elephant_id>', methods=['PUT'])
def edit_elephant(elephant_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    name = data.get('name')
    age = data.get('age')
    gender = data.get('gender')
    weight = data.get('weight', 0.0)
    height = data.get('height', 0.0)
    notes = data.get('notes', '')
    image_url = data.get('image_url')
    
    db = get_db()
    db.execute('''
        UPDATE elephants 
        SET name=?, age=?, gender=?, weight_kg=?, height_m=?, special_notes=?, image_url=?
        WHERE id=?
    ''', [name, age, gender, weight, height, notes, image_url, elephant_id])
    db.commit()
    
    return jsonify({'message': 'Elephant profile updated successfully'}), 200

@app.route('/api/elephants/<int:elephant_id>', methods=['DELETE'])
def delete_elephant(elephant_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    db = get_db()
    db.execute('DELETE FROM health_logs WHERE elephant_id = ?', [elephant_id])
    db.execute('DELETE FROM elephants WHERE id = ?', [elephant_id])
    db.commit()
    
    return jsonify({'message': 'Elephant and logs deleted successfully'}), 200

@app.route('/api/elephants/<int:elephant_id>/health', methods=['POST'])
def add_health_log(elephant_id):
    if 'user_id' not in session:
         return jsonify({'error': 'Unauthorized'}), 401
         
    elephant = query_db('SELECT * FROM elephants WHERE id = ?', [elephant_id], one=True)
    if not elephant:
        return jsonify({'error': 'Elephant not found'}), 404
        
    data = request.json
    temp = float(data.get('temperature', 0))
    heart_rate = float(data.get('heart_rate', 0))
    resp_rate = float(data.get('respiratory_rate', 0))
    weight_change = float(data.get('weight_change', 0))
    food = int(data.get('food_intake', 0))
    stool = data.get('stool_consistency', 'Normal')
    activity = data.get('activity_level', 'High')
    edema = data.get('edema', 'None')
    trunk = data.get('trunk_moisture', 'Moist')
    mucous = data.get('mucous_membrane', 'Pink')
    gait = data.get('gait_score', 'Normal')
    
    # AI Prediction via the dedicated health_predictor module
    result = health_predictor.predict(elephant['age'], data)
    predicted_status = result['predicted_status']
    predicted_diagnosis = result['predicted_diagnosis']
    
    db = get_db()
    db.execute('''
        INSERT INTO health_logs 
        (elephant_id, temperature, heart_rate, respiratory_rate, weight_change, food_intake, stool_consistency, activity_level, edema, trunk_moisture, mucous_membrane, gait_score, predicted_status, diagnosis)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', [elephant_id, temp, heart_rate, resp_rate, weight_change, food, stool, activity, edema, trunk, mucous, gait, predicted_status, predicted_diagnosis])
    db.commit()
    
    return jsonify({
        'message': 'Health log saved',
        'predicted_status': predicted_status,
        'predicted_diagnosis': predicted_diagnosis
    }), 201

# --- Stress Detector Endpoints ---
def gen(camera):
    while True:
        frame = camera.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/api/video_feed')
def video_feed():
    return Response(gen(VideoCamera()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/history')
@app.route('/api/history/<int:elephant_id>')
def stress_history(elephant_id=1):
    # Fetch last 7 days of stress logs for the chart
    logs_rows = query_db('''
        SELECT DATE(timestamp) as date, ROUND(AVG(stress_level),1) as stress_level 
        FROM stress_logs 
        WHERE elephant_id = ? AND timestamp >= date('now', '-7 days')
        GROUP BY DATE(timestamp) 
        ORDER BY date ASC
    ''', [elephant_id])
    
    formatted_logs = []
    for row in logs_rows:
        level = row['stress_level']
        status = 'High Stress' if level > 60 else 'Moderate' if level > 30 else 'Relaxed'
        formatted_logs.append({
            'date': row['date'],
            'stress_level': level,
            'status': status
        })
    return jsonify(formatted_logs)

# --- Food Chain Endpoints ---
@app.route('/api/food/recommend', methods=['POST'])
def get_food_recommendations():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    try:
        recommendations = recommend_food(data)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/elephants/<int:elephant_id>/food', methods=['POST'])
def add_food_log(elephant_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    date_str = data.get('date', pd.Timestamp.now().strftime('%Y-%m-%d'))
    temperature_c = float(data.get('temperature_c', 28.0))
    humidity_percent = float(data.get('humidity_percent', 65.0))
    activity_score = float(data.get('activity_score', 1.0))
    health_status = data.get('health_status', 'Healthy')
    morning_food_kg = float(data.get('morning_food_kg', 0.0))
    evening_food_kg = float(data.get('evening_food_kg', 0.0))
    ai_remark = data.get('ai_remark', 'Manually logged meal.')

    db = get_db()
    db.execute('''
        INSERT INTO daily_logs (date, elephant_id, temperature_c, humidity_percent, activity_score, health_status, morning_food_kg, evening_food_kg, ai_remark)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', [date_str, elephant_id, temperature_c, humidity_percent, activity_score, health_status, morning_food_kg, evening_food_kg, ai_remark])
    db.commit()

    return jsonify({'message': 'Food log saved successfully'}), 201

@app.route('/api/food/report/<date_str>', methods=['GET'])
def get_daily_food_report(date_str):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        report_df = generate_daily_report(date_str)
        if isinstance(report_df, str):
             return jsonify({'error': report_df}), 404
        return jsonify(report_df.to_dict('records'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/food/overview', methods=['GET'])
def food_chain_overview():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    db = get_db()
    db.row_factory = sqlite3.Row
    total_logs  = db.execute("SELECT count(*) as c FROM daily_logs").fetchone()['c']
    ele_count   = db.execute("SELECT count(*) as c FROM elephants").fetchone()['c']
    avg_health  = db.execute("SELECT avg(base_health_score) as a FROM elephants").fetchone()['a'] or 0
    food_today  = db.execute("SELECT sum(morning_food_kg + evening_food_kg) as f FROM daily_logs WHERE date = date('now')").fetchone()['f'] or 0
    unique_days = db.execute("SELECT count(distinct date) as d FROM daily_logs").fetchone()['d']
    return jsonify({
        'total_logs':  total_logs,
        'ele_count':   ele_count,
        'avg_health':  round(float(avg_health), 1),
        'food_today':  round(float(food_today), 1),
        'unique_days': unique_days,
    })

@app.route('/api/food/history/<int:elephant_id>', methods=['GET'])
def get_food_history(elephant_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    rows = query_db(
        'SELECT * FROM daily_logs WHERE elephant_id = ? ORDER BY date DESC LIMIT 30',
        [elephant_id]
    )
    return jsonify([dict(r) for r in rows])

@app.route('/api/food/ai-recommend', methods=['POST'])
def ai_food_recommend():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    elephant_id = data.get('elephant_id')
    elephant = query_db('SELECT * FROM elephants WHERE id = ?', [elephant_id], one=True)
    if not elephant:
        return jsonify({'error': 'Elephant not found'}), 404
    context = {
        'temperature_c':    float(data.get('temperature_c', 28)),
        'humidity_percent': float(data.get('humidity_percent', 65)),
        'activity_score':   float(data.get('activity_score', 1.0)),
        'health_status':    data.get('health_status', 'Healthy'),
    }
    rec = recommend_food(dict(elephant), context)
    return jsonify(rec)

@app.route('/api/food/forecast/<int:elephant_id>', methods=['GET'])
def food_forecast(elephant_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    elephant = query_db('SELECT * FROM elephants WHERE id = ?', [elephant_id], one=True)
    if not elephant:
        return jsonify({'error': 'Elephant not found'}), 404
    import datetime
    today = datetime.date.today()
    forecast = []
    schedules = [
        ("Hay + Fruits (Bananas, Papaya)", "Hay + Grains"),
        ("Hay + Vegetables (Carrots, Pumpkin)", "Hay + Supplements"),
    ]
    for i in range(7):
        future_date = today + datetime.timedelta(days=i)
        context = {'temperature_c': 27, 'humidity_percent': 60, 'activity_score': 1.0, 'health_status': 'Healthy'}
        rec = recommend_food(dict(elephant), context)
        morning_sched, evening_sched = schedules[i % 2]
        forecast.append({
            'date':            future_date.strftime('%Y-%m-%d'),
            'morning_kg':      rec['morning_kg'],
            'evening_kg':      rec['evening_kg'],
            'total_kg':        rec['total_kg'],
            'morning_schedule': morning_sched,
            'evening_schedule': evening_sched,
            'remark':          rec['remark'],
        })
    return jsonify(forecast)

if __name__ == '__main__':
    app.run(debug=True, port=5005)

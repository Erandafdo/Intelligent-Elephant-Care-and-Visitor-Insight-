from flask import Flask, request, jsonify, session, g
from flask_cors import CORS
import sqlite3
import hashlib
import pandas as pd
import joblib
import os

app = Flask(__name__)
app.secret_key = 'super_secret_pinnawala_key' # In prod, use environment variable
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',
)

# Configure CORS so React (running on a different port) can talk to this API and send cookies
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'database.db')
MODEL_PATH = os.path.join(BASE_DIR, 'elephant_health_model.pkl')
MODEL_DIAGNOSIS_PATH = os.path.join(BASE_DIR, 'diagnosis_model.pkl')

# Clinical Knowledge Base for Vets
RISK_DETAILS = {
    'Infection': {
        'symptoms': 'High Fever (>38°C), Lethargy, Loss of Appetite',
        'action': 'Isolate immediately. Administer antibiotics as per protocol. Monitor fluids.'
    },
    'Indigestion': {
        'symptoms': 'Abdominal discomfort, Bloating, irregular stool',
        'action': 'Restrict solid food. Administer laxatives if constipated. hydration therapy.'
    },
    'Dehydration': {
        'symptoms': 'Dry trunk, Sunken eyes, Lethargy',
        'action': 'Intravenous fluids immediately. Provide electrolyte-rich water. Shade.'
    },
    'Arthritis': {
        'symptoms': 'Joint stiffness, Swelling (Edema), Reluctance to move',
        'action': 'Pain management (NSAIDs). Soft ground bedding. Gentle movement therapy.'
    },
    'None': {
        'symptoms': 'None',
        'action': 'Routine monitoring.'
    }
}

# Load Models
model = None
diagnosis_model = None

try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("Health Status Model loaded.")
    
    if os.path.exists(MODEL_DIAGNOSIS_PATH):
        diagnosis_model = joblib.load(MODEL_DIAGNOSIS_PATH)
        print("Diagnosis Model loaded.")
        
except Exception as e:
    print(f"Error loading models: {e}")

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
    
    elephants = query_db('SELECT * FROM elephants')
    
    # Get latest status for each elephant
    elephant_list = []
    for el in elephants:
        latest_log = query_db('SELECT predicted_status, diagnosis FROM health_logs WHERE elephant_id = ? ORDER BY timestamp DESC LIMIT 1', [el['id']], one=True)
        status = latest_log['predicted_status'] if latest_log else 'Unknown'
        diagnosis = latest_log['diagnosis'] if latest_log and latest_log['diagnosis'] else 'None'
        
        elephant_list.append({
            'id': el['id'],
            'name': el['name'],
            'age': el['age'],
            'image_url': el['image_url'],
            'status': status,
            'diagnosis': diagnosis
        })
        
    return jsonify({
        'user': session.get('username'),
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
    notes = data.get('notes', '')
    image_url = data.get('image_url')
    
    db = get_db()
    cursor = db.execute('''
        INSERT INTO elephants (name, age, gender, weight_kg, height_m, special_notes, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', [name, age, gender, weight, height, notes, image_url])
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
    
    latest_status = logs[0]['predicted_status'] if logs else 'Unknown'
    latest_diagnosis = logs[0]['diagnosis'] if logs else 'None'
    
    return jsonify({
        'elephant': elephant,
        'logs': logs,
        'latest_status': latest_status,
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
    
    # AI Prediction
    predicted_status = "Unknown"
    predicted_diagnosis = "None"
    if model:
        input_data = pd.DataFrame([{
            'Age': elephant['age'],
            'Temperature_C': temp,
            'Heart_Rate_BPM': heart_rate,
            'Respiratory_Rate_BPM': resp_rate,
            'Weight_Change_Percent': weight_change,
            'Food_Intake_Percent': food,
            'Stool_Consistency': stool,
            'Activity_Level': activity,
            'Edema': edema,
            'Trunk_Moisture': trunk,
            'Mucous_Membrane': mucous,
            'Gait_Score': gait
        }])
        
        try:
            prediction = model.predict(input_data)
            predicted_status = prediction[0]
            
            if diagnosis_model:
                 diag_pred = diagnosis_model.predict(input_data)
                 predicted_diagnosis = diag_pred[0]
        except Exception as e:
            print(f"Prediction Error: {e}")
            predicted_status = "Error"
    
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

if __name__ == '__main__':
    app.run(debug=True, port=5001)

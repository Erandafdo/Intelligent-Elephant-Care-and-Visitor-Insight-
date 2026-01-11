from flask import Flask, render_template, request, redirect, url_for, session, g
import sqlite3
import hashlib
import pandas as pd
import joblib
import os
import datetime

app = Flask(__name__)
app.secret_key = 'super_secret_pinnawala_key' # In prod, use environment variable
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
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/')
def index():
    # If already logged in, go to dashboard, else show landing page
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Simple hash check
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        user = query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
        
        if user and user['password'] == password_hash:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            return redirect(url_for('dashboard'))
        else:
            error = 'Invalid Credentials. Try vet_kamal / password'
            
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    elephants = query_db('SELECT * FROM elephants')
    
    # Get latest status for each elephant
    elephant_list = []
    for el in elephants:
        # Find latest log
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
        
    return render_template('dashboard.html', user=session['username'], elephants=elephant_list)

@app.route('/add_elephant', methods=['GET', 'POST'])
def add_elephant():
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    if request.method == 'POST':
        name = request.form['name']
        age = request.form['age']
        gender = request.form['gender']
        weight = request.form.get('weight', 0.0)
        height = request.form.get('height', 0.0)
        notes = request.form.get('notes', '')
        image_url = request.form['image_url']
        
        db = get_db()
        db.execute('''
            INSERT INTO elephants (name, age, gender, weight_kg, height_m, special_notes, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', [name, age, gender, weight, height, notes, image_url])
        db.commit()
        
        return redirect(url_for('dashboard'))
        
    return render_template('add_elephant.html')

@app.route('/elephant/<int:elephant_id>', methods=['GET', 'POST'])
def elephant_profile(elephant_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    elephant = query_db('SELECT * FROM elephants WHERE id = ?', [elephant_id], one=True)
    if not elephant:
        return "Elephant not found", 404
        
    if request.method == 'POST':
        # Process Health Form
        temp = float(request.form['temperature'])
        heart_rate = float(request.form['heart_rate'])
        resp_rate = float(request.form['respiratory_rate'])
        weight_change = float(request.form['weight_change'])
        food = int(request.form['food_intake'])
        stool = request.form['stool_consistency']
        activity = request.form['activity_level']
        edema = request.form['edema']
        trunk = request.form['trunk_moisture']
        mucous = request.form['mucous_membrane']
        gait = request.form['gait_score']
        
        # AI Prediction
        predicted_status = "Unknown"
        predicted_diagnosis = "None"
        if model:
            # Prepare input DataFrame exactly as model expects
            # Features: Age, Temp, HR, RR, Weight, Food, Stool, Activity, Edema, Trunk, Mucous, Gait
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
        
        # Save to DB
        db = get_db()
        db.execute('''
            INSERT INTO health_logs 
            (elephant_id, temperature, heart_rate, respiratory_rate, weight_change, food_intake, stool_consistency, activity_level, edema, trunk_moisture, mucous_membrane, gait_score, predicted_status, diagnosis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [elephant_id, temp, heart_rate, resp_rate, weight_change, food, stool, activity, edema, trunk, mucous, gait, predicted_status, predicted_diagnosis])
        db.commit()
        
        return redirect(url_for('elephant_profile', elephant_id=elephant_id))
    
    # Get History
    logs = query_db('SELECT * FROM health_logs WHERE elephant_id = ? ORDER BY timestamp DESC', [elephant_id])
    
    latest_status = logs[0]['predicted_status'] if logs else 'Unknown'
    latest_diagnosis = logs[0]['diagnosis'] if logs else 'None'
    
    return render_template('profile.html', elephant=elephant, logs=logs, latest_status=latest_status, latest_diagnosis=latest_diagnosis, risk_details=RISK_DETAILS)

@app.route('/elephant/<int:elephant_id>/edit', methods=['GET', 'POST'])
def edit_elephant(elephant_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    db = get_db()
    
    if request.method == 'POST':
        name = request.form['name']
        age = request.form['age']
        gender = request.form['gender']
        weight = request.form.get('weight', 0.0)
        height = request.form.get('height', 0.0)
        notes = request.form.get('notes', '')
        image_url = request.form['image_url']
        
        db.execute('''
            UPDATE elephants 
            SET name=?, age=?, gender=?, weight_kg=?, height_m=?, special_notes=?, image_url=?
            WHERE id=?
        ''', [name, age, gender, weight, height, notes, image_url, elephant_id])
        db.commit()
        
        return redirect(url_for('elephant_profile', elephant_id=elephant_id))
    
    elephant = query_db('SELECT * FROM elephants WHERE id = ?', [elephant_id], one=True)
    return render_template('edit_elephant.html', elephant=elephant)

@app.route('/elephant/<int:elephant_id>/delete', methods=['POST'])
def delete_elephant(elephant_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    db = get_db()
    db.execute('DELETE FROM health_logs WHERE elephant_id = ?', [elephant_id]) # Cascade manually
    db.execute('DELETE FROM elephants WHERE id = ?', [elephant_id])
    db.commit()
    
    return redirect(url_for('dashboard'))


if __name__ == '__main__':
    app.run(debug=True, port=5001)

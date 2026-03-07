import sqlite3
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_DB = os.path.join(BASE_DIR, 'database.db')
STRESS_DB = os.path.join(BASE_DIR, '../Elephant stress detector/elephant_stress.db')
FOOD_DB = os.path.join(BASE_DIR, '../Personalized Elephant Food Chain/elephant_food_chain.db')

def setup_master_db():
    print("Setting up Master DB schema...")
    conn = sqlite3.connect(MASTER_DB)
    cursor = conn.cursor()
    
    # Add stress_logs table to master
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stress_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            elephant_id INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
            stress_level INTEGER, 
            stress_probability REAL,
            FOREIGN KEY (elephant_id) REFERENCES elephants (id)
        )
    ''')
    
    # Add daily_logs (food chain) table to master
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            elephant_id INTEGER,
            temperature_c REAL,
            humidity_percent REAL,
            activity_score REAL,
            health_status TEXT,
            morning_food_kg REAL,
            evening_food_kg REAL,
            ai_remark TEXT,
            FOREIGN KEY (elephant_id) REFERENCES elephants (id)
        )
    ''')
    
    conn.commit()
    return conn

def migrate_stress_data(master_conn):
    print("Migrating Stress Data...")
    try:
        if not os.path.exists(STRESS_DB):
            print(f"Warning: {STRESS_DB} not found.")
            return
            
        stress_conn = sqlite3.connect(STRESS_DB)
        stress_cursor = stress_conn.cursor()
        
        # We'll assign all existing stress logs to elephant_id 1 for now (Raja)
        # to ensure data isn't lost but fits the new schema
        stress_cursor.execute("SELECT timestamp, stress_level, stress_probability FROM stress_logs")
        logs = stress_cursor.fetchall()
        
        master_cursor = master_conn.cursor()
        for log in logs:
            master_cursor.execute(
                "INSERT INTO stress_logs (elephant_id, timestamp, stress_level, stress_probability) VALUES (?, ?, ?, ?)",
                (1, log[0], log[1], log[2])
            )
            
        master_conn.commit()
        stress_conn.close()
        print(f"Migrated {len(logs)} stress logs.")
    except Exception as e:
        print(f"Error migrating stress data: {e}")

def migrate_food_data(master_conn):
    print("Migrating Food Chain Data...")
    try:
        if not os.path.exists(FOOD_DB):
            print(f"Warning: {FOOD_DB} not found.")
            return
            
        food_conn = sqlite3.connect(FOOD_DB)
        food_cursor = food_conn.cursor()
        
        food_cursor.execute("SELECT date, elephant_id, temperature_c, humidity_percent, activity_score, health_status, morning_food_kg, evening_food_kg, ai_remark FROM daily_logs")
        logs = food_cursor.fetchall()
        
        master_cursor = master_conn.cursor()
        for log in logs:
            master_cursor.execute(
                "INSERT INTO daily_logs (date, elephant_id, temperature_c, humidity_percent, activity_score, health_status, morning_food_kg, evening_food_kg, ai_remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                log
            )
            
        master_conn.commit()
        food_conn.close()
        print(f"Migrated {len(logs)} daily food logs.")
    except Exception as e:
        print(f"Error migrating food data: {e}")

if __name__ == '__main__':
    print("--- Starting Database Unification ---")
    master_conn = setup_master_db()
    migrate_stress_data(master_conn)
    migrate_food_data(master_conn)
    master_conn.close()
    print("--- Unification Complete ---")

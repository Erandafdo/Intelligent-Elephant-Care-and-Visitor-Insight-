import sqlite3
import datetime

DB_NAME = 'elephant_stress.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS stress_logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
                  stress_level INTEGER, 
                  stress_probability REAL)''')
    conn.commit()
    conn.close()

def log_stress(stress_level, stress_probability):
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("INSERT INTO stress_logs (stress_level, stress_probability) VALUES (?, ?)", 
                  (stress_level, stress_probability))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging to DB: {e}")

def get_recent_logs(limit=20):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM stress_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_stats_last_7_days():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    # Get logs from last 7 days
    seven_days_ago = datetime.datetime.now() - datetime.timedelta(days=7)
    c.execute("SELECT * FROM stress_logs WHERE timestamp > ? ORDER BY timestamp ASC", (seven_days_ago,))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

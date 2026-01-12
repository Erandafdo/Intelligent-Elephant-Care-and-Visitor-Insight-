import sqlite3


DB_NAME = "elephant_food_chain.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Elephants Table (Module 1)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS elephants (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER,
            weight_kg REAL,
            base_health_score INTEGER, -- 1-100
            activity_level TEXT -- Low, Medium, High
        )
    ''')
    
    # Daily Logs Table (Module 2 & 3 Output)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            elephant_id INTEGER,
            temperature_c REAL,
            humidity_percent REAL,
            activity_score REAL, -- Dynamic daily activity
            health_status TEXT, -- 'Healthy', 'Weak', 'Recovering'
            morning_food_kg REAL,
            evening_food_kg REAL,
            ai_remark TEXT,
            FOREIGN KEY (elephant_id) REFERENCES elephants (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database {DB_NAME} initialized.")

def get_connection():
    return sqlite3.connect(DB_NAME)

if __name__ == "__main__":
    init_db()

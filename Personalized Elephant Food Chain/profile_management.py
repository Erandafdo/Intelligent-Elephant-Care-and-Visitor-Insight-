import sqlite3
from database import get_connection

def seed_profiles():
    elephants = [
        (1, "Kandula", 25, 3000, 90, "Medium"),
        (2, "Sinha", 30, 3500, 95, "High"),
        (3, "Raja", 40, 4000, 80, "Low"),
        (4, "Manike", 20, 2800, 98, "Medium"),
        (5, "Indi", 50, 4200, 70, "Low") # Older, maybe weaker
    ]
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if data exists
    cursor.execute("SELECT count(*) FROM elephants")
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO elephants (id, name, age, weight_kg, base_health_score, activity_level)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', elephants)
        conn.commit()
        print("Initialized 5 Elephant Profiles.")
    else:
        print("Elephant profiles already exist.")
        
    conn.close()

def get_all_elephants():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM elephants", conn)
    conn.close()
    return df

if __name__ == "__main__":
    seed_profiles()

import sqlite3
from database import get_connection

def update_names():
    conn = get_connection()
    c = conn.cursor()
    
    updates = [
        ("Kandula", 1),
        ("Sinha", 2),
        ("Raja", 3),
        ("Manike", 4),
        ("Indi", 5)
    ]
    
    print("Updating elephant names...")
    c.executemany("UPDATE elephants SET name = ? WHERE id = ?", updates)
    
    conn.commit()
    conn.close()
    print("Names updated successfully.")

if __name__ == "__main__":
    update_names()

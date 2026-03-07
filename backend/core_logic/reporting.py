import pandas as pd
import sqlite3
import os

def get_connection():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')
    return sqlite3.connect(db_path)

def generate_daily_report(date_str):
    conn = get_connection()
    query = f"""
        SELECT e.name, d.morning_food_kg, d.evening_food_kg, d.ai_remark
        FROM daily_logs d
        JOIN elephants e ON d.elephant_id = e.id
        WHERE d.date = '{date_str}'
    """
    df = pd.read_sql(query, conn)
    conn.close()
    
    if df.empty:
        return "No data for this date."
        
    # Format for display
    df.columns = ['Elephant', 'Morning Food (kg)', 'Evening Food (kg)', 'AI Remark']
    return df

def generate_monthly_summary():
    conn = get_connection()
    query = """
        SELECT e.name, avg(d.morning_food_kg + d.evening_food_kg) as avg_daily_food
        FROM daily_logs d
        JOIN elephants e ON d.elephant_id = e.id
        GROUP BY e.name
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df

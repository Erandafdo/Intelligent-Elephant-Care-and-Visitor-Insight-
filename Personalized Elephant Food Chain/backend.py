from antigravity_core import recommend_food
from database import get_connection
import pandas as pd
from datetime import datetime

def process_daily_recommendations(date_str=None):
    """
    Runs the AI for all elephants for a specific date (default today).
    Saves the recommendation to the DB (or Updates it).
    """
    if not date_str:
        date_str = datetime.now().strftime('%Y-%m-%d')
        
    conn = get_connection()
    
    # Get Elephants
    elephants_df = pd.read_sql("SELECT * FROM elephants", conn)
    
    # Get Daily Conditions (In a real system, this comes from sensors/inputs. 
    # Here we might match it to our generated history or just use defaults if new day).
    # For simulation, let's assume we are acting on 'today' with some inputs.
    # Since we generated history, let's just create a dummy input function for 'today'.
    
    results = []
    
    for _, elephant in elephants_df.iterrows():
        # Mocking current sensors
        daily_context = {
            'temperature_c': 28, # Warm day
            'humidity_percent': 65,
            'activity_score': 1.1, # Slightly active
            'health_status': 'Healthy' if elephant['base_health_score'] > 80 else 'Weak'
        }
        
        # Call AI
        rec = recommend_food(elephant, daily_context)
        
        results.append({
            'name': elephant['name'], 
            **rec
        })
        
    conn.close()
    return results

def get_history_dataframe():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM daily_logs", conn)
    conn.close()
    return df

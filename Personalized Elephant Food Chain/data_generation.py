import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
from database import get_connection

def generate_mock_data(days=60):
    """
    Generates 2 months of synthetic history for all elephants.
    """
    conn = get_connection()
    c = conn.cursor()
    
    # Get elephants
    c.execute("SELECT id, base_health_score, activity_level FROM elephants")
    elephants = c.fetchall()
    
    start_date = datetime.now() - timedelta(days=days)
    
    data_entries = []
    
    print(f"Generating data for {len(elephants)} elephants over {days} days...")
    
    for i in range(days):
        date = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
        
        # Seasonality simulation (just random fluctuation for now)
        base_temp = 25 + random.uniform(-5, 5)
        base_humidity = 60 + random.uniform(-10, 20)
        
        for e_id, health, activity_base in elephants:
            # Random fluctuations per elephant
            # Activity Score (0.0 to 2.0)
            if activity_base == 'High':
                act_score = random.uniform(1.2, 1.8)
            elif activity_base == 'Medium':
                act_score = random.uniform(0.8, 1.3)
            else: # Low
                act_score = random.uniform(0.5, 1.0)
                
            # Health Score fluctuation (sometimes they get sick)
            daily_health = health
            if random.random() < 0.05: # 5% chance of minor dip
                daily_health -= random.randint(5, 15)
            health_status = 'Healthy' if daily_health > 80 else ('Recovering' if daily_health > 60 else 'Weak')
            
            # Simulated Food Intake (Gravity/Traditional - not AI yet, just history)
            # In history, they received fixed amounts usually.
            # We'll simulate that they ate roughly fixed amounts + some noise.
            base_food = 150 # kg
            food_intake = base_food * random.uniform(0.9, 1.1)
            morning_food = food_intake * 0.6
            evening_food = food_intake * 0.4
            
            data_entries.append((
                date, e_id, 
                round(base_temp, 1), 
                round(base_humidity, 1), 
                round(act_score, 2), 
                health_status, 
                round(morning_food, 1), 
                round(evening_food, 1), 
                "Historical Gravity Data"
            ))

    c.executemany('''
        INSERT INTO daily_logs (
            date, elephant_id, temperature_c, humidity_percent, 
            activity_score, health_status, morning_food_kg, evening_food_kg, ai_remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', data_entries)
    
    conn.commit()
    
    # Export to CSV for the user
    df = pd.read_sql("SELECT * FROM daily_logs", conn)
    df.to_csv("elephant_feeding_dataset.csv", index=False)
    print("Dataset exported to 'elephant_feeding_dataset.csv'")
    
    conn.close()
    print("Synthetic data generation complete.")

if __name__ == "__main__":
    generate_mock_data()

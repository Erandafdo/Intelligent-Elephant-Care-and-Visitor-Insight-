import pandas as pd
import numpy as np
import random

# Number of samples
NUM_SAMPLES = 1000

# Health Conditions
STATUS_CLASSES = ['Healthy', 'Infection', 'Indigestion', 'Dehydration', 'Arthritis']

def generate_sample():
    status = np.random.choice(STATUS_CLASSES, p=[0.4, 0.15, 0.15, 0.15, 0.15])
    
    # Base Vitals
    age = random.randint(5, 70)
    
    # Default Healthy Values
    temp = round(random.uniform(36.0, 37.0), 1)
    hr = random.randint(25, 35) # BPM
    rr = random.randint(4, 12) # BPM
    weight_change = round(random.uniform(-1.0, 1.0), 1) # %
    food_intake = random.randint(90, 100) # %
    stool = 'Normal'
    activity = 'Normal'
    edema = 'No_Edema'
    trunk = 'Moist'
    mucous = 'Pink'
    gait = 'Normal'
    diagnosis = 'No_Diagnosis'

    # Modify based on condition
    if status == 'Infection':
        temp = round(random.uniform(38.0, 40.0), 1)
        hr = random.randint(40, 60)
        activity = 'Lethargic'
        food_intake = random.randint(20, 60)
        diagnosis = 'Bacterial/Viral Infection'
        
    elif status == 'Indigestion':
        stool = np.random.choice(['Loose', 'Constipated', 'Undigested'])
        food_intake = random.randint(30, 70)
        activity = 'Restless'
        diagnosis = 'Colic / Digestion Issue'
        
    elif status == 'Dehydration':
        trunk = 'Dry'
        mucous = 'Pale'
        rr = random.randint(10, 15) # Maybe slight panting?
        diagnosis = 'Severe Dehydration'
        
    elif status == 'Arthritis':
        gait = np.random.choice(['Stiff', 'Limping', 'Slow'])
        edema = np.random.choice(['Legs', 'Joints', 'No_Edema'])
        activity = 'Low'
        diagnosis = 'Joint Inflammation'

    return {
        'Age': age,
        'Temperature_C': temp,
        'Heart_Rate_BPM': hr,
        'Respiratory_Rate_BPM': rr,
        'Weight_Change_Percent': weight_change,
        'Food_Intake_Percent': food_intake,
        'Stool_Consistency': stool,
        'Activity_Level': activity,
        'Edema': edema,
        'Trunk_Moisture': trunk,
        'Mucous_Membrane': mucous,
        'Gait_Score': gait,
        'Health_Status': status,
        'Diagnosis': diagnosis
    }

data = [generate_sample() for _ in range(NUM_SAMPLES)]
df = pd.DataFrame(data)

# Save to CSV
df.to_csv('elephant_health_data_advanced.csv', index=False)
print("Advanced synthetic data generated: elephant_health_data_advanced.csv")

"""
health_predictor.py
-------------------
Encapsulates all AI model logic for the Elephant Health & Diagnosis prediction pipeline.
Loads the two trained models once at startup and exposes a clean predict() function
that the Flask API calls to get a status and diagnosis for a given set of vitals.
"""

import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEALTH_STATUS_MODEL_PATH = os.path.join(BASE_DIR, 'elephant_health_model.pkl')
DIAGNOSIS_MODEL_PATH = os.path.join(BASE_DIR, 'diagnosis_model.pkl')

# -----------------------------------------------------------------
# Load models once at module import time
# -----------------------------------------------------------------
_health_model = None
_diagnosis_model = None

try:
    if os.path.exists(HEALTH_STATUS_MODEL_PATH):
        _health_model = joblib.load(HEALTH_STATUS_MODEL_PATH)
        print("[HealthPredictor] Health Status model loaded successfully.")
    else:
        print(f"[HealthPredictor] WARNING: Model not found at {HEALTH_STATUS_MODEL_PATH}")
except Exception as e:
    print(f"[HealthPredictor] ERROR loading health status model: {e}")

try:
    if os.path.exists(DIAGNOSIS_MODEL_PATH):
        _diagnosis_model = joblib.load(DIAGNOSIS_MODEL_PATH)
        print("[HealthPredictor] Diagnosis model loaded successfully.")
    else:
        print(f"[HealthPredictor] WARNING: Diagnosis model not found at {DIAGNOSIS_MODEL_PATH}")
except Exception as e:
    print(f"[HealthPredictor] ERROR loading diagnosis model: {e}")


def predict(elephant_age: int, vitals: dict) -> dict:
    """
    Runs the health status and diagnosis AI models given an elephant's age and vitals.

    Parameters
    ----------
    elephant_age : int
        The age of the elephant in years.
    vitals : dict
        A dict with the following keys (matching the training feature names):
            temperature, heart_rate, respiratory_rate, weight_change,
            food_intake, stool_consistency, activity_level, edema,
            trunk_moisture, mucous_membrane, gait_score

    Returns
    -------
    dict with keys:
        predicted_status  (str) – e.g. "Healthy", "Warning", "Critical"
        predicted_diagnosis (str) – e.g. "Severe Dehydration", "No_Diagnosis"
    """
    predicted_status = "Unknown"
    predicted_diagnosis = "None"

    if _health_model is None:
        return {
            "predicted_status": predicted_status,
            "predicted_diagnosis": predicted_diagnosis
        }

    input_data = pd.DataFrame([{
        'Age':                    elephant_age,
        'Temperature_C':          float(vitals.get('temperature', 0)),
        'Heart_Rate_BPM':         float(vitals.get('heart_rate', 0)),
        'Respiratory_Rate_BPM':   float(vitals.get('respiratory_rate', 0)),
        'Weight_Change_Percent':  float(vitals.get('weight_change', 0)),
        'Food_Intake_Percent':    float(vitals.get('food_intake', 0)),
        'Stool_Consistency':      vitals.get('stool_consistency', 'Normal'),
        'Activity_Level':         vitals.get('activity_level', 'High'),
        'Edema':                  vitals.get('edema', 'None'),
        'Trunk_Moisture':         vitals.get('trunk_moisture', 'Moist'),
        'Mucous_Membrane':        vitals.get('mucous_membrane', 'Pink'),
        'Gait_Score':             vitals.get('gait_score', 'Normal'),
    }])

    try:
        predicted_status = _health_model.predict(input_data)[0]
    except Exception as e:
        print(f"[HealthPredictor] Prediction error (status model): {e}")
        predicted_status = "Error"

    if _diagnosis_model is not None:
        try:
            predicted_diagnosis = _diagnosis_model.predict(input_data)[0]
        except Exception as e:
            print(f"[HealthPredictor] Prediction error (diagnosis model): {e}")
            predicted_diagnosis = "None"

    return {
        "predicted_status": str(predicted_status),
        "predicted_diagnosis": str(predicted_diagnosis)
    }


def is_loaded() -> bool:
    """Returns True if at least the health status model was loaded correctly."""
    return _health_model is not None

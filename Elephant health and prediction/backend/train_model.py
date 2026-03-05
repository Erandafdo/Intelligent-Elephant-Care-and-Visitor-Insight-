import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Load Data
try:
    df = pd.read_csv('elephant_health_data_advanced.csv')
    print("Data loaded successfully.")
except FileNotFoundError:
    print("Error: 'elephant_health_data_advanced.csv' not found. Run generate_data.py first.")
    exit()

# Features and Targets
X = df.drop(columns=['Health_Status', 'Diagnosis'])
y_status = df['Health_Status']
y_diagnosis = df['Diagnosis']

# DEBUG: Check for NaNs
print("Checking for NaNs in dataset...")
print(X.isnull().sum())
print("-" * 20)

# Drop rows with NaNs if any (although generation should be clean)
if df.isnull().values.any():
    print("Warning: NaNs found. Dropping missing values...")
    df = df.dropna()
    X = df.drop(columns=['Health_Status', 'Diagnosis'])
    y_status = df['Health_Status']
    y_diagnosis = df['Diagnosis']

# Define Preprocessing
# Categorical columns need encoding
categorical_cols = ['Stool_Consistency', 'Activity_Level', 'Edema', 'Trunk_Moisture', 'Mucous_Membrane', 'Gait_Score']
numerical_cols = ['Age', 'Temperature_C', 'Heart_Rate_BPM', 'Respiratory_Rate_BPM', 'Weight_Change_Percent', 'Food_Intake_Percent']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ])

# Pipeline 1: Health Status Classifier
model_status = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Pipeline 2: Diagnosis Classifier
model_diagnosis = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Split Data
X_train, X_test, y_status_train, y_status_test, y_diagnosis_train, y_diagnosis_test = train_test_split(
    X, y_status, y_diagnosis, test_size=0.2, random_state=42
)

# Train Model 1 (Status)
print("\nTraining Health Status Model...")
model_status.fit(X_train, y_status_train)
y_pred_status = model_status.predict(X_test)
print(f"Status Model Accuracy: {accuracy_score(y_status_test, y_pred_status):.2f}")
print(classification_report(y_status_test, y_pred_status))

# Train Model 2 (Diagnosis)
print("\nTraining Diagnosis Model...")
model_diagnosis.fit(X_train, y_diagnosis_train)
y_pred_diagnosis = model_diagnosis.predict(X_test)
print(f"Diagnosis Model Accuracy: {accuracy_score(y_diagnosis_test, y_pred_diagnosis):.2f}")

# Save Models
APP_DIR = 'elephant_app'
if not os.path.exists(APP_DIR):
    os.makedirs(APP_DIR)

joblib.dump(model_status, os.path.join(APP_DIR, 'elephant_health_model.pkl'))
joblib.dump(model_diagnosis, os.path.join(APP_DIR, 'diagnosis_model.pkl'))

print(f"\nModels saved to {APP_DIR}/directory.")

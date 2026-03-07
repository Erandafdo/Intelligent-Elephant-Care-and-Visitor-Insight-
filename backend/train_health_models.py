"""
train_health_models.py
----------------------
Trains both the Health Status and Diagnosis prediction models
from elephant_health_data_advanced.csv and saves them as .pkl files.

Run from the project root:
    backend/.venv/bin/python backend/train_health_models.py
"""

import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib

# ─── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'datasets', 'elephant_health_data_advanced.csv')
STATUS_MODEL_OUT = os.path.join(BASE_DIR, 'elephant_health_model.pkl')
DIAGNOSIS_MODEL_OUT = os.path.join(BASE_DIR, 'diagnosis_model.pkl')

print("=" * 60)
print("  Elephant Health AI – Model Training Script")
print("=" * 60)

# ─── Load Data ─────────────────────────────────────────────────────────────────
df = pd.read_csv(DATASET_PATH)
print(f"\n✅ Loaded dataset: {len(df)} rows, {len(df.columns)} columns")
print(f"   Columns: {list(df.columns)}\n")

# ─── Feature / Target Split ────────────────────────────────────────────────────
FEATURE_COLS = [
    'Age', 'Temperature_C', 'Heart_Rate_BPM', 'Respiratory_Rate_BPM',
    'Weight_Change_Percent', 'Food_Intake_Percent',
    'Stool_Consistency', 'Activity_Level', 'Edema',
    'Trunk_Moisture', 'Mucous_Membrane', 'Gait_Score'
]

STATUS_TARGET    = 'Health_Status'
DIAGNOSIS_TARGET = 'Diagnosis'

X = df[FEATURE_COLS]
y_status    = df[STATUS_TARGET]
y_diagnosis = df[DIAGNOSIS_TARGET]

# ─── Preprocessor: One-Hot Encode categoricals, pass numerics through ──────────
CAT_COLS = ['Stool_Consistency', 'Activity_Level', 'Edema',
            'Trunk_Moisture', 'Mucous_Membrane', 'Gait_Score']
NUM_COLS = ['Age', 'Temperature_C', 'Heart_Rate_BPM', 'Respiratory_Rate_BPM',
            'Weight_Change_Percent', 'Food_Intake_Percent']

preprocessor = ColumnTransformer(transformers=[
    ('num', 'passthrough', NUM_COLS),
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CAT_COLS)
])

# ─── Train / Test Split ────────────────────────────────────────────────────────
X_train, X_test, ys_train, ys_test, yd_train, yd_test = train_test_split(
    X, y_status, y_diagnosis, test_size=0.2, random_state=42, stratify=y_status
)

print(f"Training set : {len(X_train)} rows")
print(f"Test set     : {len(X_test)} rows\n")

# ─── Model 1: Health Status (Healthy / Infection / Dehydration / etc.) ────────
print("─" * 60)
print("  Training Model 1: Health Status Classifier")
print("─" * 60)

status_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        random_state=42,
        class_weight='balanced'
    ))
])

status_pipeline.fit(X_train, ys_train)
ys_pred = status_pipeline.predict(X_test)
status_accuracy = accuracy_score(ys_test, ys_pred)

print(f"\n✅ Health Status Model Accuracy: {status_accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(ys_test, ys_pred))

# Cross-validation
cv_scores = cross_val_score(status_pipeline, X, y_status, cv=5, scoring='accuracy')
print(f"5-Fold CV Accuracy: {cv_scores.mean() * 100:.2f}% ± {cv_scores.std() * 100:.2f}%")

# ─── Model 2: Diagnosis ────────────────────────────────────────────────────────
print("\n" + "─" * 60)
print("  Training Model 2: Diagnosis Classifier")
print("─" * 60)

# Clone preprocessor for second pipeline
preprocessor2 = ColumnTransformer(transformers=[
    ('num', 'passthrough', NUM_COLS),
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CAT_COLS)
])

diagnosis_pipeline = Pipeline([
    ('preprocessor', preprocessor2),
    ('classifier', GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    ))
])

diagnosis_pipeline.fit(X_train, yd_train)
yd_pred = diagnosis_pipeline.predict(X_test)
diag_accuracy = accuracy_score(yd_test, yd_pred)

print(f"\n✅ Diagnosis Model Accuracy: {diag_accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(yd_test, yd_pred))

cv_scores2 = cross_val_score(diagnosis_pipeline, X, y_diagnosis, cv=5, scoring='accuracy')
print(f"5-Fold CV Accuracy: {cv_scores2.mean() * 100:.2f}% ± {cv_scores2.std() * 100:.2f}%")

# ─── Save Models ───────────────────────────────────────────────────────────────
print("\n" + "─" * 60)
joblib.dump(status_pipeline, STATUS_MODEL_OUT)
print(f"✅ Saved Health Status model → {STATUS_MODEL_OUT}")

joblib.dump(diagnosis_pipeline, DIAGNOSIS_MODEL_OUT)
print(f"✅ Saved Diagnosis model     → {DIAGNOSIS_MODEL_OUT}")

print("\n✅ Training complete. Both .pkl files have been updated.")
print("   Restart the Flask backend to load the new models.\n")

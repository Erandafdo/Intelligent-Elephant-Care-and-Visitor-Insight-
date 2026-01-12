import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def train():
    data_path = 'data/dataset.csv'
    model_path = 'models/stress_detector.pkl'
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Run data_collector.py first.")
        return

    # Load Data
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples.")
    
    X = df.drop('label', axis=1)
    y = df['label']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Classifier
    # Random Forest is robust and handles non-linear relationships well
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    print("Model Evaluation:")
    print(classification_report(y_test, y_pred))
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    
    # Save Model
    joblib.dump(clf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train()

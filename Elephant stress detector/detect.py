import cv2
import numpy as np
import joblib
import pandas as pd
from feature_extractor import FeatureExtractor
import time

def main():
    model_path = 'models/stress_detector.pkl'
    
    try:
        model = joblib.load(model_path)
        print("Model loaded successfully.")
    except FileNotFoundError:
        print("Error: Model not found. Run train_model.py first.")
        return

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return

    # Initialize Optical Flow
    ret, frame1 = cap.read()
    if not ret: return
    prvs = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
    
    feature_extractor = FeatureExtractor(buffer_size=30)
    feature_names = feature_extractor.get_feature_names()
    
    stress_probability = 0.0
    status_text = "Initializing..."
    color_status = (255, 255, 255)

    print("Elephant Stress Detector Running... Press 'q' to quit.")

    while True:
        ret, frame2 = cap.read()
        if not ret: break
        
        next_frame = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
        
        # Calculate Optical Flow
        flow = cv2.calcOpticalFlowFarneback(prvs, next_frame, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        
        # Track dominant movement
        mask = mag > 2.0
        if np.any(mask):
            coords = np.argwhere(mask)
            y_center = np.mean(coords[:, 0])
            x_center = np.mean(coords[:, 1])
            centroid = (x_center, y_center)
            cv2.circle(frame2, (int(x_center), int(y_center)), 10, (0, 255, 255), -1)
        else:
            centroid = None
            
        feature_extractor.update(centroid)
        features = feature_extractor.extract_features()
        
        if features is not None:
            # Prepare dataframe for prediction (sklearn warns if feature names missing)
            df_features = pd.DataFrame([features], columns=feature_names)
            prediction = model.predict(df_features)[0]
            probs = model.predict_proba(df_features)[0]
            
            stress_probability = probs[1] # Probability of Class 1 (Stressed)
            
            if prediction == 1:
                status_text = f"STRESSED detected ({stress_probability:.2f})"
                color_status = (0, 0, 255) # Red
            else:
                status_text = f"Normal Behavior ({1-stress_probability:.2f})"
                color_status = (0, 255, 0) # Green
        
        # UI Overlay
        cv2.rectangle(frame2, (0, 0), (640, 80), (0, 0, 0), -1)
        cv2.putText(frame2, "Asian Elephant Stress Detector", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame2, status_text, (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 1, color_status, 2)
        
        # Visualization of Oscillation (if available)
        if features is not None:
            osc_energy = features[3]
            cv2.putText(frame2, f"Oscillation: {osc_energy:.1f}", (400, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

        cv2.imshow('Live Detection', frame2)
        
        k = cv2.waitKey(1) & 0xFF
        if k == ord('q'):
            break
            
        prvs = next_frame

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

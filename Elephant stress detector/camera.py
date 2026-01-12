import cv2
import numpy as np
import joblib
import pandas as pd
import time
from feature_extractor import FeatureExtractor
from database import log_stress

class VideoCamera(object):
    def __init__(self):
        self.video = cv2.VideoCapture(0)
        
        # Initialize Feature Extraction & Model
        self.model_path = 'models/stress_detector.pkl'
        try:
            self.model = joblib.load(self.model_path)
            self.model_loaded = True
        except:
            self.model_loaded = False
            print("Model not found")

        self.feature_extractor = FeatureExtractor(buffer_size=30)
        self.feature_names = self.feature_extractor.get_feature_names()
        
        # Optical Flow init
        ret, self.prev_frame = self.video.read()
        if ret:
            self.prvs = cv2.cvtColor(self.prev_frame, cv2.COLOR_BGR2GRAY)
        else:
            self.prvs = None
            
        self.last_log_time = 0

    def __del__(self):
        self.video.release()

    def get_frame(self):
        ret, frame = self.video.read()
        if not ret:
            return None

        # Process Frame
        status_text = "Analysis Active"
        color_status = (255, 255, 255)
        
        if self.prvs is not None:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Optical Flow
            flow = cv2.calcOpticalFlowFarneback(self.prvs, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])
            
            mask = mag > 2.0
            if np.any(mask):
                coords = np.argwhere(mask)
                y_center = np.mean(coords[:, 0])
                x_center = np.mean(coords[:, 1])
                centroid = (x_center, y_center)
                cv2.circle(frame, (int(x_center), int(y_center)), 10, (0, 255, 255), -1)
            else:
                centroid = None
            
            self.feature_extractor.update(centroid)
            features = self.feature_extractor.extract_features()
            
            if features is not None and self.model_loaded:
                df_features = pd.DataFrame([features], columns=self.feature_names)
                prediction = self.model.predict(df_features)[0]
                probs = self.model.predict_proba(df_features)[0]
                
                stress_prob = probs[1]
                
                if prediction == 1:
                    status_text = f"STRESSED: {stress_prob*100:.1f}%"
                    color_status = (0, 0, 255) # Red
                    cv2.rectangle(frame, (0, 0), (640, 640), (0, 0, 255), 10) # Red Border
                else:
                    status_text = f"NORMAL: {(1-stress_prob)*100:.1f}%"
                    color_status = (0, 255, 0) # Green
                
                # Log to database every 1 second
                current_time = time.time()
                if current_time - self.last_log_time > 1.0:
                    log_stress(int(prediction), float(stress_prob))
                    self.last_log_time = current_time
            
            self.prvs = gray

        # Overlay Info
        cv2.putText(frame, status_text, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color_status, 2)
        
        ret, jpeg = cv2.imencode('.jpg', frame)
        return jpeg.tobytes()

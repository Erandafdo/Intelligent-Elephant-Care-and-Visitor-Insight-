import cv2
import numpy as np
import csv
import time
import os
from feature_extractor import FeatureExtractor

def main():
    # settings
    output_file = 'data/dataset.csv'
    
    # Initialize Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return

    # Basic Motion Detection Setup
    ret, frame1 = cap.read()
    if not ret: return
    prvs = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
    hsv = np.zeros_like(frame1)
    hsv[..., 1] = 255

    feature_extractor = FeatureExtractor(buffer_size=30)
    
    # Prepare CSV file
    file_exists = os.path.isfile(output_file)
    with open(output_file, 'a', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(feature_extractor.get_feature_names() + ["label"])

    print("Data Collector Started")
    print("Press '0' to record as NORMAL (Variable behavior)")
    print("Press '1' to record as STRESSED (Repetitive/Swaying)")
    print("Press 'q' to QUIT")

    recording_label = None
    
    while True:
        ret, frame2 = cap.read()
        if not ret: break
        
        next_frame = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
        
        # Simple Optical Flow to find movement center
        flow = cv2.calcOpticalFlowFarneback(prvs, next_frame, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        
        # Calculate magnitude of flow
        mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        
        # Find center of movement (weighted average by magnitude)
        # Threshold magnitude to ignore noise
        mask = mag > 2.0
        if np.any(mask):
            coords = np.argwhere(mask)
            # coords are (y, x)
            y_center = np.mean(coords[:, 0])
            x_center = np.mean(coords[:, 1])
            centroid = (x_center, y_center)
            
            # Draw circle at centroid
            cv2.circle(frame2, (int(x_center), int(y_center)), 10, (0, 0, 255), -1)
        else:
            centroid = None
            
        # Update Features
        feature_extractor.update(centroid)
        features = feature_extractor.extract_features()
        
        # Display Status
        cv2.putText(frame2, f"Recording: {recording_label}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        if features is not None and recording_label is not None:
             with open(output_file, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(features + [recording_label])
        
        cv2.imshow('Elephant Data Collector', frame2)
        
        k = cv2.waitKey(1) & 0xFF
        if k == ord('q'):
            break
        elif k == ord('0'):
            recording_label = 0 # Normal
        elif k == ord('1'):
            recording_label = 1 # Stressed
        elif k == ord('s'):
            recording_label = None # Stop Recording

        prvs = next_frame

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

import numpy as np
from collections import deque

class FeatureExtractor:
    def __init__(self, buffer_size=30):
        """
        Initialize the feature extractor.
        buffer_size: Number of frames to keep in history to calculate statistics.
        """
        self.buffer_size = buffer_size
        self.centroids = deque(maxlen=buffer_size)

    def update(self, centroid):
        """
        Add a new centroid (x, y) to the buffer.
        """
        if centroid is not None:
            self.centroids.append(centroid)

    def extract_features(self):
        """
        Calculate features from the history of centroids.
        Features designed to detect repetitive/swaying motion (stress) vs random motion.
        """
        if len(self.centroids) < self.buffer_size:
            return None

        # Convert to numpy array
        data = np.array(self.centroids)
        
        # Calculate deltas (speed)
        deltas = np.diff(data, axis=0)
        speeds = np.linalg.norm(deltas, axis=1)
        
        # 1. Average Speed
        avg_speed = np.mean(speeds)
        
        # 2. Variance in X and Y (Swaying usually covers a consistent area)
        var_x = np.var(data[:, 0])
        var_y = np.var(data[:, 1])
        
        # 3. Frequency Analysis (FFT) - Detect Repetitiveness
        # We look at X-axis oscillation (common in swaying)
        x_positions = data[:, 0]
        x_positions_centered = x_positions - np.mean(x_positions)
        
        fft_vals = np.fft.rfft(x_positions_centered)
        fft_amps = np.abs(fft_vals)
        
        # Dominant frequency amplitude (energy in specific oscillation)
        # Skip DC component at index 0
        if len(fft_amps) > 1:
            max_oscillation_energy = np.max(fft_amps[1:])
        else:
            max_oscillation_energy = 0
            
        return [avg_speed, var_x, var_y, max_oscillation_energy]

    def get_feature_names(self):
        return ["avg_speed", "var_x", "var_y", "oscillation_energy"]

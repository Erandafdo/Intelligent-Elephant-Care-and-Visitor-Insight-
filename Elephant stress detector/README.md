# Pinnawala Elephant Stress Detector - Research Tool

A computer vision-based AI application designed for the **Pinnawala Elephant Orphanage** to detect stress in semi-tamed Asian elephants. The system analyzes live video feeds to identify **stereotypic swaying behavior** (weaving), a primary indicator of stress in captive elephants.

## 📂 Dataset Details

The AI model is trained on movement data that quantifies "swaying" versus "normal" behavior.

- **File Path**: `data/dataset.csv`
- **Format**: CSV (Comma Separated Values)
- **Size**: ~1000 samples (Synthetic baseline provided)

### Features (Columns)
The dataset contains extracted motion features from video frames:

| Feature Name | Description | Significance |
| :--- | :--- | :--- |
| `avg_speed` | Mean speed of the dominant moving object | Differentiates static vs active states. |
| `var_x` | Variance in horizontal (X) movement | High variance suggests wide side-to-side motion (swaying). |
| `var_y` | Variance in vertical (Y) movement | Low variance expected in swaying (horizontal only). |
| `oscillation_energy` | Dominant frequency amplitude (FFT) | **Critical Feature**: Measures the "rhythm" of movement. High energy at specific frequencies indicates repetitive stereotypic behavior. |
| `label` | Classification Target | `0` = Normal / Variable Behavior<br>`1` = Stressed / Stereotypic Swaying |

---

## 🚀 How to Run on Another Device

To deploy this tool on a research laptop or field device (e.g., Raspberry Pi with Camera, Jetson Nano, or standard Laptop), follow these steps:

### 1. Prerequisites
- **Python 3.9** or higher installed.
- A **Webcam** or connected video input.

### 2. Installation
Copy this entire project folder to the new device. Then, open a terminal/command prompt inside the folder and run:

```bash
# Install required libraries
pip install -r requirements.txt
```

*Note: If you are on a Raspberry Pi/Jetson, you may need to install system dependencies for OpenCV first (e.g., `sudo apt-get install python3-opencv`).*

### 3. Usage

#### Option A: Web Dashboard (Recommended)
This launches the full research interface.
```bash
python3 app.py
```
- Open your web browser and go to: `http://localhost:5001`
- The dashboard will start streaming video and analyzing behavior in real-time.

#### Option B: Headless / CLI Mode
If the device has no screen or web browser (background recording):
```bash
python3 detect.py
```
- A simple video window will pop up (requires a connected monitor).

### 4. Retraining (Optional)
If you collect new data at Pinnawala using `data_collector.py`, you can retrain the model to improve accuracy:
```bash
# 1. Collect real data (press '0' for normal, '1' for stressed)
python3 data_collector.py

# 2. Train the model with the new data
python3 train_model.py
```

## 🛠️ Project Structure
- `app.py`: Flask Web Server (User Interface).
- `camera.py`: Real-time video processing engine.
- `models/stress_detector.pkl`: The trained Random Forest AI model.
- `feature_extractor.py`: Mathematical logic for analyzing motion graphs.

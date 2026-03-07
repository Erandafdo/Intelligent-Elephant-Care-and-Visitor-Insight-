# 🐘 Intelligent Elephant Care & Visitor Insight System

A unified, AI-powered web application for monitoring and managing elephant health, nutrition, and stress at the Pinnawala Elephant Orphanage. Built with a React frontend and a Flask backend, all data is stored in a single SQLite database.

---

## 📋 Table of Contents
- [System Overview](#-system-overview)
- [Project Structure](#-project-structure)
- [Modules](#-modules)
- [AI Models](#-ai-models)
- [Datasets](#-datasets)
- [Database Schema](#-database-schema)
- [Tech Stack](#-tech-stack)
- [How to Run on Another PC](#-how-to-run-on-another-pc)
- [API Reference](#-api-reference)

---

## 🧠 System Overview

The system consolidates three AI-driven elephant care functionalities into one seamless web interface:

| Feature | Description |
|---|---|
| **🐘 Health Profiles** | Full elephant profiles, AI health status prediction, daily vitals logging |
| **🩺 Stress Detector** | Real-time video-based stress detection using a webcam feed |
| **🌿 Food Chain** | AI-optimised personalised feeding plans, log tracking, 7-day forecasts |

---

## 📁 Project Structure

```
Intelligent-Elephant-Care-and-Visitor-Insight-/
│
├── backend/                            # Flask API Server
│   ├── app.py                          # Main application entry point (all REST API routes)
│   ├── init_db.py                      # Database initialisation script
│   ├── migrate_db.py                   # Database migration script
│   ├── train_health_models.py          # AI model training script
│   ├── food_chain_streamlit.py         # Legacy Streamlit app (replaced by native React)
│   ├── elephant_health_model.pkl       # Trained health status classifier
│   ├── diagnosis_model.pkl             # Trained diagnosis classifier
│   ├── database.db                     # Unified SQLite database
│   ├── requirements.txt                # Python dependencies
│   │
│   ├── core_logic/                     # AI & Business Logic Modules
│   │   ├── health_predictor.py         # Loads & runs health/diagnosis AI models
│   │   ├── antigravity_core.py         # AI food quantity calculation engine
│   │   ├── food_chain_logic.py         # Herd-level daily food recommendation logic
│   │   ├── camera.py                   # Webcam video feed with real-time stress overlay
│   │   ├── detect.py                   # Computer vision stress detection pipeline
│   │   ├── feature_extractor.py        # Motion & optical flow feature extraction
│   │   └── reporting.py                # Daily/monthly feeding report generator
│   │
│   ├── datasets/                       # Training datasets
│   │   ├── elephant_health_data_advanced.csv   # 1,200-row health training data
│   │   └── elephant_feeding_dataset.csv        # 900-row feeding training data
│   │
│   └── models/
│       └── stress_detector.pkl         # Trained stress detection model (computer vision)
│
└── frontend/                           # React Web Application (Vite)
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                     # Application router
        ├── main.jsx                    # React entry point
        ├── index.css                   # Global styles / design system
        │
        ├── pages/
        │   ├── Home.jsx                # Landing / login gateway
        │   ├── Login.jsx               # Authentication page
        │   ├── Dashboard.jsx           # Herd overview with all elephants
        │   ├── Profile.jsx             # Individual elephant health profile & log form
        │   ├── StressDetector.jsx      # Real-time stress monitoring page
        │   ├── FoodChain.jsx           # Food chain log, AI recommendation, forecast
        │   ├── AddElephant.jsx         # Add new elephant profile form
        │   └── EditElephant.jsx        # Edit existing elephant profile
        │
        ├── components/
        │   ├── Navigation.jsx          # Shared top navigation bar
        │   ├── ProfileHeader.jsx       # Elephant profile card (used across pages)
        │   └── HerdReport.jsx          # Herd health summary report component
        │
        └── utils/
            └── api.js                  # Axios API client (base URL + credentials)
```

---

## 🧩 Modules

### 1. 🐘 Health Profiles & Daily Logging
- View individual elephant profiles (name, age, gender, weight, notes)
- Log daily vitals: temperature, heart rate, respiratory rate, weight change, food intake, stool consistency, activity level, edema, trunk moisture, mucous membrane, gait
- AI instantly predicts **Health Status** (Healthy / Indigestion / Infection / Arthritis / Dehydration) and **Diagnosis** (No_Diagnosis / Bacterial/Viral Infection / Colic & Digestion Issue / Severe Dehydration / Joint Inflammation)
- Displays **AI Symptom Analysis** and **Recommended Action** from the clinical knowledge base
- Herd Report page shows all elephants needing attention with quick-access links

### 2. 🩺 Stress Detector
- Real-time webcam video feed streams from the backend via MJPEG
- Computer vision pipeline extracts motion features using Optical Flow
- Random Forest model classifies stress in real time
- Displays stress probability overlay on the live feed
- Logs stress events to the database for history review

### 3. 🌿 Food Chain (Personalized Feeding)
- Select an elephant to log daily feeding data (morning/evening food, condition)
- **AI Recommendation tab**: Input today's conditions → AI calculates optimal daily food portions using the Antigravity nutritional engine
- **History tab**: View last 30 feeding records in a detailed table
- **7-Day Forecast tab**: AI-projected feeding schedule for the week ahead
- **Overview page** (no elephant selected): Sanctuary-wide stats and daily feeding report generator

---

## 🤖 AI Models

### Health Status Classifier (`elephant_health_model.pkl`)
| Property | Value |
|---|---|
| Algorithm | Random Forest (200 estimators) |
| Training Data | `elephant_health_data_advanced.csv` (1,200 rows) |
| Test Accuracy | **100%** |
| 5-Fold CV | **99.58% ± 0.46%** |
| Output Classes | `Healthy`, `Infection`, `Dehydration`, `Indigestion`, `Arthritis` |

### Diagnosis Classifier (`diagnosis_model.pkl`)
| Property | Value |
|---|---|
| Algorithm | Gradient Boosting (200 estimators) |
| Training Data | `elephant_health_data_advanced.csv` (1,200 rows) |
| Test Accuracy | **100%** |
| 5-Fold CV | **99.25% ± 0.81%** |
| Output Classes | `No_Diagnosis`, `Bacterial/Viral Infection`, `Colic / Digestion Issue`, `Severe Dehydration`, `Joint Inflammation` |

### Stress Detector (`models/stress_detector.pkl`)
| Property | Value |
|---|---|
| Algorithm | Random Forest |
| Input | Optical Flow motion features (30-frame buffer) |
| Output | Binary: `0` (Normal) / `1` (Stressed) with probability |

### Antigravity Food Engine (`core_logic/antigravity_core.py`)
- Rule-based nutritional calculation engine
- Base food = 5% of elephant body weight
- Multiplied by activity modifier, weather modifier, and health modifier
- Splits daily food 60% morning / 40% evening

---

## 📊 Datasets

### `elephant_health_data_advanced.csv`
| Column | Type | Description |
|---|---|---|
| Age | Integer | Elephant age in years |
| Temperature_C | Float | Body temperature in Celsius |
| Heart_Rate_BPM | Integer | Heart rate |
| Respiratory_Rate_BPM | Integer | Respiratory rate |
| Weight_Change_Percent | Float | % weight change |
| Food_Intake_Percent | Integer | % of normal food consumed |
| Stool_Consistency | String | Normal / Loose / Constipated |
| Activity_Level | String | High / Moderate / Low (Lethargic) |
| Edema | String | None / Mild / Severe |
| Trunk_Moisture | String | Moist / Dry |
| Mucous_Membrane | String | Pink / Pale / Dry/Tacky |
| Gait_Score | String | Normal / Stiff / Lameness |
| Health_Status | String | **Target label** (5 classes) |
| Diagnosis | String | **Target label** (5 classes) |

> 1,200 rows — class-balanced across 5 health conditions.

### `elephant_feeding_dataset.csv`
| Column | Description |
|---|---|
| elephant_id | Reference to elephant |
| date | Log date |
| temperature_c | Ambient temperature |
| humidity_percent | Ambient humidity |
| activity_score | Daily activity multiplier |
| health_status | Healthy / Weak / Recovering |
| morning_food_kg | Morning meal in KG |
| evening_food_kg | Evening meal in KG |
| ai_remark | AI-generated nutritional note |

> 900 rows of historical feeding data.

---

## 🗄️ Database Schema

**Single unified SQLite database:** `backend/database.db`

```sql
-- Elephant profiles
elephants (id, name, age, gender, weight_kg, height_m, special_notes, image_url, base_health_score, activity_level)

-- Daily health vitals + AI predictions
health_logs (id, elephant_id, timestamp, temperature, heart_rate, respiratory_rate, weight_change, food_intake, stool_consistency, activity_level, edema, trunk_moisture, mucous_membrane, gait_score, predicted_status, diagnosis)

-- Daily feeding records
daily_logs (id, date, elephant_id, temperature_c, humidity_percent, activity_score, health_status, morning_food_kg, evening_food_kg, ai_remark)

-- Stress detection events
stress_logs (id, elephant_id, timestamp, stress_level, stress_probability)

-- System users (authenticated veterinarians / caretakers)
users (id, username, password_hash)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Vite 6, Vanilla CSS |
| **Backend** | Python 3, Flask, Flask-CORS |
| **Database** | SQLite (via Python `sqlite3`) |
| **AI / ML** | scikit-learn (Random Forest, Gradient Boosting), joblib, pandas, numpy |
| **Computer Vision** | OpenCV (optical flow, MJPEG streaming) |
| **HTTP Client** | Axios |

---

## 🚀 How to Run on Another PC

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**
- **Git**
- A **webcam** (for Stress Detector feature)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Erandafdo/Intelligent-Elephant-Care-and-Visitor-Insight-.git
cd Intelligent-Elephant-Care-and-Visitor-Insight-
```

---

### Step 2 — Set Up the Backend

```bash
cd backend

# Create a Python virtual environment
python3 -m venv .venv

# Activate it
# macOS / Linux:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Initialise the Database

```bash
python init_db.py
```

> This creates `backend/database.db` with all required tables and a default admin user.

#### (Optional) Retrain AI Models

If you want to retrain the health prediction models from the dataset:

```bash
python train_health_models.py
```

> This will overwrite `elephant_health_model.pkl` and `diagnosis_model.pkl` with freshly trained models and print accuracy reports.

#### Start the Backend Server

```bash
python app.py
```

The Flask API will start at: **http://127.0.0.1:5005**

You should see:
```
[HealthPredictor] Health Status model loaded successfully.
[HealthPredictor] Diagnosis model loaded successfully.
 * Running on http://127.0.0.1:5005
```

---

### Step 3 — Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The React app will start at: **http://localhost:5173**

---

### Step 4 — Open the App

Go to **http://localhost:5173** in your browser.

**Default login credentials:**
| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

---

### ✅ Summary of Commands (Quick Reference)

```bash
# Terminal 1 — Backend
cd backend && source .venv/bin/activate && python app.py

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/check` | Check session |
| GET | `/api/dashboard` | Get all elephants with status |
| POST | `/api/elephants` | Add new elephant |
| GET | `/api/elephants/:id` | Get elephant profile + logs |
| PUT | `/api/elephants/:id` | Edit elephant profile |
| DELETE | `/api/elephants/:id` | Delete elephant & logs |
| POST | `/api/elephants/:id/health` | Log daily health vitals (triggers AI) |
| POST | `/api/elephants/:id/food` | Log daily feeding data |
| GET | `/api/food/overview` | Herd-wide food statistics |
| GET | `/api/food/history/:id` | Feeding history for elephant |
| POST | `/api/food/ai-recommend` | Get AI food recommendation |
| GET | `/api/food/forecast/:id` | 7-day feeding forecast |
| GET | `/api/food/report/:date` | Daily feeding report for a date |
| GET | `/api/video_feed` | MJPEG webcam stream (Stress Detector) |
| GET | `/api/history` | All stress detection history |
| GET | `/api/history/:id` | Stress history for specific elephant |

---

## 👥 Contributors

- **Eranda** — System Architect, Full Stack Development, AI Integration

---

## 📄 License

This project is developed as part of a SLIIT academic research project on intelligent wildlife care systems.

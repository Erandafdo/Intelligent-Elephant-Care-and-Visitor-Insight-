# Elephant Health AI 🐘🏥 (MERN/React Conversion)

This project has been modernized from a monolithic Flask application into a decoupled architecture, featuring a **React (Vite) Frontend** and a **Python (Flask) Backend API**. It monitors and predicts the health status of Asian Elephants using AI.

## Project Structure
```text
elephant health lm/
├── backend/            # Python ML code + Flask API
│   ├── elephant_app/   # Flask application and SQLite DB
│   │   ├── app.py      # Core JSON API with CORS enabled
│   │   ├── init_db.py  # Script to initialize DB tables
│   ├── generate_data.py
│   ├── train_model.py
│   └── requirements.txt
├── frontend/           # Modern React UI (Vite)
│   ├── package.json
│   ├── src/            # React components and pages
│   │   ├── components/ # Reusable UI pieces
│   │   ├── pages/      # Pages (Home, Login, Dashboard, etc.)
│   │   ├── utils/      # API configurations (Axios)
│   │   └── App.jsx     # Main Router connecting pages
│   └── public/
└── README.md
```

---

## 🛠️ Setup & Running Guide

### 1. The Python Backend (AI & Database API)

The backend exposes the machine learning capabilities and database operations completely via a JSON API. It runs on port `5001`.

**Prerequisites:** Python 3.8+

**Installation:**
```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (Mac/Linux)
python3 -m venv .venv
source .venv/bin/activate

# For Windows:
# python -m venv venv
# .\venv\Scripts\activate

# Install dependencies (Flask, Scikit-learn, Flask-Cors)
pip install -r requirements.txt
```

**Initialize Database:**
```bash
cd elephant_app
python init_db.py
```

**Run the Backend API:**
```bash
# Ensure you are in backend/elephant_app
python app.py
```
*The backend API will run on `http://127.0.0.1:5001` (or `http://localhost:5001`)*

---

### 2. The React Frontend (User Interface)

The frontend is built with React.js using Vite and uses Axios to securely pull data from the backend.

**Prerequisites:** Node.js (v18+)

**Installation:**
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install Node modules (React Router, Axios, etc)
npm install
```

**Run the UI:**
```bash
npm run dev
```
*The React application will be available at `http://localhost:5173`*

- **Login Credentials**:
    - Username: `vet_kamal`
    - Password: `password`

---

## 🧠 AI Model Management (Optional)
If you want to retrain the AI models with new data or parameters:

1. **Generate Synthetic Data**:
   ```bash
   cd backend
   python generate_data.py
   ```
   This creates `elephant_health_data_advanced.csv`.

2. **Train the Model**:
   ```bash
   python train_model.py
   ```
   This will train the Random Forest models and update the `.pkl` files used by the Flask API.

## Recent Changes
- **Decoupled Architecture**: Separated the backend and frontend into two distinct folders.
- **REST API**: Converted all Flask routing in `app.py` to return JSON status codes instead of HTML templates.
- **React Migration**: All templates were translated into responsive React pages (`.jsx`).
- **CORS & Authentication**: Implemented `Flask-CORS` and configured cookie tracking (`SESSION_COOKIE_SAMESITE='Lax'`) so cross-origin authentication functions securely between the `5173` frontend and `5001` backend.

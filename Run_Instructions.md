# MediAssist AI — Quick Run Instructions

Follow these instructions to run MediAssist AI on your machine.

---

## Option 1: Fast Zero-Setup Local Execution (SQLite)

### Step 1: Run Backend (FastAPI)
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

Backend Swagger documentation will open at: **http://localhost:8000/docs**

### Step 2: Run Frontend (React + Vite)
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Frontend application will open at: **http://localhost:5173**

---

## Option 2: Docker Compose (PostgreSQL + FastAPI + Nginx)

Run the entire multi-container stack in Docker:

```bash
docker-compose up --build
```

- Web App: **http://localhost:3000**
- Backend API: **http://localhost:8000**
- PostgreSQL: **localhost:5432**

---

## Demo Login Shortcuts

Use these credentials to evaluate all 3 role portals:

- **Patient Portal**: `patient@mediassist.com` / `patient123`
- **Doctor Portal**: `doctor@mediassist.com` / `doctor123`
- **Admin Dashboard**: `admin@mediassist.com` / `admin123`

*(Tip: Click the one-click demo login buttons on the login page for instant access!)*

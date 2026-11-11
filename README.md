# MediAssist AI — Intelligent Clinic Appointment & Patient Support Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

**MediAssist AI** is a production-style full-stack healthcare platform featuring an AI chatbot with RAG vector search, dynamic doctor availability engine, double-booking prevention, role-based dashboards (Patient, Doctor, Admin), automated Pytest tests, Docker orchestration, and analytics charts.

---

## 1. Key Application Features

- 🤖 **Interactive RAG AI Chatbot**: Natural language understanding, clinic knowledge retrieval, system prompt safety rules, emergency symptom warnings, and 10 structured backend tool integrations.
- 📱 **Embedded Chat Action Widgets**: Interactive doctor selector, availability time slot picker, and appointment confirmation cards render inline inside the chat thread.
- 📅 **Dynamic Slot Calculation**: Dynamic availability engine computes open time slots per doctor based on weekly schedules minus active non-cancelled appointments.
- 🔒 **Prevent Double Booking**: Database transaction level double-booking checks prevent overlapping appointment slots.
- 👥 **3 User Roles with RBAC**:
  - **Patient**: Chat with AI, search doctors, book/reschedule/cancel appointments, view history.
  - **Doctor**: View today's schedule, patient medical history drawer, update appointment status (Confirm/Complete/Reject).
  - **Admin**: Dashboard metrics, Recharts analytics, manage users, create doctor accounts, add FAQs, upload & chunk RAG knowledge docs, inspect chatbot logs.
- 📊 **Analytics Dashboard**: SVG/Canvas charts for appointments by day, department distribution, status breakdown, and chatbot usage.
- ⚡ **Dual Database Engine**: Runs out-of-the-box on SQLite for zero-setup local dev/testing, and seamlessly connects to PostgreSQL in Docker production.
- 🚀 **One-Click Demo Credentials**: Instant demo login shortcuts on the login page for immediate evaluation.

---

## 2. One-Click Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Patient Demo** | `patient@mediassist.com` | `patient123` |
| **Doctor Demo** | `doctor@mediassist.com` | `doctor123` |
| **Admin Demo** | `admin@mediassist.com` | `admin123` |

---

## 3. Project Directory Structure

```
c:/chartbot/
├── backend/
│   ├── app/
│   │   ├── ai/               # AI Engine (Prompts, Tools, RAG retriever, Agent)
│   │   ├── api/              # REST API Routers (auth, doctors, services, appointments, chat, admin)
│   │   ├── core/             # Security, JWT, config
│   │   ├── db/               # SQLAlchemy session & seed setup
│   │   ├── models/           # 14 SQLAlchemy ORM Database Models
│   │   ├── schemas/          # Pydantic v2 validation schemas
│   │   ├── services/         # Business logic (Appointments, Doctors, Admin, Auth)
│   │   └── main.py           # FastAPI application entry
│   ├── tests/                # Pytest unit & integration test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── seed.py               # Seed script pre-populating doctors, departments, FAQs, RAG docs
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, StatusBadge, AppointmentModal, ChatbotWidget
│   │   ├── context/          # AuthContext provider
│   │   ├── pages/            # LandingPage, DoctorsPage, ServicesPage, Login, Register, Dashboards
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── database/
│   └── init.sql              # PostgreSQL DDL initialization script
├── docs/
│   └── architecture.md       # Architectural diagrams & data flows
├── .env.example
├── docker-compose.yml
├── README.md
└── Run_Instructions.md
```

---

## 4. Local Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup (FastAPI)
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
Backend API interactive documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 5. Docker Setup (Multi-Container Deployment)

To launch the complete application with PostgreSQL, FastAPI backend, and Nginx frontend in Docker:

```bash
docker-compose up --build
```
Access the application at [http://localhost:3000](http://localhost:3000).

---

## 6. Automated Testing

Run the Pytest suite for backend endpoints (Auth, Doctor availability, Appointment booking, Double-booking prevention, Chat tool calling):

```bash
cd backend
pytest -v
```

---

## 7. REST API Endpoints Summary

### Authentication
- `POST /api/auth/register` — Register patient, doctor, or admin
- `POST /api/auth/login` — Authenticate & return JWT token
- `GET /api/auth/me` — Current user profile

### Doctors & Availability
- `GET /api/doctors` — List doctors with filters
- `GET /api/doctors/{id}` — Doctor details
- `GET /api/doctors/{id}/availability?date=YYYY-MM-DD` — Dynamic available time slots

### Appointments
- `POST /api/appointments` — Book new appointment (validates slot availability)
- `GET /api/appointments` — User appointment history
- `PATCH /api/appointments/{id}/reschedule` — Reschedule date/time
- `PATCH /api/appointments/{id}/cancel` — Cancel appointment
- `PATCH /api/appointments/{id}/status` — Doctor/Admin update status

### AI Chatbot
- `POST /api/chat` — Process natural language prompt, execute tools, return RAG answer & action payloads
- `GET /api/chat/conversations` — Patient chat thread history

### Admin
- `GET /api/admin/dashboard` — Metric summary
- `GET /api/admin/analytics` — Recharts chart dataset
- `POST /api/admin/doctors` — Create doctor
- `POST /api/admin/faqs` — Create FAQ
- `POST /api/admin/knowledge` — Add & chunk RAG knowledge doc

---

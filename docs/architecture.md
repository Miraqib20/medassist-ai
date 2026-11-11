# System Architecture — MediAssist AI

MediAssist AI is an enterprise-grade, full-stack AI healthcare Web Application. It integrates an AI assistant agent with RAG knowledge retrieval, structured tool execution, dynamic doctor availability engine, and role-based clinical dashboards.

---

## 1. High-Level Architectural Flow Diagram

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND LAYER                                    |
|  React 18 + Vite + Tailwind CSS + React Router + Lucide Icons + Recharts Analytics |
|                                                                                   |
|  [ Public Landing ]  [ Doctor Directory ]  [ Patient / Doctor / Admin Dashboards ]|
|                                                                                   |
|                      +----------------------------------+                         |
|                      |  Floating Chatbot Widget (AI)   |                         |
|                      +----------------------------------+                         |
+---------------------------------------+-------------------------------------------+
                                        | HTTP REST APIs (JSON / JWT Bearer)
                                        v
+-----------------------------------------------------------------------------------+
|                                 BACKEND LAYER                                     |
|  FastAPI (Python 3.11) + Pydantic v2 + SQLAlchemy 2.0 + PyJWT + Passlib Hashing   |
|                                                                                   |
|  +--------------------+  +-----------------------+  +--------------------------+  |
|  | Auth Router        |  | Appointments Service  |  | Doctor Availability      |  |
|  | /api/auth/*        |  | Double-Booking Check  |  | Slot Calculator Engine   |  |
|  +--------------------+  +-----------------------+  +--------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             AI & RAG ENGINE                                 |  |
|  |                                                                             |  |
|  |   [ User Message Input ]                                                     |  |
|  |           |                                                                 |  |
|  |           v                                                                 |  |
|  |   [ Emergency Safety Guard ]  ---> (Trigger Emergency Warning 911 Banner)    |  |
|  |           |                                                                 |  |
|  |           v                                                                 |  |
|  |   [ RAG Retriever ] -----------> (TF-IDF Cosine Similarity Vector Index)    |  |
|  |           |                      over Knowledge Chunks & FAQs               |  |
|  |           v                                                                 |  |
|  |   [ Intent Router / Tools ] ---> (Execute Database Function & return        |  |
|  |                                  structured SHOW_DOCTORS, SHOW_AVAILABILITY)|  |
|  |           |                                                                 |  |
|  |           v                                                                 |  |
|  |   [ LLM Response Synthesizer ]                                              |  |
|  +-----------------------------------------------------------------------------+  |
+---------------------------------------+-------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                               DATABASE LAYER                                      |
|  PostgreSQL / SQLite Relational Database Engine                                    |
|                                                                                   |
|  [users] [patients] [doctors] [departments] [services] [doctor_availability]      |
|  [appointments] [conversations] [messages] [faqs] [knowledge_chunks] [audit_logs] |
+-----------------------------------------------------------------------------------+
```

---

## 2. Complete Chatbot Request Sequence

```
User Prompts Chatbot: "I want to see a dermatologist tomorrow"
        |
        v
POST /api/chat { message, conversation_id }
        |
        v
Authentication Middleware (Attaches User ID & Role if logged in)
        |
        v
Emergency Safety Inspector (Scans for chest pain, stroke, emergency keywords)
        |
        v
RAG Retriever (Queries knowledge_chunks and faqs using TF-IDF term frequency cosine similarity)
        |
        v
Intent & Tool Dispatcher
        |-- Identifies specialty: "dermatology"
        |-- Calls tool: `search_doctors(specialty='dermatology')`
        |-- Queries database `doctors` table joining `users` and `departments`
        \-- Generates structured Action Payload: `SHOW_DOCTORS`
        |
        v
AI Agent Response Synthesizer
        |-- Synthesizes friendly response text
        |-- Attaches `actions: [{ action_type: 'SHOW_DOCTORS', data: { doctors } }]`
        \-- Saves message thread to `conversations` & `messages` database tables
        |
        v
Frontend Render
        |-- Displays AI text message bubble
        \-- Renders interactive embedded Doctor Selector Cards directly in chat UI!
```

---

## 3. Relational Database Schema ERD

- **`users`**: Central authentication table storing `id`, `email`, `hashed_password`, `role` (`PATIENT`, `DOCTOR`, `ADMIN`).
- **`patients`**: Extended profile linked 1-to-1 to `users`.
- **`doctors`**: Extended professional profile linked 1-to-1 to `users`, linked 1-to-N to `departments`.
- **`departments`**: Medical specialties (Cardiology, Dermatology, etc.).
- **`services`**: Specific consultation types, durations, and costs.
- **`doctor_availability`**: Weekly availability window per day of week (e.g. Mon 09:00 - 17:00).
- **`appointments`**: Bookings linking `patient_id`, `doctor_id`, `service_id`, `appointment_date`, `start_time`, `end_time`, `status`.
- **`conversations` & `messages`**: Chatbot thread persistence and audit logs.
- **`faqs` & `knowledge_chunks`**: RAG vector search corpus.
- **`audit_logs`**: System security and booking action tracking.

---

## 4. Security & Safety Model

1. **Password Hashing**: Bcrypt with salted rounds via Passlib.
2. **JWT Authorization**: Cryptographically signed access tokens carrying `sub` and `role`.
3. **Role Guards**: FastAPI dependencies enforce role authorization for Patient, Doctor, and Admin routes.
4. **Medical Disclaimer**: Automated keyword rules divert acute symptom queries to 911 / 112 emergency advice.
5. **Slot Integrity**: Strict database transaction checks prevent double bookings.

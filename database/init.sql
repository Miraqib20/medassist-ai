-- MediAssist AI PostgreSQL Schema Initialization

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'PATIENT', -- PATIENT, DOCTOR, ADMIN
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth VARCHAR(20),
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    address TEXT,
    emergency_contact VARCHAR(100),
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Heart',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    specialty VARCHAR(100) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience_years INT DEFAULT 0,
    consultation_fee NUMERIC(10, 2) DEFAULT 50.00,
    bio TEXT,
    avatar_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY,
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 30,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctor_availability (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL, -- Monday, Tuesday, etc.
    start_time VARCHAR(10) NOT NULL, -- '09:00'
    end_time VARCHAR(10) NOT NULL,   -- '17:00'
    slot_duration_minutes INT DEFAULT 30,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id VARCHAR(36) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    service_id VARCHAR(36) REFERENCES services(id) ON DELETE SET NULL,
    appointment_date VARCHAR(10) NOT NULL, -- YYYY-MM-DD
    start_time VARCHAR(10) NOT NULL,       -- HH:MM
    end_time VARCHAR(10) NOT NULL,         -- HH:MM
    status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Completed, Cancelled, Rejected
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Clinic Support Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    actions_json TEXT, -- JSON payload of chatbot suggested actions
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR(36) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    content TEXT NOT NULL,
    file_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INT NOT NULL,
    metadata_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal lookup speeds
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_doc_avail_doctor ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

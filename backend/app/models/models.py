import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(20), nullable=False, default="PATIENT") # PATIENT, DOCTOR, ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    patient_appointments = relationship("Appointment", back_populates="patient", foreign_keys="Appointment.patient_id")
    conversations = relationship("Conversation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    medical_history = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="patient_profile")


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Heart")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    doctors = relationship("Doctor", back_populates="department")
    services = relationship("Service", back_populates="department")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    specialty = Column(String(100), nullable=False)
    qualification = Column(String(255), nullable=False)
    experience_years = Column(Integer, default=0)
    consultation_fee = Column(Numeric(10, 2), default=50.00)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors")
    availabilities = relationship("DoctorAvailability", back_populates="doctor", cascade="all, delete-orphan")
    doctor_appointments = relationship("Appointment", back_populates="doctor", foreign_keys="Appointment.doctor_id")


class Service(Base):
    __tablename__ = "services"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=30)
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    department = relationship("Department", back_populates="services")
    appointments = relationship("Appointment", back_populates="service")


class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String(15), nullable=False) # Monday, Tuesday, etc.
    start_time = Column(String(10), nullable=False) # '09:00'
    end_time = Column(String(10), nullable=False)   # '17:00'
    slot_duration_minutes = Column(Integer, default=30)
    is_available = Column(Boolean, default=True)

    doctor = relationship("Doctor", back_populates="availabilities")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(String(36), ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    appointment_date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    start_time = Column(String(10), nullable=False)                    # HH:MM
    end_time = Column(String(10), nullable=False)                      # HH:MM
    status = Column(String(20), nullable=False, default="Pending")     # Pending, Confirmed, Completed, Cancelled, Rejected
    reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    patient = relationship("User", foreign_keys=[patient_id], back_populates="patient_appointments")
    doctor = relationship("Doctor", foreign_keys=[doctor_id], back_populates="doctor_appointments")
    service = relationship("Service", back_populates="appointments")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), default="Clinic Support Chat")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    actions_json = Column(Text, nullable=True) # JSON payload of UI widget actions
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")


class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category = Column(String(50), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="General")
    content = Column(Text, nullable=False)
    file_path = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=True)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    document = relationship("KnowledgeDocument", back_populates="chunks")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

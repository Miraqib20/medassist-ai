from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: str = "PATIENT" # PATIENT, DOCTOR, ADMIN

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class PatientProfileOut(BaseModel):
    id: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_history: Optional[str] = None

    class Config:
        from_attributes = True

class DoctorProfileOut(BaseModel):
    id: str
    department_id: Optional[str] = None
    specialty: str
    qualification: str
    experience_years: int
    consultation_fee: float
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_featured: bool

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    patient_profile: Optional[PatientProfileOut] = None
    doctor_profile: Optional[DoctorProfileOut] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- DEPARTMENT, DOCTOR & SERVICE SCHEMAS ---
class DepartmentOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Heart"

    class Config:
        from_attributes = True

class DoctorOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    specialty: str
    qualification: str
    experience_years: int
    consultation_fee: float
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_featured: bool
    department: Optional[DepartmentOut] = None

    class Config:
        from_attributes = True

class DoctorCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    department_id: Optional[str] = None
    specialty: str
    qualification: str
    experience_years: int = 0
    consultation_fee: float = 50.0
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_featured: bool = False

class ServiceOut(BaseModel):
    id: str
    department_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

class DoctorAvailabilityOut(BaseModel):
    id: str
    doctor_id: str
    day_of_week: str
    start_time: str
    end_time: str
    slot_duration_minutes: int
    is_available: bool

    class Config:
        from_attributes = True

class DoctorAvailabilityUpdate(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    slot_duration_minutes: int = 30
    is_available: bool = True

class SlotOut(BaseModel):
    start_time: str
    end_time: str
    is_available: bool

# --- APPOINTMENT SCHEMAS ---
class AppointmentCreate(BaseModel):
    doctor_id: str
    service_id: Optional[str] = None
    appointment_date: str # YYYY-MM-DD
    start_time: str       # HH:MM
    reason: Optional[str] = None

class AppointmentReschedule(BaseModel):
    appointment_date: str
    start_time: str

class AppointmentStatusUpdate(BaseModel):
    status: str # Pending, Confirmed, Completed, Cancelled, Rejected
    notes: Optional[str] = None

class AppointmentOut(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    service_id: Optional[str] = None
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    doctor_avatar: Optional[str] = None
    service_name: Optional[str] = None
    service_price: Optional[float] = None
    appointment_date: str
    start_time: str
    end_time: str
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- CHAT SCHEMAS ---
class ChatMessageInput(BaseModel):
    conversation_id: Optional[str] = None
    message: str

class ActionPayload(BaseModel):
    action_type: str # SHOW_DOCTORS, SHOW_SERVICES, SHOW_AVAILABILITY, BOOK_APPOINTMENT, SHOW_FAQ, EMERGENCY_ALERT
    data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    actions: List[ActionPayload] = []

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    actions_json: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    created_at: datetime
    messages: List[MessageOut] = []

    class Config:
        from_attributes = True

# --- FAQ & KNOWLEDGE SCHEMAS ---
class FAQCreate(BaseModel):
    category: str
    question: str
    answer: str
    is_active: bool = True

class FAQOut(BaseModel):
    id: str
    category: str
    question: str
    answer: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class KnowledgeDocumentCreate(BaseModel):
    title: str
    category: str = "General"
    content: str

class KnowledgeDocumentOut(BaseModel):
    id: str
    title: str
    category: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class KnowledgeChunkOut(BaseModel):
    id: str
    document_id: Optional[str] = None
    chunk_text: str
    chunk_index: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- ADMIN DASHBOARD SCHEMAS ---
class AdminStatsResponse(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    today_appointments: int
    pending_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    total_conversations: int
    total_faqs: int

class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

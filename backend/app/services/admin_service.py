from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import User, Patient, Doctor, Department, Service, Appointment, Conversation, FAQ, KnowledgeDocument, KnowledgeChunk, AuditLog

def get_admin_dashboard_stats(db: Session) -> dict:
    today_str = datetime.now().strftime("%Y-%m-%d")

    total_patients = db.query(User).filter(User.role == "PATIENT").count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()
    today_appointments = db.query(Appointment).filter(Appointment.appointment_date == today_str).count()
    pending_appointments = db.query(Appointment).filter(Appointment.status == "Pending").count()
    completed_appointments = db.query(Appointment).filter(Appointment.status == "Completed").count()
    cancelled_appointments = db.query(Appointment).filter(Appointment.status == "Cancelled").count()
    total_conversations = db.query(Conversation).count()
    total_faqs = db.query(FAQ).count()

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "today_appointments": today_appointments,
        "pending_appointments": pending_appointments,
        "completed_appointments": completed_appointments,
        "cancelled_appointments": cancelled_appointments,
        "total_conversations": total_conversations,
        "total_faqs": total_faqs
    }

def get_analytics_charts_data(db: Session) -> dict:
    # 1. Appointments by Status
    status_counts = db.query(
        Appointment.status, func.count(Appointment.id)
    ).group_by(Appointment.status).all()
    appointments_by_status = [{"name": s[0], "value": s[1]} for s in status_counts]

    # 2. Appointments by Department
    dept_counts = db.query(
        Department.name, func.count(Appointment.id)
    ).join(Doctor, Doctor.department_id == Department.id)\
     .join(Appointment, Appointment.doctor_id == Doctor.id)\
     .group_by(Department.name).all()
    appointments_by_department = [{"name": d[0], "count": d[1]} for d in dept_counts]

    # 3. Appointments Timeline (Sample by date)
    date_counts = db.query(
        Appointment.appointment_date, func.count(Appointment.id)
    ).group_by(Appointment.appointment_date).order_by(Appointment.appointment_date.asc()).limit(7).all()
    appointments_by_day = [{"date": d[0], "count": d[1]} for d in date_counts]

    return {
        "appointments_by_status": appointments_by_status,
        "appointments_by_department": appointments_by_department,
        "appointments_by_day": appointments_by_day
    }

def add_knowledge_document(db: Session, title: str, category: str, content: str) -> KnowledgeDocument:
    doc = KnowledgeDocument(
        title=title,
        category=category,
        content=content
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Simple chunker: split into ~300 character chunks for vector RAG
    chunk_size = 300
    words = content.split()
    current_chunk = []
    current_len = 0
    chunk_index = 0

    for word in words:
        current_chunk.append(word)
        current_len += len(word) + 1
        if current_len >= chunk_size:
            chunk_text = " ".join(current_chunk)
            chunk = KnowledgeChunk(
                document_id=doc.id,
                chunk_text=chunk_text,
                chunk_index=chunk_index
            )
            db.add(chunk)
            chunk_index += 1
            current_chunk = []
            current_len = 0

    if current_chunk:
        chunk_text = " ".join(current_chunk)
        chunk = KnowledgeChunk(
            document_id=doc.id,
            chunk_text=chunk_text,
            chunk_index=chunk_index
        )
        db.add(chunk)

    db.commit()
    return doc

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Doctor, Service, Department, Appointment, FAQ, KnowledgeDocument, KnowledgeChunk, Conversation, AuditLog
from app.schemas.schemas import DoctorCreate, FAQCreate, FAQOut, KnowledgeDocumentCreate, KnowledgeDocumentOut
from app.services import admin_service, doctor_service, auth_service
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/dashboard")
def get_admin_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Retrieve high-level clinic metrics for admin dashboard summary."""
    return admin_service.get_admin_dashboard_stats(db)

@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Retrieve chart data for appointments by day, status distribution, and department breakdown."""
    return admin_service.get_analytics_charts_data(db)

@router.get("/users")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """List all registered platform users."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return results

@router.post("/doctors", status_code=status.HTTP_201_CREATED)
def create_doctor(doc_in: DoctorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Create a new doctor account and profile."""
    from app.schemas.schemas import UserRegister
    user = auth_service.register_user(
        db, UserRegister(
            email=doc_in.email,
            password=doc_in.password,
            full_name=doc_in.full_name,
            phone=doc_in.phone,
            role="DOCTOR"
        )
    )
    doc = Doctor(
        user_id=user.id,
        department_id=doc_in.department_id,
        specialty=doc_in.specialty,
        qualification=doc_in.qualification,
        experience_years=doc_in.experience_years,
        consultation_fee=doc_in.consultation_fee,
        bio=doc_in.bio,
        avatar_url=doc_in.avatar_url,
        is_featured=doc_in.is_featured
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doctor_service.get_doctor_by_id(db, doc.id)

@router.delete("/doctors/{id}")
def delete_doctor(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Delete doctor account."""
    doc = db.query(Doctor).filter(Doctor.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    user = db.query(User).filter(User.id == doc.user_id).first()
    if user:
        db.delete(user)
    db.delete(doc)
    db.commit()
    return {"message": "Doctor deleted successfully"}

@router.get("/faqs", response_model=List[FAQOut])
def list_faqs(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """List all FAQs."""
    return db.query(FAQ).order_by(FAQ.created_at.desc()).all()

@router.post("/faqs", response_model=FAQOut, status_code=status.HTTP_201_CREATED)
def create_faq(faq_in: FAQCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Create a new FAQ entry."""
    faq = FAQ(
        category=faq_in.category,
        question=faq_in.question,
        answer=faq_in.answer,
        is_active=faq_in.is_active
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq

@router.delete("/faqs/{id}")
def delete_faq(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Delete an FAQ."""
    faq = db.query(FAQ).filter(FAQ.id == id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(faq)
    db.commit()
    return {"message": "FAQ deleted"}

@router.get("/knowledge", response_model=List[KnowledgeDocumentOut])
def list_knowledge_docs(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """List RAG knowledge documents."""
    return db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()

@router.post("/knowledge", response_model=KnowledgeDocumentOut, status_code=status.HTTP_201_CREATED)
def create_knowledge_doc(doc_in: KnowledgeDocumentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Add a new document to the RAG knowledge base (automatically chunks and indexes content)."""
    return admin_service.add_knowledge_document(db, title=doc_in.title, category=doc_in.category, content=doc_in.content)

@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """List chatbot conversations across all users."""
    convs = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    results = []
    for c in convs:
        results.append({
            "id": c.id,
            "user_id": c.user_id,
            "user_name": c.user.full_name if c.user else "Guest Patient",
            "title": c.title,
            "message_count": len(c.messages),
            "created_at": c.created_at
        })
    return results

@router.get("/audit-logs")
def list_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """View system audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    results = []
    for log in logs:
        user_name = None
        if log.user_id:
            u = db.query(User).filter(User.id == log.user_id).first()
            if u:
                user_name = u.full_name
        results.append({
            "id": log.id,
            "user_id": log.user_id,
            "user_name": user_name,
            "action": log.action,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp
        })
    return results

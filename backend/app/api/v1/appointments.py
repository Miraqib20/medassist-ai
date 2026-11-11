from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import AppointmentCreate, AppointmentReschedule, AppointmentStatusUpdate, AppointmentOut
from app.services import appointment_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_appointment(
    app_in: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Book a new clinic appointment (validates availability and prevents double booking)."""
    return appointment_service.create_appointment(db, patient_id=current_user.id, app_in=app_in)

@router.get("")
def list_user_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve appointments for current logged in user (filtered by role)."""
    return appointment_service.get_user_appointments(db, user_id=current_user.id, role=current_user.role)

@router.patch("/{id}/reschedule")
def reschedule(
    id: str,
    resched_in: AppointmentReschedule,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reschedule an existing appointment to a new date/time slot."""
    return appointment_service.reschedule_appointment(
        db, appointment_id=id, user_id=current_user.id, role=current_user.role, resched_in=resched_in
    )

@router.patch("/{id}/cancel")
def cancel(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel an appointment."""
    return appointment_service.cancel_appointment(
        db, appointment_id=id, user_id=current_user.id, role=current_user.role
    )

@router.patch("/{id}/status")
def update_status(
    id: str,
    status_in: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update appointment status (Doctor/Admin role)."""
    if current_user.role not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors and admins can update status")
    
    from app.models.models import Appointment
    app = db.query(Appointment).filter(Appointment.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    app.status = status_in.status
    if status_in.notes:
        app.notes = status_in.notes
    db.commit()
    db.refresh(app)
    return appointment_service.format_appointment(app)

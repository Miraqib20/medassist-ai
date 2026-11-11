from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Appointment, Doctor, Service, User, Notification, AuditLog, DoctorAvailability
from app.schemas.schemas import AppointmentCreate, AppointmentReschedule, AppointmentOut

def create_appointment(db: Session, patient_id: str, app_in: AppointmentCreate) -> dict:
    # 1. Validate doctor existence
    doctor = db.query(Doctor).filter(Doctor.id == app_in.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    # 2. Service duration check
    duration = 30
    service_obj = None
    if app_in.service_id:
        service_obj = db.query(Service).filter(Service.id == app_in.service_id).first()
        if service_obj:
            duration = service_obj.duration_minutes

    # 3. Calculate end time
    start_hour, start_min = map(int, app_in.start_time.split(":"))
    end_minutes = start_hour * 60 + start_min + duration
    end_time_str = f"{end_minutes // 60:02d}:{end_minutes % 60:02d}"

    # 4. Check double-booking: Is doctor already booked at this exact date & time?
    existing_conflict = db.query(Appointment).filter(
        Appointment.doctor_id == app_in.doctor_id,
        Appointment.appointment_date == app_in.appointment_date,
        Appointment.start_time == app_in.start_time,
        Appointment.status.in_(["Pending", "Confirmed"])
    ).first()

    if existing_conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doctor {doctor.user.full_name} is already booked on {app_in.appointment_date} at {app_in.start_time}. Please select another time slot."
        )

    # 5. Create Appointment
    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=app_in.doctor_id,
        service_id=app_in.service_id,
        appointment_date=app_in.appointment_date,
        start_time=app_in.start_time,
        end_time=end_time_str,
        status="Confirmed", # Auto-confirm for interactive demo ease
        reason=app_in.reason or "General Consultation"
    )
    db.add(appointment)
    
    # 6. Create notification for patient
    notification = Notification(
        user_id=patient_id,
        title="Appointment Confirmed",
        message=f"Your appointment with Dr. {doctor.user.full_name} for {app_in.appointment_date} at {app_in.start_time} is confirmed."
    )
    db.add(notification)

    # 7. Audit log
    audit = AuditLog(
        user_id=patient_id,
        action="BOOK_APPOINTMENT",
        details=f"Booked appointment ID {appointment.id} with Doctor {doctor.id} on {app_in.appointment_date} at {app_in.start_time}"
    )
    db.add(audit)

    db.commit()
    db.refresh(appointment)
    return format_appointment(appointment)

def reschedule_appointment(db: Session, appointment_id: str, user_id: str, role: str, resched_in: AppointmentReschedule) -> dict:
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if role == "PATIENT" and app.patient_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Check for conflicts at new date/time
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == app.doctor_id,
        Appointment.appointment_date == resched_in.appointment_date,
        Appointment.start_time == resched_in.start_time,
        Appointment.id != appointment_id,
        Appointment.status.in_(["Pending", "Confirmed"])
    ).first()

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The requested slot is already booked. Please choose a different date or time."
        )

    # Calculate end time
    start_hour, start_min = map(int, resched_in.start_time.split(":"))
    duration = 30
    if app.service:
        duration = app.service.duration_minutes
    end_minutes = start_hour * 60 + start_min + duration
    end_time_str = f"{end_minutes // 60:02d}:{end_minutes % 60:02d}"

    app.appointment_date = resched_in.appointment_date
    app.start_time = resched_in.start_time
    app.end_time = end_time_str
    app.status = "Confirmed"

    db.commit()
    db.refresh(app)
    return format_appointment(app)

def cancel_appointment(db: Session, appointment_id: str, user_id: str, role: str) -> dict:
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if role == "PATIENT" and app.patient_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    app.status = "Cancelled"
    db.commit()
    db.refresh(app)
    return format_appointment(app)

def get_user_appointments(db: Session, user_id: str, role: str) -> List[dict]:
    if role == "PATIENT":
        appointments = db.query(Appointment).filter(Appointment.patient_id == user_id).order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).all()
    elif role == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
        if not doctor:
            return []
        appointments = db.query(Appointment).filter(Appointment.doctor_id == doctor.id).order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).all()
    else: # ADMIN
        appointments = db.query(Appointment).order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).all()

    return [format_appointment(a) for a in appointments]

def format_appointment(app: Appointment) -> dict:
    return {
        "id": app.id,
        "patient_id": app.patient_id,
        "doctor_id": app.doctor_id,
        "service_id": app.service_id,
        "patient_name": app.patient.full_name if app.patient else "Patient",
        "patient_email": app.patient.email if app.patient else "",
        "patient_phone": app.patient.phone if app.patient else "",
        "doctor_name": app.doctor.user.full_name if app.doctor and app.doctor.user else "Doctor",
        "doctor_specialty": app.doctor.specialty if app.doctor else "",
        "doctor_avatar": app.doctor.avatar_url if app.doctor else None,
        "service_name": app.service.name if app.service else "General Consultation",
        "service_price": float(app.service.price) if app.service else (float(app.doctor.consultation_fee) if app.doctor else 50.0),
        "appointment_date": app.appointment_date,
        "start_time": app.start_time,
        "end_time": app.end_time,
        "status": app.status,
        "reason": app.reason,
        "notes": app.notes,
        "created_at": app.created_at
    }

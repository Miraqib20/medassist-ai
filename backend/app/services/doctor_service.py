from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Doctor, Department, Service, DoctorAvailability, Appointment, User
from app.schemas.schemas import DoctorOut, ServiceOut, DoctorAvailabilityOut, SlotOut

def format_department(dept: Optional[Department]) -> Optional[dict]:
    if not dept:
        return None
    return {
        "id": dept.id,
        "name": dept.name,
        "description": dept.description,
        "icon": dept.icon
    }

def get_all_doctors(
    db: Session,
    department_id: Optional[str] = None,
    specialty: Optional[str] = None,
    search: Optional[str] = None,
    featured_only: bool = False
) -> List[dict]:
    query = db.query(Doctor).join(User, Doctor.user_id == User.id)

    if department_id:
        query = query.filter(Doctor.department_id == department_id)
    if specialty:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_term)) |
            (Doctor.specialty.ilike(search_term)) |
            (Doctor.qualification.ilike(search_term))
        )
    if featured_only:
        query = query.filter(Doctor.is_featured == True)

    doctors = query.all()
    results = []
    for doc in doctors:
        results.append({
            "id": doc.id,
            "user_id": doc.user_id,
            "full_name": doc.user.full_name,
            "email": doc.user.email,
            "phone": doc.user.phone,
            "specialty": doc.specialty,
            "qualification": doc.qualification,
            "experience_years": doc.experience_years,
            "consultation_fee": float(doc.consultation_fee),
            "bio": doc.bio,
            "avatar_url": doc.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={doc.user.full_name}",
            "is_featured": doc.is_featured,
            "department": format_department(doc.department)
        })
    return results

def get_doctor_by_id(db: Session, doctor_id: str) -> Optional[dict]:
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        return None
    return {
        "id": doc.id,
        "user_id": doc.user_id,
        "full_name": doc.user.full_name,
        "email": doc.user.email,
        "phone": doc.user.phone,
        "specialty": doc.specialty,
        "qualification": doc.qualification,
        "experience_years": doc.experience_years,
        "consultation_fee": float(doc.consultation_fee),
        "bio": doc.bio,
        "avatar_url": doc.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={doc.user.full_name}",
        "is_featured": doc.is_featured,
        "department": format_department(doc.department)
    }

def get_doctor_slots(db: Session, doctor_id: str, date_str: str) -> List[dict]:
    """
    Dynamically generates time slots for a given date based on doctor_availability
    and subtracts existing booked/confirmed appointments for that doctor on date_str.
    """
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return []

    day_name = target_date.strftime("%A") # Monday, Tuesday...

    # Check weekly availability schedule
    avail = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor_id,
        DoctorAvailability.day_of_week == day_name,
        DoctorAvailability.is_available == True
    ).first()

    if not avail:
        return []

    # Get booked appointments for doctor on date_str
    booked_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == date_str,
        Appointment.status.in_(["Pending", "Confirmed"])
    ).all()

    booked_start_times = set(app.start_time for app in booked_appointments)

    # Generate slots from start_time to end_time
    start_hour, start_min = map(int, avail.start_time.split(":"))
    end_hour, end_min = map(int, avail.end_time.split(":"))
    slot_duration = avail.slot_duration_minutes or 30

    slots = []
    current_minutes = start_hour * 60 + start_min
    end_minutes = end_hour * 60 + end_min

    while current_minutes + slot_duration <= end_minutes:
        h = current_minutes // 60
        m = current_minutes % 60
        time_str = f"{h:02d}:{m:02d}"

        end_h = (current_minutes + slot_duration) // 60
        end_m = (current_minutes + slot_duration) % 60
        end_time_str = f"{end_h:02d}:{end_m:02d}"

        is_avail = time_str not in booked_start_times
        slots.append({
            "start_time": time_str,
            "end_time": end_time_str,
            "is_available": is_avail
        })
        current_minutes += slot_duration

    return slots

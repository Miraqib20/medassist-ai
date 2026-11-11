from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import doctor_service

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("")
def list_doctors(
    department_id: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    featured_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """List all clinic doctors with optional department, specialty, and search filters."""
    return doctor_service.get_all_doctors(db, department_id=department_id, specialty=specialty, search=search, featured_only=featured_only)

@router.get("/{id}")
def get_doctor(id: str, db: Session = Depends(get_db)):
    """Retrieve detailed doctor profile by ID."""
    doc = doctor_service.get_doctor_by_id(db, doctor_id=id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doc

@router.get("/{id}/availability")
def get_doctor_availability(
    id: str,
    date: str = Query(..., description="Target date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Dynamically generate available time slots for a doctor on a specific date."""
    doc = doctor_service.get_doctor_by_id(db, doctor_id=id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    slots = doctor_service.get_doctor_slots(db, doctor_id=id, date_str=date)
    return {
        "doctor_id": id,
        "doctor_name": doc["full_name"],
        "date": date,
        "slots": slots
    }

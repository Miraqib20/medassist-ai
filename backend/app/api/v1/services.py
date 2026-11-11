from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Service, Department
from app.schemas.schemas import ServiceOut, DepartmentOut

router = APIRouter(prefix="/services", tags=["Services & Departments"])

@router.get("", response_model=List[ServiceOut])
def list_services(department_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """List all available clinic services."""
    query = db.query(Service)
    if department_id:
        query = query.filter(Service.department_id == department_id)
    services = query.all()
    results = []
    for s in services:
        results.append({
            "id": s.id,
            "department_id": s.department_id,
            "name": s.name,
            "description": s.description,
            "duration_minutes": s.duration_minutes,
            "price": float(s.price),
            "department_name": s.department.name if s.department else None
        })
    return results

@router.get("/departments", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    """List all clinic departments."""
    return db.query(Department).all()

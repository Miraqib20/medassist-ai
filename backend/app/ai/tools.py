from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.services import doctor_service, appointment_service
from app.models.models import Service, FAQ, Department

TOOL_DEFINITIONS = [
    {
        "name": "search_doctors",
        "description": "Search for doctors by specialty, department, or keyword name",
        "parameters": {
            "type": "object",
            "properties": {
                "specialty": {"type": "string", "description": "Medical specialty (e.g. Dermatology, Cardiology, Pediatrics)"},
                "search": {"type": "string", "description": "Keyword search for doctor name or qualification"}
            }
        }
    },
    {
        "name": "get_doctor_details",
        "description": "Get detailed profile information for a specific doctor by doctor ID",
        "parameters": {
            "type": "object",
            "properties": {
                "doctor_id": {"type": "string", "description": "UUID of the doctor"}
            },
            "required": ["doctor_id"]
        }
    },
    {
        "name": "get_doctor_availability",
        "description": "Get real available time slots for a doctor on a specific date (YYYY-MM-DD)",
        "parameters": {
            "type": "object",
            "properties": {
                "doctor_id": {"type": "string", "description": "UUID of the doctor"},
                "date": {"type": "string", "description": "Target date in YYYY-MM-DD format"}
            },
            "required": ["doctor_id", "date"]
        }
    },
    {
        "name": "book_appointment",
        "description": "Book a new clinic appointment for the current patient",
        "parameters": {
            "type": "object",
            "properties": {
                "doctor_id": {"type": "string", "description": "UUID of doctor"},
                "appointment_date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                "start_time": {"type": "string", "description": "Time in HH:MM format (24-hour)"},
                "reason": {"type": "string", "description": "Reason for visit"},
                "service_id": {"type": "string", "description": "Optional service ID"}
            },
            "required": ["doctor_id", "appointment_date", "start_time"]
        }
    },
    {
        "name": "cancel_appointment",
        "description": "Cancel an existing appointment by appointment ID",
        "parameters": {
            "type": "object",
            "properties": {
                "appointment_id": {"type": "string", "description": "UUID of appointment to cancel"}
            },
            "required": ["appointment_id"]
        }
    },
    {
        "name": "reschedule_appointment",
        "description": "Reschedule an existing appointment to a new date and time",
        "parameters": {
            "type": "object",
            "properties": {
                "appointment_id": {"type": "string", "description": "UUID of appointment to reschedule"},
                "new_date": {"type": "string", "description": "New date YYYY-MM-DD"},
                "new_start_time": {"type": "string", "description": "New time HH:MM"}
            },
            "required": ["appointment_id", "new_date", "new_start_time"]
        }
    },
    {
        "name": "get_patient_appointments",
        "description": "Retrieve existing appointments for the current patient",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "get_clinic_services",
        "description": "List available clinic medical services and consultation prices",
        "parameters": {
            "type": "object",
            "properties": {
                "department_id": {"type": "string", "description": "Optional department ID filter"}
            }
        }
    },
    {
        "name": "search_faq",
        "description": "Search clinic FAQs for policies, insurance, parking, opening hours, etc.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Keyword query for FAQ"}
            },
            "required": ["query"]
        }
    }
]

def execute_tool(tool_name: str, arguments: Dict[str, Any], db: Session, user_id: Optional[str] = None, role: str = "PATIENT") -> Dict[str, Any]:
    """
    Executes backend database functions corresponding to AI tool calls.
    Returns structured results and action payloads for frontend UI rendering.
    """
    if tool_name == "search_doctors":
        specialty = arguments.get("specialty")
        search = arguments.get("search")
        doctors = doctor_service.get_all_doctors(db, specialty=specialty, search=search)
        return {
            "result_summary": f"Found {len(doctors)} doctors matching search criteria.",
            "doctors": doctors,
            "action": {
                "action_type": "SHOW_DOCTORS",
                "data": {"doctors": doctors}
            }
        }

    elif tool_name == "get_doctor_details":
        doc_id = arguments.get("doctor_id")
        doc = doctor_service.get_doctor_by_id(db, doc_id)
        if not doc:
            return {"error": "Doctor not found"}
        return {
            "doctor": doc,
            "action": {
                "action_type": "SHOW_DOCTORS",
                "data": {"doctors": [doc]}
            }
        }

    elif tool_name == "get_doctor_availability":
        doc_id = arguments.get("doctor_id")
        date_str = arguments.get("date")
        doc = doctor_service.get_doctor_by_id(db, doc_id)
        if not doc:
            return {"error": "Doctor not found"}
        slots = doctor_service.get_doctor_slots(db, doc_id, date_str)
        available_count = sum(1 for s in slots if s["is_available"])
        return {
            "doctor": doc,
            "date": date_str,
            "slots": slots,
            "result_summary": f"Dr. {doc['full_name']} has {available_count} available time slots on {date_str}.",
            "action": {
                "action_type": "SHOW_AVAILABILITY",
                "data": {
                    "doctor": doc,
                    "date": date_str,
                    "slots": slots
                }
            }
        }

    elif tool_name == "book_appointment":
        if not user_id:
            return {"error": "User authentication required to book appointments. Please log in first."}
        
        doc_id = arguments.get("doctor_id")
        app_date = arguments.get("appointment_date")
        start_time = arguments.get("start_time")
        reason = arguments.get("reason", "General Consultation")
        service_id = arguments.get("service_id")

        from app.schemas.schemas import AppointmentCreate
        app_in = AppointmentCreate(
            doctor_id=doc_id,
            service_id=service_id,
            appointment_date=app_date,
            start_time=start_time,
            reason=reason
        )
        try:
            app_result = appointment_service.create_appointment(db, patient_id=user_id, app_in=app_in)
            return {
                "status": "SUCCESS",
                "appointment": app_result,
                "message": f"Appointment booked successfully with {app_result['doctor_name']} for {app_date} at {start_time}.",
                "action": {
                    "action_type": "BOOK_APPOINTMENT",
                    "data": {"appointment": app_result}
                }
            }
        except Exception as e:
            return {"error": str(e.detail) if hasattr(e, 'detail') else str(e)}

    elif tool_name == "cancel_appointment":
        if not user_id:
            return {"error": "User authentication required"}
        app_id = arguments.get("appointment_id")
        try:
            res = appointment_service.cancel_appointment(db, appointment_id=app_id, user_id=user_id, role=role)
            return {
                "status": "SUCCESS",
                "message": f"Appointment ID {app_id} cancelled successfully.",
                "appointment": res
            }
        except Exception as e:
            return {"error": str(e.detail) if hasattr(e, 'detail') else str(e)}

    elif tool_name == "reschedule_appointment":
        if not user_id:
            return {"error": "User authentication required"}
        app_id = arguments.get("appointment_id")
        new_date = arguments.get("new_date")
        new_time = arguments.get("new_start_time")
        from app.schemas.schemas import AppointmentReschedule
        resched_in = AppointmentReschedule(appointment_date=new_date, start_time=new_time)
        try:
            res = appointment_service.reschedule_appointment(db, appointment_id=app_id, user_id=user_id, role=role, resched_in=resched_in)
            return {
                "status": "SUCCESS",
                "message": f"Appointment rescheduled to {new_date} at {new_time}.",
                "appointment": res
            }
        except Exception as e:
            return {"error": str(e.detail) if hasattr(e, 'detail') else str(e)}

    elif tool_name == "get_patient_appointments":
        if not user_id:
            return {"error": "User authentication required"}
        apps = appointment_service.get_user_appointments(db, user_id=user_id, role=role)
        return {
            "appointments": apps,
            "count": len(apps)
        }

    elif tool_name == "get_clinic_services":
        dept_id = arguments.get("department_id")
        query = db.query(Service)
        if dept_id:
            query = query.filter(Service.department_id == dept_id)
        services = query.all()
        services_list = [{
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "duration_minutes": s.duration_minutes,
            "price": float(s.price),
            "department_name": s.department.name if s.department else None
        } for s in services]
        return {
            "services": services_list,
            "action": {
                "action_type": "SHOW_SERVICES",
                "data": {"services": services_list}
            }
        }

    elif tool_name == "search_faq":
        query_str = arguments.get("query", "")
        faqs = db.query(FAQ).filter(
            (FAQ.question.ilike(f"%{query_str}%")) |
            (FAQ.answer.ilike(f"%{query_str}%")) |
            (FAQ.category.ilike(f"%{query_str}%"))
        ).limit(5).all()

        results = [{"question": f.question, "answer": f.answer, "category": f.category} for f in faqs]
        return {
            "faqs": results,
            "action": {
                "action_type": "SHOW_FAQ",
                "data": {"faqs": results}
            }
        }

    return {"error": f"Unknown tool name: {tool_name}"}

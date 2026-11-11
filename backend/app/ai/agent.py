import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.ai.prompts import SYSTEM_PROMPT, SAFETY_EMERGENCY_KEYWORDS, EMERGENCY_RESPONSE_TEXT
from app.ai.rag import RAGRetriever
from app.ai.tools import execute_tool, TOOL_DEFINITIONS

logger = logging.getLogger(__name__)

class AIAgent:
    """
    Central AI Assistant Orchestrator.
    Handles Emergency Safety Checks, RAG Knowledge Context, Tool Execution,
    and Structured Action Payloads for Frontend UI Widgets.
    """
    def __init__(self, db: Session):
        self.db = db

    def process_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        user_id: Optional[str] = None,
        role: str = "PATIENT"
    ) -> Dict[str, Any]:
        user_msg_lower = user_message.lower().strip()

        # 1. EMERGENCY SAFETY CHECK
        for keyword in SAFETY_EMERGENCY_KEYWORDS:
            if keyword in user_msg_lower:
                return {
                    "message": EMERGENCY_RESPONSE_TEXT,
                    "actions": [{
                        "action_type": "EMERGENCY_ALERT",
                        "data": {"message": "Severe medical symptoms detected. Contact 911/112 immediately."}
                    }]
                }

        # 2. RAG RETRIEVAL
        retrieved_items = RAGRetriever.retrieve(self.db, user_message, top_k=settings.RAG_TOP_K)
        rag_context = RAGRetriever.format_context(retrieved_items)

        actions = []
        response_text = ""

        # 3. INTENT DETECTION & TOOL EXECUTION (Rule-based Local Engine & LLM Router)

        # A. Doctor Search / Specialty Queries
        specialties = ["dermatologist", "dermatology", "cardiologist", "cardiology", "pediatrician", "pediatrics", "dentist", "dental", "neurologist", "orthopedic", "doctor", "physician"]
        matched_specialty = next((s for s in specialties if s in user_msg_lower), None)

        if ("doctor" in user_msg_lower or "physician" in user_msg_lower or matched_specialty or "find" in user_msg_lower or "list" in user_msg_lower) and not ("book" in user_msg_lower and "at" in user_msg_lower):
            spec_arg = matched_specialty if matched_specialty and matched_specialty not in ["doctor", "physician", "find", "list"] else None
            tool_res = execute_tool("search_doctors", {"specialty": spec_arg}, self.db, user_id, role)
            
            docs = tool_res.get("doctors", [])
            spec_title = matched_specialty.capitalize() if matched_specialty else "our qualified"
            if docs:
                response_text = f"Here are the {spec_title} specialists available at MediAssist Clinic:\n\nYou can click on any doctor below to check real availability slots or book an appointment!"
                if "action" in tool_res:
                    actions.append(tool_res["action"])
            else:
                response_text = f"We currently have several expert doctors available. Here are our featured specialists:"
                all_docs = execute_tool("search_doctors", {}, self.db, user_id, role)
                if "action" in all_docs:
                    actions.append(all_docs["action"])

        # B. Availability / Time Slot Check
        elif ("available" in user_msg_lower or "slot" in user_msg_lower or "schedule" in user_msg_lower or "timing" in user_msg_lower or "tomorrow" in user_msg_lower) and not ("book" in user_msg_lower and ("at" in user_msg_lower or "p.m." in user_msg_lower or "am" in user_msg_lower)):
            # Find first doctor or default to featured
            all_docs = execute_tool("search_doctors", {}, self.db, user_id, role)
            docs = all_docs.get("doctors", [])
            if docs:
                target_doc = docs[0]
                import datetime
                tomorrow_str = (datetime.date.today() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
                avail_res = execute_tool("get_doctor_availability", {"doctor_id": target_doc["id"], "date": tomorrow_str}, self.db, user_id, role)
                
                response_text = f"Here is the availability schedule for Dr. {target_doc['full_name']} ({target_doc['specialty']}) for tomorrow ({tomorrow_str}):"
                if "action" in avail_res:
                    actions.append(avail_res["action"])

        # C. Direct Appointment Booking Request
        elif "book" in user_msg_lower or "appointment" in user_msg_lower or "reserve" in user_msg_lower:
            if not user_id:
                response_text = "To book an appointment, please log in or register your patient account. Once logged in, you can select any doctor and choose your preferred time slot!"
                all_docs = execute_tool("search_doctors", {}, self.db, user_id, role)
                if "action" in all_docs:
                    actions.append(all_docs["action"])
            else:
                # Check patient's existing appointments first or display doctor selector
                all_docs = execute_tool("search_doctors", {}, self.db, user_id, role)
                docs = all_docs.get("doctors", [])
                response_text = "I can assist you in booking an appointment right away! Please choose your preferred doctor and date below:"
                if "action" in all_docs:
                    actions.append(all_docs["action"])

        # D. Services & Consultation Pricing Query
        elif "service" in user_msg_lower or "cost" in user_msg_lower or "price" in user_msg_lower or "fee" in user_msg_lower or "department" in user_msg_lower:
            serv_res = execute_tool("get_clinic_services", {}, self.db, user_id, role)
            services_list = serv_res.get("services", [])
            if services_list:
                lines = ["MediAssist Clinic offers comprehensive medical services across multiple departments. Here are our core services and consultation fees:\n"]
                for s in services_list:
                    dept_str = f" ({s['department_name']})" if s.get('department_name') else ""
                    lines.append(f"• **{s['name']}**{dept_str} — **${s['price']:.2f}** ({s['duration_minutes']} mins)")
                response_text = "\n".join(lines)
            else:
                response_text = "MediAssist Clinic offers comprehensive medical services across multiple departments."

            if "action" in serv_res:
                actions.append(serv_res["action"])

        # E. Existing Appointments Query
        elif "my appointment" in user_msg_lower or "my bookings" in user_msg_lower or "cancel" in user_msg_lower or "reschedule" in user_msg_lower:
            if not user_id:
                response_text = "Please log in to view, reschedule, or cancel your existing clinic appointments."
            else:
                apps_res = execute_tool("get_patient_appointments", {}, self.db, user_id, role)
                apps = apps_res.get("appointments", [])
                if apps:
                    response_text = f"You currently have {len(apps)} appointments on file. You can manage them directly from your Patient Dashboard!"
                else:
                    response_text = "You don't have any active appointments at the moment. Would you like to book one now?"
                    all_docs = execute_tool("search_doctors", {}, self.db, user_id, role)
                    if "action" in all_docs:
                        actions.append(all_docs["action"])

        # F. Hours / Location / Insurance / General FAQ RAG Query
        elif "hour" in user_msg_lower or "open" in user_msg_lower or "location" in user_msg_lower or "address" in user_msg_lower or "insurance" in user_msg_lower or "parking" in user_msg_lower or "phone" in user_msg_lower or "contact" in user_msg_lower:
            faq_res = execute_tool("search_faq", {"query": user_msg_lower}, self.db, user_id, role)
            faqs = faq_res.get("faqs", [])
            if faqs:
                response_text = f"**{faqs[0]['question']}**\n\n{faqs[0]['answer']}"
                if len(faqs) > 1:
                    response_text += f"\n\n**Additional Information:**\n{faqs[1]['answer']}"
                if "action" in faq_res:
                    actions.append(faq_res["action"])
            elif retrieved_items:
                response_text = f"{retrieved_items[0]['content']}"
            else:
                response_text = "MediAssist Clinic is open Monday through Saturday from 08:00 AM to 08:00 PM. Our address is 124 Healthcare Boulevard, Medical District. You can reach our support line at +1 (800) 555-MEDI."

        # G. General Fallback / Medical Educational Answer
        else:
            if retrieved_items:
                response_text = f"Based on clinic records:\n\n{retrieved_items[0]['content']}\n\nIs there anything else regarding doctors, services, or appointments I can help you with?"
            else:
                response_text = (
                    f"Hello! I am your MediAssist virtual assistant. I can help you find specialist doctors, check real-time schedule availability, book or manage appointments, and answer questions about clinic services.\n\n"
                    f"How can I assist you today? You can try asking:\n"
                    f"• *'Show me available dermatologists'*\n"
                    f"• *'What time does the clinic open?'*\n"
                    f"• *'What are your consultation fees?'*"
                )

        return {
            "message": response_text,
            "actions": actions
        }

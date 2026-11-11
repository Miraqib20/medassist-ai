import sys
import os
from datetime import datetime, timedelta

# Ensure python path includes backend app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, Base
from app.models.models import User, Patient, Doctor, Department, Service, DoctorAvailability, Appointment, FAQ, KnowledgeDocument, KnowledgeChunk, AuditLog
from app.core.security import get_password_hash

def seed_database():
    print("Initializing Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@mediassist.com").first():
            print("Database already contains seed data. Skipping.")
            return

        print("Seeding Users & Profiles...")
        # 1. Admin User
        admin_user = User(
            email="admin@mediassist.com",
            hashed_password=get_password_hash("admin123"),
            full_name="MediAssist Administrator",
            phone="+1 (800) 555-0100",
            role="ADMIN"
        )
        db.add(admin_user)

        # 2. Patient User
        patient_user = User(
            email="patient@mediassist.com",
            hashed_password=get_password_hash("patient123"),
            full_name="John Doe",
            phone="+1 (555) 234-5678",
            role="PATIENT"
        )
        db.add(patient_user)
        db.flush()

        patient_profile = Patient(
            user_id=patient_user.id,
            date_of_birth="1990-05-15",
            gender="Male",
            blood_group="O+",
            address="742 Evergreen Terrace, Springfield",
            emergency_contact="Jane Doe (+1 555-999-8888)",
            medical_history="No known drug allergies. Mild seasonal asthma."
        )
        db.add(patient_profile)

        # 3. Departments
        print("Seeding Departments...")
        departments_data = [
            ("General Practice", "Comprehensive primary medical care and health checkups.", "Stethoscope"),
            ("Dermatology", "Expert diagnosis and care for skin, hair, and nail conditions.", "Sparkles"),
            ("Cardiology", "Specialized heart and cardiovascular system diagnostics and treatment.", "Heart"),
            ("Pediatrics", "Dedicated, compassionate medical care for infants, children, and teens.", "Baby"),
            ("Dental Care", "Preventative, cosmetic, and surgical oral health procedures.", "Smile")
        ]
        dept_map = {}
        for name, desc, icon in departments_data:
            dept = Department(name=name, description=desc, icon=icon)
            db.add(dept)
            db.flush()
            dept_map[name] = dept.id

        # 4. Services
        print("Seeding Services...")
        services_data = [
            ("General Practice", "Routine Health Consultation", "Full physical checkup, vital evaluation, and health guidance.", 30, 60.00),
            ("General Practice", "Comprehensive Health Screening", "Diagnostic lab review, ECG screening, and body composition analysis.", 45, 120.00),
            ("Dermatology", "Full Skin Examination & Mole Mapping", "Thorough skin checkup for moles, acne, lesions, and rashes.", 30, 95.00),
            ("Dermatology", "Acne & Scarring Treatment", "Customized dermatological consultation and chemical peel prescription.", 30, 85.00),
            ("Cardiology", "Cardiac Consultation & Evaluation", "Specialist evaluation for chest discomfort, blood pressure, or arrhythmias.", 45, 150.00),
            ("Cardiology", "ECG & Echocardiogram Analysis", "Non-invasive ultrasound cardiac imaging and resting ECG.", 45, 200.00),
            ("Pediatrics", "Well-Child Developmental Check", "Growth milestone evaluation, physical exam, and parental guidance.", 30, 70.00),
            ("Pediatrics", "Pediatric Immunization Session", "Standard child vaccination administration and health monitoring.", 20, 50.00),
            ("Dental Care", "Dental Cleaning & Hygiene Polish", "Teeth tartar removal, scaling, deep hygiene polish, and cavity check.", 45, 90.00),
            ("Dental Care", "Comprehensive Tooth Repair & Extraction", "Restorative filling treatment or surgical extraction.", 60, 180.00)
        ]
        service_map = {}
        for dept_name, name, desc, dur, price in services_data:
            serv = Service(
                department_id=dept_map.get(dept_name),
                name=name,
                description=desc,
                duration_minutes=dur,
                price=price
            )
            db.add(serv)
            db.flush()
            service_map[name] = serv.id

        # 5. Doctors
        print("Seeding Doctors...")
        doctors_info = [
            {
                "email": "doctor@mediassist.com",
                "password": "doctor123",
                "full_name": "Dr. Sarah Jenkins, MD",
                "dept": "General Practice",
                "specialty": "Family Medicine Specialist",
                "qualification": "MD (Harvard Medical School), Board Certified Family Physician",
                "exp": 12,
                "fee": 60.00,
                "bio": "Dr. Sarah Jenkins has over 12 years of experience providing compassionate family medicine care. She focuses on preventative medicine and chronic disease management.",
                "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop",
                "featured": True
            },
            {
                "email": "chen@mediassist.com",
                "password": "doctor123",
                "full_name": "Dr. Robert Chen, MD",
                "dept": "Dermatology",
                "specialty": "Dermatologist & Skin Surgeon",
                "qualification": "MD (Johns Hopkins), Fellowship in Dermatologic Surgery",
                "exp": 9,
                "fee": 95.00,
                "bio": "Dr. Chen specializes in advanced acne treatments, mole screenings, skin cancer prevention, and cosmetic dermatology.",
                "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop",
                "featured": True
            },
            {
                "email": "rodriguez@mediassist.com",
                "password": "doctor123",
                "full_name": "Dr. Emily Rodriguez, MD",
                "dept": "Cardiology",
                "specialty": "Cardiologist",
                "qualification": "MD (Stanford University), FACC Cardiovascular Disease Fellow",
                "exp": 15,
                "fee": 150.00,
                "bio": "Dr. Rodriguez is a leading cardiologist specializing in echocardiography, hypertension, and preventative heart failure management.",
                "avatar": "https://images.unsplash.com/photo-1594824813566-88855ce78961?q=80&w=300&auto=format&fit=crop",
                "featured": True
            },
            {
                "email": "patel@mediassist.com",
                "password": "doctor123",
                "full_name": "Dr. Michael Patel, MD",
                "dept": "Pediatrics",
                "specialty": "Pediatrician",
                "qualification": "MD (Yale University), American Academy of Pediatrics Fellow",
                "exp": 8,
                "fee": 70.00,
                "bio": "Dr. Patel is dedicated to nurturing child development from infancy through adolescence with compassionate, child-friendly care.",
                "avatar": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop",
                "featured": True
            },
            {
                "email": "vance@mediassist.com",
                "password": "doctor123",
                "full_name": "Dr. Amanda Vance, DDS",
                "dept": "Dental Care",
                "specialty": "Cosmetic & General Dentist",
                "qualification": "DDS (Columbia University School of Dental Medicine)",
                "exp": 10,
                "fee": 90.00,
                "bio": "Dr. Vance offers gentle, high-tech dental treatments including hygiene care, painless extractions, and smile restoration.",
                "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop",
                "featured": False
            }
        ]

        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        doc_objects = []

        for d_info in doctors_info:
            d_user = User(
                email=d_info["email"],
                hashed_password=get_password_hash(d_info["password"]),
                full_name=d_info["full_name"],
                phone="+1 (555) 300-1122",
                role="DOCTOR"
            )
            db.add(d_user)
            db.flush()

            doc = Doctor(
                user_id=d_user.id,
                department_id=dept_map.get(d_info["dept"]),
                specialty=d_info["specialty"],
                qualification=d_info["qualification"],
                experience_years=d_info["exp"],
                consultation_fee=d_info["fee"],
                bio=d_info["bio"],
                avatar_url=d_info["avatar"],
                is_featured=d_info["featured"]
            )
            db.add(doc)
            db.flush()
            doc_objects.append(doc)

            # Add availability schedules (Mon-Fri 09:00 - 17:00, Sat 09:00 - 13:00)
            for day in days:
                end_t = "13:00" if day == "Saturday" else "17:00"
                avail = DoctorAvailability(
                    doctor_id=doc.id,
                    day_of_week=day,
                    start_time="09:00",
                    end_time=end_t,
                    slot_duration_minutes=30,
                    is_available=True
                )
                db.add(avail)

        # 6. Sample Appointments
        print("Seeding Sample Appointments...")
        today = datetime.now()
        tomorrow_str = (today + timedelta(days=1)).strftime("%Y-%m-%d")
        next_week_str = (today + timedelta(days=4)).strftime("%Y-%m-%d")

        sample_app1 = Appointment(
            patient_id=patient_user.id,
            doctor_id=doc_objects[0].id, # Dr. Sarah Jenkins
            service_id=service_map.get("Routine Health Consultation"),
            appointment_date=tomorrow_str,
            start_time="10:00",
            end_time="10:30",
            status="Confirmed",
            reason="Annual wellness physical examination."
        )
        sample_app2 = Appointment(
            patient_id=patient_user.id,
            doctor_id=doc_objects[1].id, # Dr. Robert Chen
            service_id=service_map.get("Full Skin Examination & Mole Mapping"),
            appointment_date=next_week_str,
            start_time="14:00",
            end_time="14:30",
            status="Pending",
            reason="Skin rash evaluation on forearm."
        )
        db.add_all([sample_app1, sample_app2])

        # 7. FAQs
        print("Seeding 20 Clinic FAQs...")
        faqs_data = [
            ("Hours & Operation", "What are the clinic's operating hours?", "MediAssist Clinic is open Monday through Friday from 08:00 AM to 08:00 PM, and Saturday from 09:00 AM to 02:00 PM. We are closed on Sundays."),
            ("Location & Parking", "Where is the clinic located and is parking available?", "We are located at 124 Healthcare Boulevard, Medical District. Free dedicated multi-story patient parking is available behind the clinic main building."),
            ("Appointments", "How far in advance should I book an appointment?", "Routine non-urgent consultations can be booked up to 30 days in advance. Same-day appointments open every morning at 08:00 AM for urgent care."),
            ("Insurance", "What medical insurance plans do you accept?", "We accept major health insurance providers including Blue Cross, Aetna, Cigna, UnitedHealthcare, Medicare, and Humana. Please present your insurance card at check-in."),
            ("Cancellation Policy", "What is your appointment cancellation policy?", "Appointments can be cancelled or rescheduled free of charge up to 24 hours prior to the scheduled start time through your patient portal or AI assistant."),
            ("Emergency Care", "Does MediAssist Clinic handle emergency medical care?", "No, MediAssist Clinic provides outpatient and primary care. For life-threatening emergencies (chest pain, stroke, severe trauma), call 911/112 or visit an ER immediately."),
            ("Payments", "What payment methods are accepted for consultation fees?", "We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and cash. Co-pays are collected at the reception desk before your appointment."),
            ("Preparation", "What documents should I bring to my first appointment?", "Please bring a valid photo ID, your health insurance card, a list of current medications/supplements, and any recent lab reports or medical records."),
            ("Telehealth", "Do you offer virtual or telehealth consultations?", "Yes! Telehealth consultations are available for general practice follow-ups, dermatological review, and lab results discussions."),
            ("Prescriptions", "How do I request a prescription refill?", "You can request refills via the MediAssist patient portal or ask our AI assistant to notify your attending doctor's care team."),
            ("Pediatrics", "Can parents accompany children into consultation rooms?", "Yes, parents or legal guardians are required to accompany patients under 18 years of age throughout the entire pediatric visit."),
            ("Lab Diagnostics", "How quickly will I receive my lab test results?", "Standard blood and urine panel results are available in your patient dashboard within 24 to 48 hours. Specialized histology may take 3-5 business days."),
            ("Vaccinations", "Are travel vaccinations available at MediAssist Clinic?", "Yes, our General Practice department offers routine and international travel vaccinations including Yellow Fever, Typhoid, and Hepatitis A/B."),
            ("Referrals", "Do I need a physician referral to see a specialist doctor?", "In most cases, direct specialist bookings are allowed. However, certain insurance plans require a primary care physician referral."),
            ("Medical Records", "How can I request copies of my medical records?", "Submit a medical records request form through your patient dashboard. Digital PDF copies are processed within 2 business days free of charge."),
            ("Dental", "How often should I get a professional dental cleaning?", "Dentists recommend a professional scaling and cleaning every 6 months to prevent plaque buildup and periodontal disease."),
            ("Skin Care", "What should I avoid before a full skin examination?", "Avoid wearing makeup, heavy lotions, or nail polish on the day of your dermatological skin check to ensure clear lesion visibility."),
            ("Cardiology", "Is fasting required before an ECG or cholesterol test?", "Lipid profile blood tests require fasting for 8-12 hours beforehand. Standard resting ECG scans do not require fasting."),
            ("Wait Times", "What is the average waiting time upon arrival?", "Patients who arrive 10 minutes before their booked appointment time experience an average wait time of under 12 minutes."),
            ("Contact", "How can I contact the clinic support desk directly?", "Call our main helpline at +1 (800) 555-MEDI or email support@mediassist.clinic. Our chat assistant is also available 24/7.")
        ]

        for cat, q, a in faqs_data:
            faq = FAQ(category=cat, question=q, answer=a, is_active=True)
            db.add(faq)

        # 8. Knowledge Base Documents & Chunks for RAG
        print("Seeding Knowledge Base Documents for RAG...")
        doc1 = KnowledgeDocument(
            title="MediAssist Clinic Patient Handbook & Operating Guidelines",
            category="Clinic Policies",
            content="""MediAssist Clinic Overview:
MediAssist Clinic is a premier multi-specialty healthcare provider dedicated to delivering patient-centered, high-quality medical services.
Operating Hours: Monday to Friday: 08:00 AM - 08:00 PM. Saturday: 09:00 AM - 02:00 PM. Sunday: Closed.
Location: 124 Healthcare Boulevard, Medical District. Main Line: +1 (800) 555-MEDI.

Appointment Booking & Attendance Guidelines:
Patients are advised to check in 10 minutes prior to their scheduled appointment time. If a patient is more than 15 minutes late, the appointment may need to be rescheduled to avoid impacting other patients.
Cancellation & Rescheduling: Cancellations must be made at least 24 hours in advance via the online patient portal or MediAssist AI assistant.

Emergency & Safety Warning:
MediAssist Clinic provides outpatient consultation and diagnostic care. For acute emergency symptoms such as chest pain, shortness of breath, sudden weakness, or severe hemorrhage, call 911 or 112 immediately or proceed to the nearest hospital Emergency Room."""
        )
        db.add(doc1)
        db.flush()

        # Create RAG chunks
        from app.services.admin_service import add_knowledge_document
        add_knowledge_document(db, title="Cardiology Department Care Instructions", category="Medical Instructions", content="""Cardiology Department Instructions:
For cardiac consultations, please bring your recent electrocardiograms (ECG) and blood pressure logs. Avoid caffeine or heavy exercise 2 hours prior to stress tests or echocardiography. If experiencing acute chest pain or left arm numbness, do not wait for an appointment; call emergency services immediately.""")

        db.commit()
        print("Seed Data Completed Successfully!")
    
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

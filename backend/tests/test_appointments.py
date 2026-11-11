import datetime

def test_get_doctors_list(client):
    response = client.get("/api/doctors")
    assert response.status_code == 200
    doctors = response.json()
    assert len(doctors) >= 5

def test_doctor_availability_slots(client):
    docs = client.get("/api/doctors").json()
    doc_id = docs[0]["id"]
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    
    response = client.get(f"/api/doctors/{doc_id}/availability?date={tomorrow}")
    assert response.status_code == 200
    data = response.json()
    assert "slots" in data
    assert len(data["slots"]) > 0

def test_appointment_booking_flow_and_double_booking_prevention(client):
    # 1. Login as patient
    login_res = client.post("/api/auth/login", json={
        "email": "patient@mediassist.com",
        "password": "patient123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Find doctor
    docs = client.get("/api/doctors").json()
    doc_id = docs[0]["id"]
    target_date = (datetime.date.today() + datetime.timedelta(days=10)).strftime("%Y-%m-%d")
    target_time = "11:00"

    # 3. Book appointment
    book_res = client.post("/api/appointments", json={
        "doctor_id": doc_id,
        "appointment_date": target_date,
        "start_time": target_time,
        "reason": "Test routine checkup"
    }, headers=headers)

    assert book_res.status_code == 201
    app_data = book_res.json()
    assert app_data["start_time"] == target_time

    # 4. Attempt double booking for same doctor at same date & time -> Must Fail (400 Bad Request)
    double_book_res = client.post("/api/appointments", json={
        "doctor_id": doc_id,
        "appointment_date": target_date,
        "start_time": target_time,
        "reason": "Conflicting attempt"
    }, headers=headers)

    assert double_book_res.status_code == 400
    assert "already booked" in double_book_res.json()["detail"].lower()

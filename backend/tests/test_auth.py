def test_login_patient_success(client):
    response = client.post("/api/auth/login", json={
        "email": "patient@mediassist.com",
        "password": "patient123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "PATIENT"

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={
        "email": "patient@mediassist.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_register_new_patient(client):
    response = client.post("/api/auth/register", json={
        "email": "newpatient@test.com",
        "password": "password123",
        "full_name": "Test Patient",
        "phone": "+1 555-000-1111",
        "role": "PATIENT"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newpatient@test.com"
    assert data["role"] == "PATIENT"

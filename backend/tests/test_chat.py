def test_chatbot_doctor_search_intent(client):
    response = client.post("/api/chat", json={
        "message": "I want to see a dermatologist"
    })
    assert response.status_code == 200
    data = response.json()
    assert "conversation_id" in data
    assert "message" in data
    assert len(data["actions"]) > 0
    assert data["actions"][0]["action_type"] == "SHOW_DOCTORS"

def test_chatbot_emergency_trigger(client):
    response = client.post("/api/chat", json={
        "message": "I have severe chest pain and cannot breathe"
    })
    assert response.status_code == 200
    data = response.json()
    assert "EMERGENCY NOTICE" in data["message"]
    assert data["actions"][0]["action_type"] == "EMERGENCY_ALERT"

def test_chatbot_faq_rag_query(client):
    response = client.post("/api/chat", json={
        "message": "What time does the clinic open?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "08:00 AM" in data["message"] or "operating hours" in data["message"].lower()

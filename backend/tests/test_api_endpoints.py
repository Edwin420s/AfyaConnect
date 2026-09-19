import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_facilities_endpoint():
    response = client.get("/api/facilities")
    assert response.status_code == 200
    facilities = response.json()
    assert len(facilities) >= 3
    assert any(f["name"] == "Aga Khan Univ. Hospital" for f in facilities)


def test_hospital_dashboard_endpoint():
    response = client.get("/api/hospital/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert data["metrics"]["totalRequests"] >= 4


def test_conversations_interact_endpoint():
    response = client.post(
        "/api/conversations/interact",
        json={
            "message": "Nimekuwa na maumivu ya tumbo for two days",
            "isAudioSnippet": False,
            "languagePreference": "swa_eng",
            "patientName": "Jane M.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "feedbackCard" in data
    assert data["feedbackCard"]["type"] == "doctor_availability"
    assert "nearbyFacilities" in data
    assert len(data["nearbyFacilities"]) >= 1


def test_appointment_booking_endpoint():
    response = client.post(
        "/api/appointments/book",
        json={
            "careRequestId": "#10482",
            "patientPhone": "+254712345678",
            "facilityName": "Aga Khan Univ. Hospital",
            "doctorName": "Dr. Wanjiku Kamau",
            "slotTime": "Kesho 10:30 AM",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "CONFIRMED"
    assert "#AC-NBO-" in data["tokenPass"]


def test_conversations_interact_english_mode():
    response = client.post(
        "/api/conversations/interact",
        json={
            "message": "I have had a severe migraine and dizziness since yesterday.",
            "isAudioSnippet": False,
            "languagePreference": "eng",
            "patientName": "John D.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dialectTag"] == "ENGLISH"
    assert "I understand" in data["responseMessage"] or "I have received" in data["responseMessage"]
    assert "Kesho" not in data["feedbackCard"]["date"]
    assert "Tomorrow" in data["feedbackCard"]["date"] or "Today" in data["feedbackCard"]["date"]


def test_conversations_interact_open_ended_input():
    # 1. Orthopedic injury
    res_ortho = client.post(
        "/api/conversations/interact",
        json={
            "message": "I twisted my ankle playing football and it is very swollen and painful to walk.",
            "languagePreference": "eng",
        },
    )
    assert res_ortho.status_code == 200
    data_ortho = res_ortho.json()
    assert "Orthopedics" in data_ortho["feedbackCard"]["department"]
    assert len(data_ortho["nearbyFacilities"]) >= 1

    # 2. Ophthalmology inquiry
    res_eye = client.post(
        "/api/conversations/interact",
        json={
            "message": "My left eye has been blurry and painful with redness for three days.",
            "languagePreference": "eng",
        },
    )
    assert res_eye.status_code == 200
    data_eye = res_eye.json()
    assert "Eye" in data_eye["feedbackCard"]["department"] or "Ophthalmology" in data_eye["feedbackCard"]["department"]
    assert len(data_eye["nearbyFacilities"]) >= 1


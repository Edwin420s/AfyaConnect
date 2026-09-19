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

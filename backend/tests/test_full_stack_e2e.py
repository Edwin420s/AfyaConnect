"""
AfyaConnect Full-Stack End-to-End Two-Sided Communication Test
Verifies complete synchronization between Patient Side and Hospital Side.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.app.database.connection import SessionLocal
from backend.app.database.models import CareRequest, Appointment, AuditLog

client = TestClient(app)


def test_end_to_end_two_sided_flow():
    # -------------------------------------------------------------------------
    # STEP 1: Patient Side - Initial Call / Chat Triage
    # Patient initiates contact in Swahili/English code-switching without manually typing location.
    # -------------------------------------------------------------------------
    patient_inquiry = "Nimekuwa na maumivu ya tumbo for two days, na nahisi homa kali tangu jana."
    response = client.post(
        "/api/conversations/interact",
        json={
            "message": patient_inquiry,
            "isAudioSnippet": False,
            "languagePreference": "swa_eng",
            "patientName": "Jane M.",
            "patientPhone": "+254712345678",
        },
    )
    assert response.status_code == 200
    interact_data = response.json()

    # Verify Patient Feedback Card
    feedback_card = interact_data.get("feedbackCard")
    assert feedback_card is not None
    assert feedback_card["type"] in ["doctor_availability", "request_received"]
    assert "department" in feedback_card
    assert feedback_card["department"] != ""

    # Verify Nearby Facilities (Auto-Location without asking "Where are you located?")
    nearby = interact_data.get("nearbyFacilities", [])
    assert len(nearby) >= 1
    primary_facility = nearby[0]
    assert "distanceKm" in primary_facility
    assert "leadDoctor" in primary_facility
    assert "earliestSlot" in primary_facility

    # Retrieve the newly created care request
    care_req_id = interact_data.get("careRequestId") or feedback_card.get("requestId")
    assert care_req_id is not None

    # -------------------------------------------------------------------------
    # STEP 2: Hospital Side - Reception Dashboard Intake
    # "Who is requesting care and what needs to be handled?"
    # -------------------------------------------------------------------------
    dash_res = client.get("/api/hospital/dashboard?facility_id=f-agakhan")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()

    # Hospital sees metrics and incoming inbox
    assert "metrics" in dash_data
    assert "inbox" in dash_data
    assert dash_data["metrics"]["totalRequests"] >= 1

    # Verify care request is in hospital inbox
    inbox_items = dash_data["inbox"]
    matched_request = next(
        (item for item in inbox_items if item["id"] == care_req_id or item["referenceNumber"] == care_req_id),
        None,
    )
    # If not specifically in Aga Khan inbox, verify via direct care request API
    if not matched_request:
        req_res = client.get(f"/api/care-requests/{care_req_id}")
        assert req_res.status_code == 200
        matched_request = req_res.json()

    assert matched_request is not None
    assert matched_request["patientName"] == "Jane M."
    assert "triageScore" in matched_request

    # -------------------------------------------------------------------------
    # STEP 3: Hospital Roster & Availability (Source of Truth)
    # Claude and the platform never invent doctors or slots.
    # -------------------------------------------------------------------------
    avail_res = client.get("/api/availability/check?facility_id=f-agakhan&department_code=OPD&preferred_day=today")
    assert avail_res.status_code == 200
    avail_data = avail_res.json()

    assert len(avail_data["availableDoctors"]) >= 1
    doctor = next((d for d in avail_data["availableDoctors"] if len(d["freeSlots"]) >= 1), avail_data["availableDoctors"][0])
    assert doctor["doctorName"] != ""
    assert len(doctor["freeSlots"]) >= 1
    selected_doctor_name = doctor["doctorName"]
    selected_slot = doctor["freeSlots"][0]

    # -------------------------------------------------------------------------
    # STEP 4: Hospital Assigns Doctor & Proposes Slot
    # -------------------------------------------------------------------------
    assign_res = client.post(
        f"/api/hospital/care-requests/{care_req_id}/assign-doctor",
        json={
            "doctorId": doctor["doctorId"],
            "doctorName": selected_doctor_name,
            "slotTime": selected_slot,
        },
    )
    assert assign_res.status_code == 200
    assign_data = assign_res.json()
    assert assign_data["assignedDoctorName"] == selected_doctor_name
    assert assign_data["status"] == "SLOT_PROPOSED"

    # -------------------------------------------------------------------------
    # STEP 5: Patient Confirms Appointment & Receives Digital Token Pass
    # 8-step timeline reaches step 8: APPOINTMENT BOOKED
    # -------------------------------------------------------------------------
    book_res = client.post(
        "/api/appointments/book",
        json={
            "careRequestId": care_req_id,
            "patientPhone": "+254712345678",
            "facilityName": "Aga Khan Univ. Hospital",
            "doctorName": selected_doctor_name,
            "slotTime": selected_slot,
            "facilityId": "f-agakhan",
        },
    )
    assert book_res.status_code == 200
    book_data = book_res.json()
    assert book_data["success"] is True
    assert book_data["status"] == "CONFIRMED"
    assert book_data["tokenPass"].startswith("#AC-NBO-")

    # -------------------------------------------------------------------------
    # STEP 6: Verify 8-Step Timeline Synchronization
    # -------------------------------------------------------------------------
    final_req_res = client.get(f"/api/care-requests/{care_req_id}")
    assert final_req_res.status_code == 200
    final_req = final_req_res.json()

    assert final_req["status"] == "CONFIRMED"
    assert final_req["tokenPass"] == book_data["tokenPass"]

    # Verify 8 steps in events timeline
    timeline = final_req.get("timeline", [])
    assert len(timeline) == 8

    # Step 1: CALL / CHAT MADE (Completed)
    assert timeline[0]["step"] == 1
    assert "CALL / CHAT MADE" in timeline[0]["title"]
    assert timeline[0]["completed"] is True

    # Step 7: Patient confirmed (Completed)
    assert timeline[6]["step"] == 7
    assert "Patient confirmed" in timeline[6]["title"]
    assert timeline[6]["completed"] is True

    # Step 8: APPOINTMENT BOOKED (Completed & Active)
    assert timeline[7]["step"] == 8
    assert "APPOINTMENT BOOKED" in timeline[7]["title"]
    assert timeline[7]["completed"] is True
    assert timeline[7]["active"] is True

    # -------------------------------------------------------------------------
    # STEP 7: Verify Multi-channel Notification and Audit Logging
    # -------------------------------------------------------------------------
    db = SessionLocal()
    try:
        # Verify Appointment record in database
        appt = db.query(Appointment).filter(Appointment.careRequestId == care_req_id).first()
        assert appt is not None
        assert appt.tokenPass == book_data["tokenPass"]

        # Verify Audit Log
        audit = db.query(AuditLog).filter(AuditLog.targetId == appt.id).first()
        assert audit is not None
        assert audit.action == "APPOINTMENT_CONFIRMED"
    finally:
        db.close()


def test_emergency_red_flag_short_circuit():
    """
    Verifies that emergency symptoms immediately short-circuit routine booking,
    display 1199 Red Cross hotline, and prompt emergency casualty direction.
    """
    response = client.post(
        "/api/conversations/interact",
        json={
            "message": "Nina maumivu makali ya kifua na nahisi kizunguzungu",
            "isAudioSnippet": False,
            "languagePreference": "swa_eng",
            "patientName": "Jane M.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["isEmergency"] is True
    assert data["triageScore"] == 5
    assert data["urgency"] == "EMERGENCY"
    assert "1199" in data["responseMessage"] or any(
        "1199" in str(h) for h in data.get("emergencyHotlines", [])
    )

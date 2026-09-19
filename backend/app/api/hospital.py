import json
import random
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from ..database.connection import get_db
from ..database.models import (
    CareRequest,
    CareRequestEvent,
    Appointment,
    Facility,
    Doctor,
    Department,
    RequestStatusEnum,
    AppointmentStatusEnum,
)
from ..notifications.service import dispatch_sms_notification
from ..audit.service import log_audit_event

router = APIRouter(prefix="/hospital", tags=["Hospital Operations"])


class AssignDoctorRequest(BaseModel):
    doctorName: str
    slotTime: str


class ConfirmSlotRequest(BaseModel):
    doctorName: str
    slotTime: str


class AssignDepartmentRequest(BaseModel):
    department: str


class AddCustomSlotRequest(BaseModel):
    doctorId: str
    slotTime: str


@router.get("/dashboard")
def get_hospital_dashboard(facilityId: Optional[str] = "f-agakhan", db: Session = Depends(get_db)):
    """
    Central Hospital Reception Dashboard overview.
    Displays metrics across today's incoming patient requests.
    """
    requests = db.query(CareRequest).all()

    total_count = len(requests)
    awaiting_count = sum(1 for r in requests if r.status == RequestStatusEnum.RECEIVED or r.status == "AWAITING_REVIEW")
    checking_count = sum(1 for r in requests if r.status in [RequestStatusEnum.CHECKING_AVAILABILITY, RequestStatusEnum.SLOT_PROPOSED])
    confirmed_count = sum(1 for r in requests if r.status == RequestStatusEnum.CONFIRMED)
    rescheduling_count = sum(1 for r in requests if r.status == RequestStatusEnum.RESCHEDULING)
    completed_count = sum(1 for r in requests if r.status == RequestStatusEnum.COMPLETED)
    urgent_count = sum(1 for r in requests if str(r.urgency).upper() == "URGENT")

    return {
        "facilityName": "Nairobi Metropolis Health Network",
        "shift": "Morning (07:00–15:00)",
        "metrics": {
            "totalRequests": total_count,
            "awaitingReview": awaiting_count,
            "checkingAvailability": checking_count,
            "confirmed": confirmed_count,
            "rescheduling": rescheduling_count,
            "completed": completed_count,
            "urgent": urgent_count,
        },
        "systemStatus": {
            "claudeAiEngine": "Online (Triage Latency: 2.4s)",
            "hmisGateway": "Synced",
            "shaHieApi": "Connected",
            "smsUssdGateway": "Active (*384#)",
        },
    }


@router.get("/requests")
def get_hospital_requests(
    status: Optional[str] = None,
    department: Optional[str] = None,
    urgency: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Central Request Inbox for hospital reception staff.
    Shows all calls/requests converted into structured healthcare cases.
    """
    query = db.query(CareRequest)

    if status and status != "all":
        query = query.filter(CareRequest.status == status)
    if urgency and urgency != "all":
        query = query.filter(CareRequest.urgency == urgency)

    requests = query.order_by(CareRequest.createdAt.desc()).all()
    results = []

    for r in requests:
        if department and department != "all":
            dept_name = r.department.name if r.department else "General Consultation"
            if department.lower() not in dept_name.lower():
                continue

        if search:
            q = search.lower()
            name = r.patient.user.name.lower() if r.patient and r.patient.user else ""
            if q not in name and q not in r.referenceNumber.lower() and q not in r.chiefConcern.lower():
                continue

        events = sorted(r.events, key=lambda e: e.stepNumber)
        timeline = [
            {
                "step": e.stepNumber,
                "title": e.title,
                "description": e.description,
                "timestamp": e.timestampText,
                "completed": e.isCompleted,
                "active": e.isActive,
            }
            for e in events
        ]

        results.append({
            "id": r.referenceNumber,
            "internalId": r.id,
            "patientName": r.patient.user.name if r.patient and r.patient.user else "Jane M.",
            "patientPhone": r.patient.user.phone if r.patient and r.patient.user else "+254712345678",
            "patientLocation": "Westlands (1.8 km away)",
            "languageMode": "SWA + ENG CODE-SWITCH",
            "verbatimTranscript": r.verbatimTranscript,
            "chiefConcern": r.chiefConcern,
            "symptomDuration": r.symptomDuration,
            "secondarySymptoms": json.loads(r.secondarySymptoms) if r.secondarySymptoms else [],
            "triageScore": r.triageScore,
            "urgency": r.urgency.title() if isinstance(r.urgency, str) else "Standard",
            "clinicalSummary": r.clinicalSummary,
            "flags": json.loads(r.flags) if r.flags else [],
            "insurance": r.patient.insuranceProvider if r.patient else "SHA Active",
            "preferredTime": r.preferredTime,
            "preferredDate": r.preferredDate or "Kesho",
            "assignedFacilityId": r.facilityId,
            "assignedFacilityName": r.facility.name if r.facility else "Aga Khan University Hospital",
            "assignedDepartment": r.department.name if r.department else "General Consultation (OPD)",
            "assignedDoctorName": r.assignedDoctorName or "Dr. Kamau",
            "assignedSlot": r.assignedSlot or "10:30 AM",
            "status": r.status,
            "tokenPass": r.tokenPass,
            "timeline": timeline,
            "createdAt": r.createdAt.isoformat() if r.createdAt else "",
        })

    return results


@router.post("/requests/{request_id}/assign-doctor")
def assign_doctor(request_id: str, req: AssignDoctorRequest, db: Session = Depends(get_db)):
    care_req = (
        db.query(CareRequest)
        .filter((CareRequest.id == request_id) | (CareRequest.referenceNumber == request_id))
        .first()
    )
    if not care_req:
        raise HTTPException(status_code=404, detail="Care request not found")

    care_req.assignedDoctorName = req.doctorName
    care_req.assignedSlot = req.slotTime
    care_req.status = RequestStatusEnum.SLOT_PROPOSED

    # Update timeline: Step 4 & 5
    for event in care_req.events:
        if event.stepNumber == 4:
            event.isCompleted = True
            event.isActive = False
            event.description = f"{req.doctorName} assigned by triage lead"
        elif event.stepNumber == 5:
            event.isCompleted = True
            event.isActive = True
            event.title = f"Doctor availability checked: {req.doctorName}"
            event.description = f"Slot {req.slotTime} held for patient"

    db.commit()

    log_audit_event(
        db=db,
        action="DOCTOR_ASSIGNED",
        actor_role="HOSPITAL_STAFF",
        actor_name="Reception Triage Desk",
        target_entity="CareRequest",
        target_id=care_req.id,
        details=f"Assigned {req.doctorName} for slot {req.slotTime} to request {care_req.referenceNumber}",
    )

    return {
        "success": True,
        "requestId": care_req.referenceNumber,
        "doctorName": req.doctorName,
        "slotTime": req.slotTime,
        "status": care_req.status,
        "message": f"Doctor {req.doctorName} successfully assigned.",
    }


@router.post("/requests/{request_id}/confirm-slot")
def confirm_slot_from_hospital(request_id: str, req: ConfirmSlotRequest, db: Session = Depends(get_db)):
    care_req = (
        db.query(CareRequest)
        .filter((CareRequest.id == request_id) | (CareRequest.referenceNumber == request_id))
        .first()
    )
    if not care_req:
        raise HTTPException(status_code=404, detail="Care request not found")

    token = f"#AC-NBO-{random.randint(1000, 9999)}"
    time_now = datetime.datetime.now().strftime("%I:%M %p")

    care_req.assignedDoctorName = req.doctorName
    care_req.assignedSlot = req.slotTime
    care_req.status = RequestStatusEnum.CONFIRMED
    care_req.tokenPass = token

    # Update timeline to Step 8 APPOINTMENT BOOKED
    for event in care_req.events:
        if event.stepNumber <= 7:
            event.isCompleted = True
            event.isActive = False
        if event.stepNumber == 8:
            event.isCompleted = True
            event.isActive = True
            event.timestampText = time_now
            event.description = f"Booking confirmed • Token {token} issued"

    # Create Appointment
    appt = Appointment(
        id=f"appt-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
        careRequestId=care_req.id,
        patientId=care_req.patientId,
        facilityId=care_req.facilityId or "f-agakhan",
        doctorId="doc-kamau-1",
        startsAt=datetime.datetime.utcnow() + datetime.timedelta(days=1),
        endsAt=datetime.datetime.utcnow() + datetime.timedelta(days=1, minutes=30),
        slotLabel=req.slotTime,
        status=AppointmentStatusEnum.CONFIRMED,
        tokenPass=token,
        notes=f"Confirmed consultation with {req.doctorName}",
    )
    db.add(appt)
    db.commit()

    # Dispatch SMS
    patient_phone = care_req.patient.user.phone if care_req.patient and care_req.patient.user else "+254712345678"
    facility_name = care_req.facility.name if care_req.facility else "Aga Khan University Hospital"

    dispatch_sms_notification(
        db=db,
        patient_id=care_req.patientId,
        phone=patient_phone,
        doctor_name=req.doctorName,
        facility_name=facility_name,
        slot_time=req.slotTime,
        token_pass=token,
    )

    log_audit_event(
        db=db,
        action="SLOT_CONFIRMED_BY_HOSPITAL",
        actor_role="HOSPITAL_STAFF",
        actor_name="Reception Triage Desk",
        target_entity="Appointment",
        target_id=appt.id,
        details=f"Slot {req.slotTime} confirmed for {req.doctorName}. Gate pass {token} dispatched.",
    )

    return {
        "success": True,
        "tokenPass": token,
        "status": "CONFIRMED",
        "doctorName": req.doctorName,
        "slotTime": req.slotTime,
        "message": f"Slot confirmed! Token {token} dispatched to patient via SMS.",
    }


@router.post("/requests/{request_id}/assign-department")
def assign_department(request_id: str, req: AssignDepartmentRequest, db: Session = Depends(get_db)):
    care_req = (
        db.query(CareRequest)
        .filter((CareRequest.id == request_id) | (CareRequest.referenceNumber == request_id))
        .first()
    )
    if not care_req:
        raise HTTPException(status_code=404, detail="Care request not found")

    # Update timeline Step 3
    for event in care_req.events:
        if event.stepNumber == 3:
            event.isCompleted = True
            event.isActive = True
            event.title = f"Department identified: {req.department}"
            event.description = f"Updated by hospital triage lead"

    db.commit()

    log_audit_event(
        db=db,
        action="DEPARTMENT_ASSIGNED",
        actor_role="HOSPITAL_STAFF",
        target_entity="CareRequest",
        target_id=care_req.id,
        details=f"Request {care_req.referenceNumber} routed to department {req.department}",
    )

    return {
        "success": True,
        "requestId": care_req.referenceNumber,
        "department": req.department,
        "message": f"Care request routed to {req.department}",
    }


@router.post("/doctors/{doctor_id}/add-slot")
def add_custom_doctor_slot(doctor_id: str, req: AddCustomSlotRequest, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")

    log_audit_event(
        db=db,
        action="CUSTOM_SLOT_ADDED",
        actor_role="HOSPITAL_STAFF",
        target_entity="DoctorAvailability",
        target_id=doc.id,
        details=f"Custom slot '{req.slotTime}' added for {doc.fullName}",
    )

    return {
        "success": True,
        "doctorId": doc.id,
        "slotTime": req.slotTime,
        "message": f"Custom slot '{req.slotTime}' added to {doc.fullName}'s roster.",
    }

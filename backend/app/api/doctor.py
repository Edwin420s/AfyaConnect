from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database.connection import get_db
from ..database.models import Doctor, CareRequest, Appointment, AppointmentStatusEnum, RequestStatusEnum
from ..audit.service import log_audit_event

router = APIRouter(prefix="/doctor", tags=["Doctor Operations"])


class DoctorNotesRequest(BaseModel):
    requestId: str
    notes: str


class MarkAttendedRequest(BaseModel):
    requestId: str


@router.get("/dashboard")
def get_doctor_dashboard(doctorId: Optional[str] = "doc-kamau-1", db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctorId).first()
    if not doc:
        doc = db.query(Doctor).first()

    requests = (
        db.query(CareRequest)
        .filter(
            (CareRequest.assignedDoctorId == doc.id)
            | (CareRequest.assignedDoctorName.ilike(f"%{doc.fullName.split()[-1]}%"))
        )
        .all()
    )

    return {
        "doctor": {
            "id": doc.id,
            "fullName": doc.fullName,
            "initials": doc.initials,
            "specialty": doc.specialty,
            "qualification": doc.qualification,
            "roomNumber": doc.roomNumber,
            "isOnDuty": doc.isOnDuty,
            "facilityName": doc.facility.name if doc.facility else "Aga Khan Univ. Hospital",
        },
        "todayPatientsCount": len(requests),
        "activeQueue": [
            {
                "id": r.referenceNumber,
                "patientName": r.patient.user.name if r.patient and r.patient.user else "Jane M.",
                "assignedSlot": r.assignedSlot or "10:30 AM",
                "tokenPass": r.tokenPass or "#AC-NBO-8492",
                "status": r.status,
                "chiefConcern": r.chiefConcern,
                "triageScore": r.triageScore,
                "insurance": r.patient.insuranceProvider if r.patient else "SHA Active",
            }
            for r in requests
        ],
    }


@router.get("/queue")
def get_doctor_queue(doctorId: Optional[str] = "doc-kamau-1", db: Session = Depends(get_db)):
    requests = db.query(CareRequest).filter(CareRequest.status == RequestStatusEnum.CONFIRMED).all()
    return [
        {
            "id": r.referenceNumber,
            "patientName": r.patient.user.name if r.patient and r.patient.user else "Jane M.",
            "patientPhone": r.patient.user.phone if r.patient and r.patient.user else "",
            "assignedSlot": r.assignedSlot or "10:30 AM",
            "tokenPass": r.tokenPass or "#AC-NBO-8492",
            "status": r.status,
            "chiefConcern": r.chiefConcern,
            "verbatimTranscript": r.verbatimTranscript,
            "triageScore": r.triageScore,
            "insurance": r.patient.insuranceProvider if r.patient else "SHA Active",
        }
        for r in requests
    ]


@router.get("/schedule")
def get_doctor_schedule(doctorId: Optional[str] = "doc-kamau-1", db: Session = Depends(get_db)):
    return {
        "doctorId": doctorId,
        "weeklyRoster": [
            {"day": "Jumatatu (Monday)", "hours": "09:00 AM – 01:00 PM", "status": "Active"},
            {"day": "Jumanne (Tuesday)", "hours": "09:00 AM – 05:00 PM", "status": "Today (Active)"},
            {"day": "Jumatano (Wednesday)", "hours": "02:00 PM – 06:00 PM", "status": "Scheduled"},
            {"day": "Alhamisi (Thursday)", "hours": "09:00 AM – 01:00 PM", "status": "Scheduled"},
            {"day": "Ijumaa (Friday)", "hours": "Off Duty / In-patient Ward Rounds", "status": "Ward Duty"},
        ],
    }


@router.post("/notes")
def save_doctor_notes(req: DoctorNotesRequest, db: Session = Depends(get_db)):
    care_req = (
        db.query(CareRequest)
        .filter((CareRequest.id == req.requestId) | (CareRequest.referenceNumber == req.requestId))
        .first()
    )
    if not care_req:
        raise HTTPException(status_code=404, detail="Care request not found")

    care_req.clinicalSummary += f" | Doctor Notes: {req.notes}"
    db.commit()

    log_audit_event(
        db=db,
        action="DOCTOR_NOTES_RECORDED",
        actor_role="DOCTOR",
        target_entity="CareRequest",
        target_id=care_req.id,
        details=f"Clinical notes saved for {care_req.referenceNumber}",
    )

    return {"success": True, "requestId": care_req.referenceNumber, "message": "Clinical notes saved successfully."}


@router.post("/mark-attended")
def mark_patient_attended(req: MarkAttendedRequest, db: Session = Depends(get_db)):
    care_req = (
        db.query(CareRequest)
        .filter((CareRequest.id == req.requestId) | (CareRequest.referenceNumber == req.requestId))
        .first()
    )
    if not care_req:
        raise HTTPException(status_code=404, detail="Care request not found")

    care_req.status = RequestStatusEnum.COMPLETED

    if care_req.appointment:
        care_req.appointment.status = AppointmentStatusEnum.COMPLETED

    db.commit()

    log_audit_event(
        db=db,
        action="PATIENT_ATTENDED",
        actor_role="DOCTOR",
        target_entity="CareRequest",
        target_id=care_req.id,
        details=f"Consultation completed for {care_req.referenceNumber}",
    )

    return {"success": True, "requestId": care_req.referenceNumber, "message": "Patient marked as completed/attended."}

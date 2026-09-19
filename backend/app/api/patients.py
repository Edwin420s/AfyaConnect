from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import Patient, Appointment, CareRequest, User
from ..auth.security import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/me")
def get_my_patient_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.userId == current_user.id).first()
    if not patient:
        patient = db.query(Patient).first()
    return {
        "id": patient.id,
        "name": patient.user.name if patient.user else current_user.name,
        "phone": patient.user.phone if patient.user else current_user.phone,
        "nationalId": patient.nationalId,
        "insuranceProvider": patient.insuranceProvider,
        "insuranceNumber": patient.insuranceNumber,
    }


@router.get("/{patient_id}/appointments")
def get_patient_appointments(patient_id: str, db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(Appointment.patientId == patient_id).all()
    return [
        {
            "id": a.id,
            "facilityId": a.facilityId,
            "facilityName": a.facility.name if a.facility else "",
            "doctorId": a.doctorId,
            "doctorName": a.doctor.fullName if a.doctor else "",
            "slotLabel": a.slotLabel,
            "status": a.status,
            "tokenPass": a.tokenPass,
            "notes": a.notes,
        }
        for a in appointments
    ]


@router.get("/{patient_id}/care-requests")
def get_patient_care_requests(patient_id: str, db: Session = Depends(get_db)):
    requests = db.query(CareRequest).filter(CareRequest.patientId == patient_id).all()
    return [
        {
            "id": r.id,
            "referenceNumber": r.referenceNumber,
            "chiefConcern": r.chiefConcern,
            "urgency": r.urgency,
            "status": r.status,
            "assignedFacilityName": r.facility.name if r.facility else "",
            "assignedDoctorName": r.assignedDoctorName,
            "assignedSlot": r.assignedSlot,
            "tokenPass": r.tokenPass,
        }
        for r in requests
    ]

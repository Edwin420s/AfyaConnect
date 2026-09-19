from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database.connection import get_db
from ..database.models import Doctor
from ..availability.service import get_facility_doctor_availability

router = APIRouter(prefix="/doctors", tags=["Doctors"])


class DutyStatusUpdate(BaseModel):
    isOnDuty: bool


@router.get("")
def list_doctors(facilityId: str = None, db: Session = Depends(get_db)):
    query = db.query(Doctor)
    if facilityId:
        query = query.filter(Doctor.facilityId == facilityId)
    doctors = query.all()
    return [
        {
            "id": d.id,
            "facilityId": d.facilityId,
            "name": d.fullName,
            "initials": d.initials,
            "specialty": d.specialty,
            "qualification": d.qualification,
            "roomNumber": d.roomNumber,
            "yearsExperience": d.yearsExperience,
            "isOnDuty": d.isOnDuty,
        }
        for d in doctors
    ]


@router.get("/{doctor_id}")
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    d = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {
        "id": d.id,
        "facilityId": d.facilityId,
        "name": d.fullName,
        "specialty": d.specialty,
        "qualification": d.qualification,
        "roomNumber": d.roomNumber,
        "isOnDuty": d.isOnDuty,
    }


@router.post("/{doctor_id}/duty-status")
def update_doctor_duty_status(doctor_id: str, req: DutyStatusUpdate, db: Session = Depends(get_db)):
    d = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    d.isOnDuty = req.isOnDuty
    db.commit()
    return {"doctorId": d.id, "isOnDuty": d.isOnDuty, "message": "Duty status updated successfully"}

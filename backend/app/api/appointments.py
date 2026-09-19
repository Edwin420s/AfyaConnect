import random
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from ..database.connection import get_db
from ..database.models import Appointment, CareRequest, CareRequestEvent, AppointmentStatusEnum, RequestStatusEnum
from ..notifications.service import dispatch_sms_notification
from ..audit.service import log_audit_event

router = APIRouter(prefix="/appointments", tags=["Appointments"])


class BookAppointmentRequest(BaseModel):
    careRequestId: Optional[str] = "#10482"
    patientPhone: str = Field(..., json_schema_extra={"example": "+254712345678"})
    facilityName: str = "Aga Khan Univ. Hospital"
    doctorName: str = "Dr. Wanjiku Kamau"
    slotTime: str = "Kesho 10:30 AM"
    facilityId: Optional[str] = "f-agakhan"


class RescheduleAppointmentRequest(BaseModel):
    newSlotTime: str
    reason: Optional[str] = "Patient requested time change"


class CancelAppointmentRequest(BaseModel):
    reason: Optional[str] = "Patient cancelled"


@router.get("")
def list_appointments(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Appointment)
    if status:
        query = query.filter(Appointment.status == status)
    appts = query.order_by(Appointment.startsAt.desc()).all()
    return [
        {
            "id": a.id,
            "careRequestId": a.careRequestId,
            "patientName": a.patient.user.name if a.patient and a.patient.user else "Jane M.",
            "patientPhone": a.patient.user.phone if a.patient and a.patient.user else "",
            "facilityName": a.facility.name if a.facility else "",
            "doctorName": a.doctor.fullName if a.doctor else "",
            "startsAt": a.startsAt.isoformat(),
            "slotLabel": a.slotLabel,
            "status": a.status,
            "tokenPass": a.tokenPass,
            "notes": a.notes,
        }
        for a in appts
    ]


@router.post("/book")
def book_appointment(req: BookAppointmentRequest, db: Session = Depends(get_db)):
    token = f"#AC-NBO-{random.randint(1000, 9999)}"
    time_now = datetime.datetime.now().strftime("%I:%M %p")

    # Find care request
    care_req = None
    if req.careRequestId:
        care_req = (
            db.query(CareRequest)
            .filter(
                (CareRequest.id == req.careRequestId)
                | (CareRequest.referenceNumber == req.careRequestId)
            )
            .first()
        )

    if not care_req:
        care_req = db.query(CareRequest).first()

    # Update care request
    if care_req:
        care_req.status = RequestStatusEnum.CONFIRMED
        care_req.assignedDoctorName = req.doctorName
        care_req.assignedSlot = req.slotTime
        care_req.tokenPass = token

        # Update 8-step timeline
        for event in care_req.events:
            if event.stepNumber <= 6:
                event.isCompleted = True
                event.isActive = False
            elif event.stepNumber == 7:
                event.isCompleted = True
                event.isActive = False
                event.timestampText = time_now
            elif event.stepNumber == 8:
                event.isCompleted = True
                event.isActive = True
                event.timestampText = time_now
                event.description = f"Booking confirmed • Token {token} issued"

    # Find existing or create new appointment
    existing_appt = None
    if care_req:
        existing_appt = (
            db.query(Appointment)
            .filter(Appointment.careRequestId == care_req.id)
            .first()
        )

    if existing_appt:
        existing_appt.slotLabel = req.slotTime
        existing_appt.status = AppointmentStatusEnum.CONFIRMED
        existing_appt.tokenPass = token
        existing_appt.notes = f"Confirmed consultation with {req.doctorName}"
        appt = existing_appt
    else:
        appt = Appointment(
            id=f"appt-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)}",
            careRequestId=care_req.id if care_req else None,
            patientId=care_req.patientId if care_req else "pat-jane-1",
            facilityId=req.facilityId or "f-agakhan",
            doctorId="doc-kamau-1",
            startsAt=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1),
            endsAt=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1, minutes=30),
            slotLabel=req.slotTime,
            status=AppointmentStatusEnum.CONFIRMED,
            tokenPass=token,
            notes=f"Confirmed consultation with {req.doctorName}",
        )
        db.add(appt)
    db.commit()

    # Dispatch SMS pass
    dispatch_sms_notification(
        db=db,
        patient_id=appt.patientId,
        phone=req.patientPhone,
        doctor_name=req.doctorName,
        facility_name=req.facilityName,
        slot_time=req.slotTime,
        token_pass=token,
    )

    # Log audit event
    log_audit_event(
        db=db,
        action="APPOINTMENT_CONFIRMED",
        details=f"Pass {token} issued to {req.patientPhone} for {req.doctorName} at {req.facilityName}",
        actor_role="PATIENT",
        target_entity="Appointment",
        target_id=appt.id,
    )

    return {
        "success": True,
        "tokenPass": token,
        "status": "CONFIRMED",
        "appointmentId": appt.id,
        "doctorName": req.doctorName,
        "facilityName": req.facilityName,
        "slotTime": req.slotTime,
        "message": f"Appointment successfully confirmed. Token: {token}. SMS dispatched.",
    }


@router.post("/{appointment_id}/reschedule")
def reschedule_appointment(appointment_id: str, req: RescheduleAppointmentRequest, db: Session = Depends(get_db)):
    appt = (
        db.query(Appointment)
        .filter((Appointment.id == appointment_id) | (Appointment.tokenPass == appointment_id))
        .first()
    )
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.slotLabel = req.newSlotTime
    appt.status = AppointmentStatusEnum.RESCHEDULED

    if appt.careRequest:
        appt.careRequest.assignedSlot = req.newSlotTime
        appt.careRequest.status = RequestStatusEnum.RESCHEDULING

    db.commit()

    log_audit_event(
        db=db,
        action="APPOINTMENT_RESCHEDULED",
        details=f"Appointment {appt.tokenPass} moved to {req.newSlotTime}. Reason: {req.reason}",
        target_entity="Appointment",
        target_id=appt.id,
    )

    return {
        "success": True,
        "tokenPass": appt.tokenPass,
        "newSlot": req.newSlotTime,
        "status": "RESCHEDULED",
        "message": f"Appointment rescheduled to {req.newSlotTime}",
    }


@router.post("/{appointment_id}/cancel")
def cancel_appointment(appointment_id: str, req: CancelAppointmentRequest, db: Session = Depends(get_db)):
    appt = (
        db.query(Appointment)
        .filter((Appointment.id == appointment_id) | (Appointment.tokenPass == appointment_id))
        .first()
    )
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = AppointmentStatusEnum.CANCELLED

    if appt.careRequest:
        appt.careRequest.status = RequestStatusEnum.CANCELLED

    db.commit()

    log_audit_event(
        db=db,
        action="APPOINTMENT_CANCELLED",
        details=f"Appointment {appt.tokenPass} cancelled. Slot released. Reason: {req.reason}",
        target_entity="Appointment",
        target_id=appt.id,
    )

    return {
        "success": True,
        "tokenPass": appt.tokenPass,
        "status": "CANCELLED",
        "message": "Appointment cancelled successfully. Hospital slot released.",
    }

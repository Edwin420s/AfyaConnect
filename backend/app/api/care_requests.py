import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from ..database.connection import get_db
from ..database.models import CareRequest, CareRequestEvent, RequestStatusEnum, UrgencyEnum

router = APIRouter(prefix="/care-requests", tags=["Care Requests"])


class CreateCareRequestInput(BaseModel):
    patientName: str = "Jane M."
    patientPhone: str = "+254712345678"
    patientLocation: str = "Westlands, Nairobi"
    verbatimTranscript: str
    chiefConcern: str
    urgency: Optional[str] = "Standard"
    triageScore: Optional[int] = 2
    facilityId: Optional[str] = "f-agakhan"
    preferredSlot: Optional[str] = "Kesho 10:30 AM"


@router.get("")
def list_care_requests(
    status: Optional[str] = None,
    department: Optional[str] = None,
    urgency: Optional[str] = None,
    facilityId: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(CareRequest)

    if status and status != "all":
        query = query.filter(CareRequest.status == status)
    if urgency and urgency != "all":
        query = query.filter(CareRequest.urgency == urgency)
    if facilityId:
        query = query.filter(CareRequest.facilityId == facilityId)

    requests = query.order_by(CareRequest.createdAt.desc()).all()

    results = []
    for r in requests:
        # Search filter
        if search:
            q = search.lower()
            match_name = r.patient.user.name.lower() if r.patient and r.patient.user else ""
            match_ref = r.referenceNumber.lower()
            match_concern = r.chiefConcern.lower()
            if q not in match_name and q not in match_ref and q not in match_concern:
                continue

        # Format timeline
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
            "patientLocation": "Westlands, Nairobi",
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
            "assignedFacilityName": r.facility.name if r.facility else "Aga Khan Univ. Hospital",
            "assignedDepartment": r.department.name if r.department else "General Consultation",
            "assignedDoctorName": r.assignedDoctorName or "Dr. Kamau",
            "assignedSlot": r.assignedSlot or "10:30 AM",
            "status": r.status,
            "tokenPass": r.tokenPass,
            "timeline": timeline,
            "createdAt": r.createdAt.isoformat() if r.createdAt else "",
            "updatedAt": r.updatedAt.isoformat() if r.updatedAt else "",
        })

    return results


@router.get("/{request_id}")
def get_care_request_detail(request_id: str, db: Session = Depends(get_db)):
    req = (
        db.query(CareRequest)
        .filter((CareRequest.id == request_id) | (CareRequest.referenceNumber == request_id))
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Care request not found")

    events = sorted(req.events, key=lambda e: e.stepNumber)
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

    return {
        "id": req.referenceNumber,
        "internalId": req.id,
        "patientName": req.patient.user.name if req.patient and req.patient.user else "Jane M.",
        "patientPhone": req.patient.user.phone if req.patient and req.patient.user else "+254712345678",
        "patientLocation": "Westlands, Nairobi",
        "languageMode": "SWA + ENG CODE-SWITCH",
        "verbatimTranscript": req.verbatimTranscript,
        "chiefConcern": req.chiefConcern,
        "symptomDuration": req.symptomDuration,
        "secondarySymptoms": json.loads(req.secondarySymptoms) if req.secondarySymptoms else [],
        "triageScore": req.triageScore,
        "urgency": req.urgency.title() if isinstance(req.urgency, str) else "Standard",
        "clinicalSummary": req.clinicalSummary,
        "flags": json.loads(req.flags) if req.flags else [],
        "insurance": req.patient.insuranceProvider if req.patient else "SHA Active",
        "preferredTime": req.preferredTime,
        "preferredDate": req.preferredDate or "Kesho",
        "assignedFacilityId": req.facilityId,
        "assignedFacilityName": req.facility.name if req.facility else "Aga Khan Univ. Hospital",
        "assignedDepartment": req.department.name if req.department else "General Consultation",
        "assignedDoctorName": req.assignedDoctorName or "Dr. Kamau",
        "assignedSlot": req.assignedSlot or "10:30 AM",
        "status": req.status,
        "tokenPass": req.tokenPass,
        "timeline": timeline,
    }


@router.get("/{request_id}/events")
def get_request_events(request_id: str, db: Session = Depends(get_db)):
    req = (
        db.query(CareRequest)
        .filter((CareRequest.id == request_id) | (CareRequest.referenceNumber == request_id))
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Care request not found")

    events = sorted(req.events, key=lambda e: e.stepNumber)
    return [
        {
            "step": e.stepNumber,
            "title": e.title,
            "description": e.description,
            "actor": e.actor,
            "timestamp": e.timestampText,
            "completed": e.isCompleted,
            "active": e.isActive,
        }
        for e in events
    ]

import os
import json
import random
import datetime
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from .prompts import AFYACONNECT_SYSTEM_PROMPT
from .tools import AFYACONNECT_CLAUDE_TOOLS
from .care_navigation import determine_care_pathway
from ..emergency.service import evaluate_clinical_safety
from ..location.service import find_nearby_facilities
from ..availability.service import get_facility_doctor_availability, validate_and_hold_slot
from ..notifications.service import dispatch_sms_notification
from ..database.models import CareRequest, CareRequestEvent, Appointment, RequestStatusEnum, UrgencyEnum, AppointmentStatusEnum


def orchestrate_patient_turn(
    db: Session,
    patient_message: str,
    is_audio: bool = False,
    language_preference: str = "swa_eng",
    patient_info: Optional[Dict[str, Any]] = None,
    history: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Core conversational orchestration layer.
    Connects patient conversation, tool calling, clinical safety evaluation,
    hospital queue generation, and bilingual feedback cards.
    """
    patient_info = patient_info or {"name": "Jane M.", "phone": "+254712345678", "location": "Westlands, Nairobi"}
    time_now = datetime.datetime.now().strftime("%I:%M %p")

    # 1. Emergency Safety Interception
    safety = evaluate_clinical_safety(patient_message)
    if safety["isEmergency"]:
        return {
            "text": safety["recommendedAction"],
            "responseMessage": safety["recommendedAction"],
            "isEmergency": True,
            "isEmergencyAlert": True,
            "triageScore": 5,
            "urgency": "EMERGENCY",
            "triageLevel": "Triage Level 5 (Emergency)",
            "dialectTag": "Dharura / Emergency Alert",
            "emergencyHotlines": safety.get("emergencyHotlines", []),
            "options": ["🚨 Piga 1199 (Red Cross)", "🏥 Tafuta Hospitali ya Dharura", "🚑 Piga 999 Ambulance"],
            "executedTools": [],
        }

    # 2. Care Pathway & Department
    pathway = determine_care_pathway(patient_message)

    # 3. Location & Nearby Facilities
    nearby = find_nearby_facilities(db, department=pathway["department"], radius_km=5.0)
    primary_facility = nearby[0] if nearby else {
        "id": "f-agakhan",
        "name": "Aga Khan Univ. Hospital",
        "subCounty": "Parklands Sub-County",
        "distanceKm": 1.4,
        "driveTime": "~6 min drive",
        "leadDoctor": "Dr. Wanjiku Kamau",
        "earliestSlot": "Leo 3:30 PM",
    }

    # 4. Availability Check
    avail = get_facility_doctor_availability(db, primary_facility["id"], pathway["departmentCode"])
    lead_doc = avail["availableDoctors"][0]["doctorName"] if avail["availableDoctors"] else primary_facility.get("leadDoctor", "Dr. Wanjiku Kamau")
    earliest_slot = avail["earliestAvailableSlot"]

    # 5. Create Structured Care Request in DB (Case #10482 style)
    req_id = f"req-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)}-{random.randint(100, 999)}"
    ref_num = f"#{random.randint(20000, 99999)}"

    care_request = CareRequest(
        id=req_id,
        referenceNumber=ref_num,
        patientId=patient_info.get("patientId", "pat-jane-1"),
        facilityId=primary_facility["id"],
        assignedDoctorName=lead_doc,
        assignedSlot=earliest_slot,
        verbatimTranscript=patient_message,
        chiefConcern=patient_message[:60] if len(patient_message) > 60 else patient_message,
        symptomDuration="2-3 days",
        secondarySymptoms=json.dumps([pathway["department"], "Postural trigger"]),
        triageScore=pathway["triageScore"],
        urgency=UrgencyEnum.URGENT if pathway["urgency"] == "URGENT" else UrgencyEnum.STANDARD,
        clinicalSummary=f"Intake: {patient_message}. Suggested: {pathway['department']}. Triage: {pathway['triageScore']}/5.",
        flags=json.dumps(["Live AI Intake", "Auto-Location Active", "SHA Member"]),
        preferredTime=earliest_slot,
        preferredDate="Kesho, Jumanne 24 Sept",
        status=RequestStatusEnum.RECEIVED,
    )
    db.add(care_request)
    db.flush()

    # Initial 8-step timeline events
    timeline_steps = [
        (1, "CALL / CHAT MADE", "Patient initiated triage conversation via app / audio", time_now, True, False),
        (2, "Request received", "Triage intake logged and pre-screened", time_now, True, False),
        (3, "Hospital received request", f"{primary_facility['name']} intake and triage queue synced", time_now, True, True),
        (4, "Department identified", pathway["department"], "Pending", False, False),
        (5, "Doctor availability checked", f"{lead_doc} calendar check", "Pending", False, False),
        (6, "Time proposed", f"Slot {earliest_slot} pending patient confirmation", "Pending", False, False),
        (7, "Patient confirmed", "Awaiting patient confirmation", "Pending", False, False),
        (8, "APPOINTMENT BOOKED", "Final booking token pending", "Pending", False, False),
    ]
    for step_num, title, desc, ts, comp, act in timeline_steps:
        db.add(CareRequestEvent(
            id=f"evt-{req_id}-{step_num}",
            careRequestId=care_request.id,
            stepNumber=step_num,
            title=title,
            description=desc,
            actor="Hospital Intake Gateway",
            timestampText=ts,
            isCompleted=comp,
            isActive=act,
        ))
    db.commit()

    # 6. Bilingual Response Generation
    lower = patient_message.lower()
    if language_preference == "swa":
        dialect_tag = "KISWAHILI PEKEE"
        ai_text = (
            f"Nimekuelewa vizuri. {pathway['explanationSwahili']} Nimepata vituo {len(nearby)} vilivyo karibu nawe "
            f"hapa {primary_facility.get('subCounty', 'Nairobi')} vyenye nafasi ya daktari {lead_doc} leo au kesho."
        )
    elif language_preference == "eng":
        dialect_tag = "ENGLISH"
        ai_text = (
            f"I understand what you are experiencing. {pathway['explanationEnglish']} I found {len(nearby)} healthcare "
            f"facilities near you with consultation slots available with {lead_doc}."
        )
    else:
        dialect_tag = "SWA + ENG CODE-SWITCH"
        if "kichwa" in lower or "headache" in lower or "dizzy" in lower:
            ai_text = (
                f"Pole sana. Nimekuelewa vizuri: maumivu ya kichwa na kizunguzungu yanaweza kuhitaji uchunguzi wa daktari. "
                f"Nimepata vituo {len(nearby)} vilivyo karibu. Daktari {lead_doc} katika {primary_facility['name']} "
                f"ana nafasi kesho saa {earliest_slot}."
            )
        elif "tumbo" in lower or "stomach" in lower or "fever" in lower:
            ai_text = (
                f"Pole sana kwa maumivu ya tumbo. Nimetambua kuwa una maumivu yanayoendelea. Kuna nafasi ya daktari "
                f"{lead_doc} katika {primary_facility['name']} saa {earliest_slot}."
            )
        elif "mtoto" in lower or "baby" in lower or "child" in lower:
            ai_text = (
                f"Pole sana. Mtoto anahitaji uangalizi wa idara ya watoto. Nimepata nafasi ya haraka katika "
                f"{primary_facility['name']} na {lead_doc} saa {earliest_slot}."
            )
        else:
            ai_text = (
                f"Nimekuelewa vizuri. Mfumo wa AfyaConnect umeunganishwa na vituo vya afya vilivyo karibu nawe. "
                f"Daktari {lead_doc} anaweza kukuona katika {primary_facility['name']} saa {earliest_slot}."
            )

    # 7. Feedback Card Data
    feedback_card = {
        "type": "doctor_availability",
        "department": pathway["department"],
        "doctorName": lead_doc,
        "date": "Kesho, Jumanne 24 Sept",
        "time": earliest_slot,
        "facilityName": primary_facility["name"],
        "requestId": ref_num,
    }

    # 8. Nearby Facilities Options Summary for Patient
    nearby_options = [
        {
            "name": f["name"],
            "distance": f"{f['distanceKm']} km",
            "distanceKm": f["distanceKm"],
            "driveTime": f["driveTime"],
            "earliestSlot": f["earliestSlot"],
            "leadDoctor": f["leadDoctor"],
            "facilityId": f["id"],
            "id": f["id"],
            "subCounty": f.get("subCounty", "Parklands Sub-County"),
        }
        for f in nearby[:3]
    ]

    return {
        "text": ai_text,
        "responseMessage": ai_text,
        "isEmergency": False,
        "isEmergencyAlert": False,
        "triageScore": pathway["triageScore"],
        "urgency": pathway["urgency"],
        "triageLevel": f"Triage Level {pathway['triageScore']}",
        "dialectTag": dialect_tag,
        "feedbackCard": feedback_card,
        "nearbyFacilities": nearby_options,
        "careRequestId": care_request.id,
        "referenceNumber": care_request.referenceNumber,
        "options": [
            f"Confirm Slot: {lead_doc} • {earliest_slot}",
            "📍 Ona Vituo / Other Options",
            "🩺 Nahitaji daktari leo",
        ],
        "createdCareRequest": {
            "id": care_request.id,
            "referenceNumber": care_request.referenceNumber,
            "chiefConcern": care_request.chiefConcern,
            "urgency": care_request.urgency,
            "status": care_request.status,
            "facilityId": care_request.facilityId,
            "assignedDoctorName": care_request.assignedDoctorName,
            "assignedSlot": care_request.assignedSlot,
        },
        "executedTools": [
            {"toolName": "find_nearby_facilities", "success": True, "count": len(nearby)},
            {"toolName": "check_doctor_availability", "success": True, "doctor": lead_doc, "slot": earliest_slot},
            {"toolName": "create_appointment_request", "success": True, "requestId": ref_num},
        ],
    }

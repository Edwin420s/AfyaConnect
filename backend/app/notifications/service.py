import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..database.models import Notification, NotificationChannelEnum, Patient


def dispatch_sms_notification(
    db: Session,
    patient_id: str,
    phone: str,
    doctor_name: str,
    facility_name: str,
    slot_time: str,
    token_pass: str,
) -> Dict[str, Any]:
    """
    Dispatches appointment confirmation SMS to Kenyan mobile numbers.
    Simulates Africa's Talking / Twilio SMS gateway.
    """
    message = (
        f"[AfyaConnect] Habari! Miadi yako imethibitishwa na {doctor_name} katika {facility_name} "
        f"kwa wakati wa {slot_time}. Token yako ya geti: {token_pass}. Fika dakika 15 mapema "
        f"ukiwa na kitambulisho chako cha SHA/National ID. Piga 1199 kwa dharura."
    )

    notif = Notification(
        id=f"notif-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
        patientId=patient_id,
        channel=NotificationChannelEnum.SMS,
        title="Uthibitisho wa Miadi (Appointment Confirmed)",
        message=message,
        isSent=True,
        sentAt=datetime.datetime.utcnow(),
    )
    db.add(notif)
    db.commit()

    return {
        "notificationId": notif.id,
        "recipientPhone": phone,
        "channel": "SMS",
        "message": message,
        "tokenPass": token_pass,
        "status": "DELIVERED",
        "dispatchedAt": datetime.datetime.utcnow().isoformat(),
    }


def dispatch_proposal_sms(
    db: Session,
    patient_id: str,
    phone: str,
    doctor_name: str,
    slot_time: str,
) -> Dict[str, Any]:
    """
    Dispatches time slot proposal to patient.
    """
    message = (
        f"[AfyaConnect] Daktari {doctor_name} anapatikana {slot_time}. "
        f"Bonyeza kiungo kwenye ujumbe kuthibitisha nafasi hii au piga *384# kuikubali bure."
    )

    notif = Notification(
        id=f"notif-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
        patientId=patient_id,
        channel=NotificationChannelEnum.SMS,
        title="Nafasi ya Daktari Inapatikana (Slot Available)",
        message=message,
        isSent=True,
        sentAt=datetime.datetime.utcnow(),
    )
    db.add(notif)
    db.commit()

    return {
        "notificationId": notif.id,
        "recipientPhone": phone,
        "channel": "SMS",
        "message": message,
        "status": "DELIVERED",
    }

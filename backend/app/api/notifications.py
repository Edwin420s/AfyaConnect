from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import Notification
from ..notifications.service import dispatch_sms_notification
from ..notifications.schemas import NotificationDispatchRequest, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(patientId: str = None, db: Session = Depends(get_db)):
    query = db.query(Notification)
    if patientId:
        query = query.filter(Notification.patientId == patientId)
    notifs = query.order_by(Notification.sentAt.desc()).limit(20).all()
    return [
        {
            "id": n.id,
            "patientId": n.patientId,
            "channel": n.channel,
            "title": n.title,
            "message": n.message,
            "isSent": n.isSent,
            "sentAt": n.sentAt.isoformat() if n.sentAt else None,
        }
        for n in notifs
    ]


@router.post("/dispatch")
def dispatch_notification(req: NotificationDispatchRequest, db: Session = Depends(get_db)):
    res = dispatch_sms_notification(
        db=db,
        patient_id=req.patientId,
        phone=req.phone,
        doctor_name=req.doctorName,
        facility_name=req.facilityName,
        slot_time=req.slotTime,
        token_pass=req.tokenPass,
    )
    return res

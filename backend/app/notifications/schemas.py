from typing import Optional
from pydantic import BaseModel, Field


class NotificationDispatchRequest(BaseModel):
    patientId: str
    phone: str = Field(..., json_schema_extra={"example": "+254712345678"})
    doctorName: str
    facilityName: str
    slotTime: str
    tokenPass: str
    channel: Optional[str] = "SMS"


class NotificationResponse(BaseModel):
    notificationId: str
    recipientPhone: str
    channel: str
    message: str
    tokenPass: Optional[str] = None
    status: str
    dispatchedAt: Optional[str] = None

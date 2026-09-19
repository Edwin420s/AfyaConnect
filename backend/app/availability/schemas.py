from typing import List, Optional
from pydantic import BaseModel, Field


class AvailabilityCheckRequest(BaseModel):
    facilityId: str = Field("f-agakhan", json_schema_extra={"example": "f-agakhan"})
    departmentCode: Optional[str] = Field("OPD", json_schema_extra={"example": "OPD"})
    preferredDay: Optional[str] = Field("today", json_schema_extra={"example": "tomorrow"})


class DoctorAvailabilitySummary(BaseModel):
    doctorId: str
    doctorName: str
    initials: str
    specialty: str
    roomNumber: str
    qualification: str
    freeSlotsCount: int
    freeSlots: List[str]
    bookedSlots: List[str]


class AvailabilityResponse(BaseModel):
    facilityId: str
    facilityName: str
    department: str
    availableDoctors: List[DoctorAvailabilitySummary]
    earliestAvailableSlot: str


class HoldSlotRequest(BaseModel):
    facilityId: str
    doctorName: str
    slotTime: str


class HoldSlotResponse(BaseModel):
    success: bool
    message: str
    doctorId: Optional[str] = None
    doctorName: Optional[str] = None
    slotTime: Optional[str] = None

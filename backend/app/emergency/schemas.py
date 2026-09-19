from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class EmergencyCheckRequest(BaseModel):
    patientMessage: str = Field(..., json_schema_extra={"example": "Niko na maumivu makali ya kifua"})


class EmergencyCheckResponse(BaseModel):
    isEmergency: bool
    triageScore: int
    urgency: str
    redFlagReason: Optional[str] = None
    recommendedAction: str
    emergencyHotlines: List[Dict[str, str]]

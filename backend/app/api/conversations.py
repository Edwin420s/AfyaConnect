from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from ..database.connection import get_db
from ..claude.client import orchestrate_patient_turn

router = APIRouter(prefix="/conversations", tags=["Conversations"])


class PatientInteractRequest(BaseModel):
    message: str = Field(..., json_schema_extra={"example": "Nimekuwa na maumivu ya tumbo for two days"})
    isAudioSnippet: Optional[bool] = False
    languagePreference: Optional[str] = "swa_eng"
    patientName: Optional[str] = "Jane M."
    patientPhone: Optional[str] = "+254712345678"
    patientLocation: Optional[str] = "Westlands, Nairobi"
    conversationHistory: Optional[List[Dict[str, Any]]] = None


@router.post("/interact")
def interact_with_frontdoor(req: PatientInteractRequest, db: Session = Depends(get_db)):
    """
    Main conversational frontdoor for patients (Voice or Chat).
    Understands English, Kiswahili, and Kenyan Sheng code-switching.
    Checks doctor availability and location, creates structured care requests,
    and returns feedback cards.
    """
    patient_info = {
        "name": req.patientName,
        "phone": req.patientPhone,
        "location": req.patientLocation,
    }

    result = orchestrate_patient_turn(
        db=db,
        patient_message=req.message,
        is_audio=req.isAudioSnippet,
        language_preference=req.languagePreference,
        patient_info=patient_info,
        history=req.conversationHistory,
    )
    return result

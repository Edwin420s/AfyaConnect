from typing import Optional
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    phone: str = Field(..., json_schema_extra={"example": "+254712345678"})
    name: str = Field(..., json_schema_extra={"example": "Jane M."})
    email: Optional[str] = None
    role: Optional[str] = "PATIENT"
    preferredLanguage: Optional[str] = "swa_eng"
    nationalId: Optional[str] = None
    insuranceProvider: Optional[str] = "SHA"
    insuranceNumber: Optional[str] = None


class LoginRequest(BaseModel):
    phone: str = Field(..., json_schema_extra={"example": "+254712345678"})
    pin: Optional[str] = "1234"


class TokenResponse(BaseModel):
    token: str
    tokenType: str = "Bearer"
    userId: str
    name: str
    role: str
    preferredLanguage: str


class UserResponse(BaseModel):
    id: str
    phone: str
    name: str
    role: str
    preferredLanguage: str
    email: Optional[str] = None

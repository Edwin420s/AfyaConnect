from typing import List, Optional
from pydantic import BaseModel, Field


class CoordinatesRequest(BaseModel):
    latitude: float = Field(..., json_schema_extra={"example": -1.2675})
    longitude: float = Field(..., json_schema_extra={"example": 36.8121})
    radiusKm: Optional[float] = Field(5.0, json_schema_extra={"example": 5.0})
    carePathway: Optional[str] = Field("All", json_schema_extra={"example": "General Consultation"})
    insuranceProvider: Optional[str] = None


class FacilitySummary(BaseModel):
    id: str
    name: str
    level: str
    accreditation: str
    address: str
    subCounty: str
    city: str
    distanceKm: float
    driveTime: str
    phone: str
    imageUrl: Optional[str] = None
    isEmergencyReady: bool
    isPublic: bool
    leadDoctor: str
    earliestSlot: str
    departments: List[str]
    acceptsInsurance: List[str]


class LocationResolutionResponse(BaseModel):
    areaName: str
    resolvedSubCounty: str
    city: str
    radiusKm: float
    facilities: List[FacilitySummary]

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from ..database.connection import get_db
from ..location.service import (
    find_nearby_facilities,
    resolve_patient_area,
    DEFAULT_NAIROBI_LAT,
    DEFAULT_NAIROBI_LON,
)
from ..location.schemas import CoordinatesRequest, LocationResolutionResponse, FacilitySummary

router = APIRouter(prefix="/location", tags=["Location"])


@router.post("/resolve", response_model=LocationResolutionResponse)
def resolve_location_and_facilities(req: CoordinatesRequest, db: Session = Depends(get_db)):
    area_name = resolve_patient_area(req.latitude, req.longitude)
    facilities_data = find_nearby_facilities(
        db=db,
        lat=req.latitude,
        lon=req.longitude,
        radius_km=req.radiusKm or 6.0,
        department=req.carePathway,
        insurance=req.insuranceProvider,
    )
    return LocationResolutionResponse(
        areaName=area_name,
        resolvedSubCounty="Westlands Sub-County",
        city="Nairobi",
        radiusKm=req.radiusKm or 6.0,
        facilities=[FacilitySummary(**f) for f in facilities_data],
    )


@router.post("/nearby-facilities")
def get_nearby_facilities(req: CoordinatesRequest, db: Session = Depends(get_db)):
    facilities_data = find_nearby_facilities(
        db=db,
        lat=req.latitude,
        lon=req.longitude,
        radius_km=req.radiusKm or 6.0,
        department=req.carePathway,
        insurance=req.insuranceProvider,
    )
    return {"total": len(facilities_data), "facilities": facilities_data}

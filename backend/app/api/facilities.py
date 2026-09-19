from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import Facility, Department, Doctor
from ..location.service import DEFAULT_NAIROBI_LAT, DEFAULT_NAIROBI_LON, calculate_haversine_distance, estimate_drive_time_minutes

router = APIRouter(prefix="/facilities", tags=["Facilities"])


@router.get("")
def list_facilities(
    department: Optional[str] = None,
    lat: float = DEFAULT_NAIROBI_LAT,
    lon: float = DEFAULT_NAIROBI_LON,
    db: Session = Depends(get_db),
):
    facilities = db.query(Facility).all()
    results = []

    for fac in facilities:
        dist = calculate_haversine_distance(lat, lon, fac.latitude, fac.longitude)
        doctors = [
            {
                "id": d.id,
                "name": d.fullName,
                "initials": d.initials,
                "specialty": d.specialty,
                "qualification": d.qualification,
                "room": d.roomNumber,
                "isOnDuty": d.isOnDuty,
            }
            for d in fac.doctors
        ]
        results.append({
            "id": fac.id,
            "name": fac.name,
            "level": fac.level,
            "accreditation": fac.accreditation,
            "address": fac.address,
            "subCounty": fac.subCounty,
            "city": fac.city,
            "distanceKm": dist,
            "driveTime": estimate_drive_time_minutes(dist),
            "phone": fac.phone,
            "imageUrl": fac.imageUrl,
            "isEmergencyReady": fac.isEmergencyReady,
            "isPublic": fac.isPublic,
            "acceptsInsurance": [x.strip() for x in fac.acceptsInsurance.split(",")],
            "departments": [d.name for d in fac.departments],
            "doctors": doctors,
        })

    results.sort(key=lambda x: x["distanceKm"])
    return results


@router.get("/{facility_id}")
def get_facility_details(facility_id: str, db: Session = Depends(get_db)):
    fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    return {
        "id": fac.id,
        "name": fac.name,
        "level": fac.level,
        "accreditation": fac.accreditation,
        "address": fac.address,
        "subCounty": fac.subCounty,
        "city": fac.city,
        "phone": fac.phone,
        "email": fac.email,
        "imageUrl": fac.imageUrl,
        "isEmergencyReady": fac.isEmergencyReady,
        "isPublic": fac.isPublic,
        "acceptsInsurance": [x.strip() for x in fac.acceptsInsurance.split(",")],
        "departments": [{"id": d.id, "name": d.name, "code": d.code} for d in fac.departments],
        "doctors": [
            {
                "id": d.id,
                "name": d.fullName,
                "specialty": d.specialty,
                "room": d.roomNumber,
                "isOnDuty": d.isOnDuty,
            }
            for d in fac.doctors
        ],
    }


@router.get("/{facility_id}/departments")
def get_facility_departments(facility_id: str, db: Session = Depends(get_db)):
    departments = db.query(Department).filter(Department.facilityId == facility_id).all()
    return [{"id": d.id, "name": d.name, "code": d.code} for d in departments]

import math
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..database.models import Facility, Department


DEFAULT_NAIROBI_LAT = -1.2675
DEFAULT_NAIROBI_LON = 36.8121


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Haversine distance in kilometers between two GPS coordinates."""
    r = 6371.0  # Earth's radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 1)


def estimate_drive_time_minutes(distance_km: float) -> str:
    """Estimates Nairobi metropolitan traffic drive time."""
    if distance_km <= 1.5:
        return "~6 min drive"
    elif distance_km <= 3.0:
        return f"~{int(distance_km * 4)} min drive"
    else:
        return f"~{int(distance_km * 3.5)} min drive"


def resolve_patient_area(lat: float, lon: float) -> str:
    """Resolves latitude/longitude to a human-readable Kenyan sub-county or neighborhood."""
    dist_westlands = calculate_haversine_distance(lat, lon, -1.2675, 36.8121)
    dist_parklands = calculate_haversine_distance(lat, lon, -1.2635, 36.8202)
    dist_cbd = calculate_haversine_distance(lat, lon, -1.286389, 36.817223)

    if dist_westlands <= 3.0 or dist_parklands <= 3.0:
        return "Westlands & Parklands, Nairobi"
    elif dist_cbd <= 4.0:
        return "Nairobi Central (CBD & Kilimani)"
    else:
        return "Nairobi Metropolitan Area"


def find_nearby_facilities(
    db: Session,
    lat: float = DEFAULT_NAIROBI_LAT,
    lon: float = DEFAULT_NAIROBI_LON,
    radius_km: float = 6.0,
    department: Optional[str] = None,
    insurance: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Finds nearby healthcare facilities within radius and computes distances.
    Strict privacy rule: Claude/AI receives the facility summary and distances,
    NOT the patient's exact GPS coordinates.
    """
    facilities = db.query(Facility).all()
    results = []

    for fac in facilities:
        dist = calculate_haversine_distance(lat, lon, fac.latitude, fac.longitude)
        if dist > radius_km:
            continue

        # Check insurance if requested
        if insurance and insurance.lower() not in fac.acceptsInsurance.lower():
            continue

        # Check department if requested
        if department and department != "All":
            has_dept = any(
                department.lower() in d.name.lower() or department.lower() in d.code.lower()
                for d in fac.departments
            )
            if not has_dept and "general" not in department.lower():
                continue

        # Get doctors & earliest slot
        on_duty_doctors = [d for d in fac.doctors if d.isOnDuty]
        lead_doctor = on_duty_doctors[0].fullName if on_duty_doctors else "Medical Officer on Duty"
        earliest_slot = "Leo 3:30 PM" if fac.id == "f-agakhan" else "Kesho 09:00 AM"

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
            "leadDoctor": lead_doctor,
            "earliestSlot": earliest_slot,
            "departments": [d.name for d in fac.departments],
            "acceptsInsurance": [x.strip() for x in fac.acceptsInsurance.split(",")],
        })

    # Sort by distance
    results.sort(key=lambda x: x["distanceKm"])
    return results

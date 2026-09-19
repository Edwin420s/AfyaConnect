from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import FacilityService

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("")
def list_facility_services(facilityId: str = None, db: Session = Depends(get_db)):
    query = db.query(FacilityService)
    if facilityId:
        query = query.filter(FacilityService.facilityId == facilityId)
    services = query.all()
    return [
        {
            "id": s.id,
            "facilityId": s.facilityId,
            "code": s.code,
            "name": s.name,
            "feeAmountKsh": s.feeAmountKsh,
            "isCoveredBySha": s.isCoveredBySha,
        }
        for s in services
    ]

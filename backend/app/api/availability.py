from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..availability.service import get_facility_doctor_availability, validate_and_hold_slot
from ..availability.schemas import AvailabilityCheckRequest, AvailabilityResponse, HoldSlotRequest, HoldSlotResponse

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.post("/check", response_model=AvailabilityResponse)
def check_availability(req: AvailabilityCheckRequest, db: Session = Depends(get_db)):
    result = get_facility_doctor_availability(
        db=db,
        facility_id=req.facilityId,
        department_code=req.departmentCode,
    )
    return AvailabilityResponse(**result)


@router.post("/hold-slot", response_model=HoldSlotResponse)
def hold_slot(req: HoldSlotRequest, db: Session = Depends(get_db)):
    res = validate_and_hold_slot(
        db=db,
        facility_id=req.facilityId,
        doctor_name=req.doctorName,
        slot_time=req.slotTime,
    )
    return HoldSlotResponse(**res)

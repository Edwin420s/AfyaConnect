from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import Department

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("")
def list_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    return [{"id": d.id, "facilityId": d.facilityId, "name": d.name, "code": d.code} for d in depts]


@router.get("/{department_id}")
def get_department(department_id: str, db: Session = Depends(get_db)):
    d = db.query(Department).filter(Department.id == department_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"id": d.id, "facilityId": d.facilityId, "name": d.name, "code": d.code, "description": d.description}

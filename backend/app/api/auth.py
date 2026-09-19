from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import User, Patient, RoleEnum
from ..auth.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from ..auth.security import create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == req.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    user_id = f"u-{req.phone.replace('+', '')[-9:]}"
    user = User(
        id=user_id,
        phone=req.phone,
        email=req.email,
        name=req.name,
        role=req.role or RoleEnum.PATIENT,
        preferredLanguage=req.preferredLanguage or "swa_eng",
    )
    db.add(user)
    db.flush()

    if user.role == RoleEnum.PATIENT:
        patient = Patient(
            id=f"pat-{user_id}",
            userId=user.id,
            nationalId=req.nationalId,
            insuranceProvider=req.insuranceProvider or "SHA",
            insuranceNumber=req.insuranceNumber,
        )
        db.add(patient)

    db.commit()
    db.refresh(user)

    token = create_token(user)
    return TokenResponse(
        token=token,
        userId=user.id,
        name=user.name,
        role=user.role,
        preferredLanguage=user.preferredLanguage,
    )


@router.post("/login", response_model=TokenResponse)
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        # Create on-the-fly for smooth demo experience
        user_id = f"u-{req.phone.replace('+', '')[-9:]}"
        user = User(
            id=user_id,
            phone=req.phone,
            name="Demo Patient",
            role=RoleEnum.PATIENT,
            preferredLanguage="swa_eng",
        )
        db.add(user)
        db.flush()
        patient = Patient(id=f"pat-{user_id}", userId=user.id)
        db.add(patient)
        db.commit()
        db.refresh(user)

    token = create_token(user)
    return TokenResponse(
        token=token,
        userId=user.id,
        name=user.name,
        role=user.role,
        preferredLanguage=user.preferredLanguage,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        phone=user.phone,
        name=user.name,
        role=user.role,
        preferredLanguage=user.preferredLanguage,
        email=user.email,
    )

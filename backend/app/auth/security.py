import datetime
import os
import hashlib
import hmac
from typing import Optional, List
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import User, RoleEnum

SECRET_KEY = os.getenv("SECRET_KEY", "afyaconnect-secret-key-nairobi-2026")
security_bearer = HTTPBearer(auto_error=False)


class UserSession(BaseModel):
    userId: str
    phone: str
    role: str
    name: str


def hash_secret(secret: str) -> str:
    return hashlib.sha256(secret.encode()).hexdigest()


def create_token(user: User) -> str:
    # Simple secure deterministic token for MVP session management
    token_payload = f"{user.id}:{user.role}:{user.phone}:{datetime.datetime.utcnow().timestamp()}"
    signature = hmac.new(SECRET_KEY.encode(), token_payload.encode(), hashlib.sha256).hexdigest()
    return f"{token_payload}:{signature}"


def verify_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(":")
        if len(parts) != 5:
            return None
        user_id, role, phone, ts, sig = parts
        expected_sig = hmac.new(SECRET_KEY.encode(), f"{user_id}:{role}:{phone}:{ts}".encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        return {"userId": user_id, "role": role, "phone": phone}
    except Exception:
        return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        # Default mock demo user for hackathon / seamless testing
        user = db.query(User).filter(User.role == RoleEnum.PATIENT).first()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization credentials required",
        )

    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == token_data["userId"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden for role {current_user.role}. Required: {allowed_roles}",
            )
        return current_user
    return role_checker

import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from ..database.models import AuditLog


def log_audit_event(
    db: Session,
    action: str,
    details: str,
    actor_id: Optional[str] = None,
    actor_role: Optional[str] = None,
    actor_name: Optional[str] = None,
    target_entity: Optional[str] = None,
    target_id: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Logs a compliance and clinical audit trail entry."""
    log = AuditLog(
        id=f"log-{int(datetime.datetime.utcnow().timestamp() * 1000)}",
        timestamp=datetime.datetime.utcnow(),
        action=action,
        actorId=actor_id,
        actorRole=actor_role,
        actorName=actor_name,
        targetEntity=target_entity,
        targetId=target_id,
        details=details,
        ipAddress=ip_address,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_recent_audit_logs(db: Session, limit: int = 50) -> List[AuditLog]:
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

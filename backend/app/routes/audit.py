from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models import AuditLog, User
from pydantic import BaseModel
from datetime import datetime
from app.deps import get_current_user, require_role
from app.models.user import UserRole

router = APIRouter(prefix="/audit", tags=["audit"])

class AuditLogOut(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    changed_by: int
    changed_by_name: Optional[str] = None
    old_value: Optional[dict]
    new_value: Optional[dict]
    reason: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogOut])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    changed_by: Optional[int] = Query(None)
):
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if changed_by:
        query = query.filter(AuditLog.changed_by == changed_by)
    
    logs = query.order_by(AuditLog.timestamp.desc()).all()
    
    # Manually populate changed_by_name for the schema
    for log in logs:
        log.changed_by_name = log.user.name if log.user else "System"
        
    return logs

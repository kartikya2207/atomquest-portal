from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog, AuditAction
from typing import Any, Optional

def log_audit(
    db: Session,
    entity_type: str,
    entity_id: int,
    action: AuditAction,
    changed_by: int,
    old_value: Optional[Any] = None,
    new_value: Optional[Any] = None,
    reason: Optional[str] = None
):
    audit_entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        changed_by=changed_by,
        old_value=old_value,
        new_value=new_value,
        reason=reason
    )
    db.add(audit_entry)
    db.flush() # Ensure it's part of the transaction but don't commit yet

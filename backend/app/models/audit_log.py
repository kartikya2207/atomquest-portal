from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class AuditAction(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    UNLOCK = "unlock"
    APPROVE = "approve"
    RETURN = "return"

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False) # "goal", "achievement", "user", "cycle"
    entity_id = Column(Integer, nullable=False)
    
    action = Column(Enum(AuditAction), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    reason = Column(String, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")

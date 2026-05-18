from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Numeric, Date, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UoMType(str, enum.Enum):
    NUMERIC_MIN = "numeric_min"
    NUMERIC_MAX = "numeric_max"
    PERCENT_MIN = "percent_min"
    PERCENT_MAX = "percent_max"
    TIMELINE = "timeline"
    ZERO = "zero"

class GoalStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    LOCKED = "locked"
    RETURNED = "returned"

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cycle_id = Column(Integer, ForeignKey("cycles.id"), nullable=False)
    thrust_area_id = Column(Integer, ForeignKey("thrust_areas.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    uom_type = Column(Enum(UoMType), nullable=False)
    target_value = Column(Numeric, nullable=True)
    target_date = Column(Date, nullable=True)
    weightage = Column(Integer, nullable=False)
    
    status = Column(Enum(GoalStatus), nullable=False, default=GoalStatus.DRAFT)
    
    is_shared = Column(Boolean, default=False)
    shared_parent_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    is_shared_primary = Column(Boolean, default=False)
    
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    returned_comment = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    employee = relationship("User", foreign_keys=[employee_id], back_populates="goals")
    approver = relationship("User", foreign_keys=[approved_by])
    cycle = relationship("Cycle")
    thrust_area = relationship("ThrustArea")
    achievements = relationship("Achievement", back_populates="goal")

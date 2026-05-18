from sqlalchemy import Column, Integer, Enum, ForeignKey, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.achievement import Quarter

class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    quarter = Column(Enum(Quarter), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    goal = relationship("Goal")
    manager = relationship("User")

    __table_args__ = (UniqueConstraint('goal_id', 'quarter', name='_checkin_goal_quarter_uc'),)

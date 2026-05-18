from sqlalchemy import Column, Integer, Enum, ForeignKey, DateTime, Numeric, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class Quarter(str, enum.Enum):
    Q1 = "q1"
    Q2 = "q2"
    Q3 = "q3"
    Q4 = "q4"

class AchievementStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    ON_TRACK = "on_track"
    COMPLETED = "completed"

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    quarter = Column(Enum(Quarter), nullable=False)
    
    actual_value = Column(Numeric, nullable=True)
    actual_date = Column(Date, nullable=True)
    status = Column(Enum(AchievementStatus), nullable=False, default=AchievementStatus.NOT_STARTED)
    score_percent = Column(Numeric, nullable=False, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    goal = relationship("Goal", back_populates="achievements")

    __table_args__ = (UniqueConstraint('goal_id', 'quarter', name='_goal_quarter_uc'),)

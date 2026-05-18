from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    
    goal_setting_open = Column(Date, nullable=False)
    goal_setting_close = Column(Date, nullable=False)
    
    q1_open = Column(Date, nullable=False)
    q1_close = Column(Date, nullable=False)
    
    q2_open = Column(Date, nullable=False)
    q2_close = Column(Date, nullable=False)
    
    q3_open = Column(Date, nullable=False)
    q3_close = Column(Date, nullable=False)
    
    q4_open = Column(Date, nullable=False)
    q4_close = Column(Date, nullable=False)
    
    is_active = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

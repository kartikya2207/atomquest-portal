from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from app.models.achievement import Quarter

class CheckinUpsert(BaseModel):
    comment: str

class CheckinOut(BaseModel):
    id: int
    goal_id: int
    quarter: Quarter
    manager_id: int
    comment: str
    actual_value: Optional[float] = None
    score_percent: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class GoalCheckinOut(BaseModel):
    goal_id: int
    title: str
    target_value: Optional[float] = None
    target_date: Optional[date] = None
    uom_type: str
    employee_id: int
    employee_name: str
    actual_value: Optional[float] = None
    score_percent: Optional[float] = None
    comment: Optional[str] = None
    
    class Config:
        from_attributes = True

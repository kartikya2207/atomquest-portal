from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.achievement import AchievementStatus, Quarter

class AchievementUpsert(BaseModel):
    actual_value: Optional[float] = None
    actual_date: Optional[date] = None
    status: AchievementStatus = AchievementStatus.COMPLETED

class AchievementOut(BaseModel):
    id: int
    goal_id: int
    quarter: Quarter
    actual_value: Optional[float]
    actual_date: Optional[date]
    status: AchievementStatus
    score_percent: float
    
    class Config:
        from_attributes = True

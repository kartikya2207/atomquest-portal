from pydantic import BaseModel
from datetime import datetime
from app.models.achievement import Quarter

class CheckinUpsert(BaseModel):
    comment: str

class CheckinOut(BaseModel):
    id: int
    goal_id: int
    quarter: Quarter
    manager_id: int
    comment: str
    created_at: datetime
    
    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import date

class GoalReturn(BaseModel):
    comment: str

class GoalManagerEdit(BaseModel):
    target_value: Optional[float] = None
    target_date: Optional[date] = None
    weightage: Optional[int] = None
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.models.goal import UoMType, GoalStatus

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    uom_type: UoMType
    target_value: Optional[float] = None
    target_date: Optional[date] = None
    weightage: int = Field(..., ge=10, le=100)
    thrust_area_id: int

class GoalCreate(GoalBase):
    cycle_id: int

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    uom_type: Optional[UoMType] = None
    target_value: Optional[float] = None
    target_date: Optional[date] = None
    weightage: Optional[int] = None
    thrust_area_id: Optional[int] = None
    status: Optional[GoalStatus] = None

class GoalOut(GoalBase):
    id: int
    employee_id: int
    cycle_id: int
    status: GoalStatus
    is_shared: bool
    shared_parent_id: Optional[int]
    is_shared_primary: bool
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    returned_comment: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GoalSubmission(BaseModel):
    goal_ids: List[int]

from pydantic import BaseModel
from typing import List, Optional
from app.models.goal import UoMType
from datetime import date

class SharedGoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    uom_type: UoMType
    target_value: Optional[float] = None
    target_date: Optional[date] = None
    thrust_area_id: int
    cycle_id: int
    recipient_user_ids: List[int]
    primary_owner_id: int
    weightage: int = 10 # Default weightage for all

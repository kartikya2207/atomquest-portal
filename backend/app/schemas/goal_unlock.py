from pydantic import BaseModel

class GoalUnlock(BaseModel):
    reason: str

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ThrustArea
from pydantic import BaseModel

class ThrustAreaOut(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool
    
    class Config:
        from_attributes = True

router = APIRouter(prefix="/thrust-areas", tags=["thrust-areas"])

@router.get("", response_model=List[ThrustAreaOut])
def get_thrust_areas(db: Session = Depends(get_db)):
    return db.query(ThrustArea).filter(ThrustArea.is_active == True).all()

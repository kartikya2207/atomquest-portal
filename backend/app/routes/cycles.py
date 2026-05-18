from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Cycle
from pydantic import BaseModel
from datetime import date
from app.deps import get_current_user, require_role
from app.models.user import UserRole

class CycleBase(BaseModel):
    name: str
    year: int
    goal_setting_open: date
    goal_setting_close: date
    q1_open: date
    q1_close: date
    q2_open: date
    q2_close: date
    q3_open: date
    q3_close: date
    q4_open: date
    q4_close: date
    is_active: bool = False

class CycleCreate(CycleBase):
    pass

class CycleOut(CycleBase):
    id: int
    
    class Config:
        from_attributes = True

router = APIRouter(prefix="/cycles", tags=["cycles"])

@router.get("", response_model=List[CycleOut])
def get_cycles(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Cycle).all()

@router.get("/active", response_model=CycleOut)
def get_active_cycle(db: Session = Depends(get_db)):
    cycle = db.query(Cycle).filter(Cycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="No active cycle found")
    return cycle

@router.post("", response_model=CycleOut)
def create_cycle(
    cycle_in: CycleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([UserRole.ADMIN]))
):
    # If is_active is True, deactivate others
    if cycle_in.is_active:
        db.query(Cycle).update({Cycle.is_active: False})
    
    new_cycle = Cycle(**cycle_in.dict())
    db.add(new_cycle)
    db.commit()
    db.refresh(new_cycle)
    return new_cycle

@router.patch("/{cycle_id}", response_model=CycleOut)
def update_cycle(
    cycle_id: int,
    cycle_in: CycleCreate, # Using same for simplicity
    db: Session = Depends(get_db),
    current_user = Depends(require_role([UserRole.ADMIN]))
):
    cycle = db.query(Cycle).filter(Cycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    
    if cycle_in.is_active and not cycle.is_active:
        db.query(Cycle).update({Cycle.is_active: False})
    
    for field, value in cycle_in.dict().items():
        setattr(cycle, field, value)
    
    db.commit()
    db.refresh(cycle)
    return cycle

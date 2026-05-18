from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Checkin, Goal, User, Quarter
from app.schemas.checkin import CheckinUpsert, CheckinOut
from app.deps import get_current_user

router = APIRouter(prefix="/checkins", tags=["checkins"])

@router.get("/team", response_model=List[CheckinOut])
def get_team_checkins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get direct reports
    team_ids = [u.id for u in db.query(User).filter(User.manager_id == current_user.id).all()]
    
    # Get goals of team
    goal_ids = [g.id for g in db.query(Goal).filter(Goal.employee_id.in_(team_ids)).all()]
    
    return db.query(Checkin).filter(Checkin.goal_id.in_(goal_ids)).all()

@router.put("/goal/{goal_id}/quarter/{q}", response_model=CheckinOut)
def upsert_checkin(
    goal_id: int,
    q: Quarter,
    checkin_in: CheckinUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Check if manager is owner's manager
    owner = db.query(User).filter(User.id == goal.employee_id).first()
    if owner.manager_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    checkin = db.query(Checkin).filter(
        Checkin.goal_id == goal_id,
        Checkin.quarter == q
    ).first()
    
    if not checkin:
        checkin = Checkin(
            goal_id=goal_id,
            quarter=q,
            manager_id=current_user.id,
            comment=checkin_in.comment
        )
        db.add(checkin)
    else:
        checkin.comment = checkin_in.comment
        checkin.manager_id = current_user.id
    
    db.commit()
    db.refresh(checkin)
    return checkin

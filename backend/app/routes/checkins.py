from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Checkin, Goal, User, Quarter, Achievement, Cycle, GoalStatus
from app.schemas.checkin import CheckinUpsert, CheckinOut, GoalCheckinOut
from app.deps import get_current_user

router = APIRouter(prefix="/checkins", tags=["checkins"])

@router.get("/team", response_model=List[GoalCheckinOut])
def get_team_checkins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get active cycle
    active_cycle = db.query(Cycle).filter(Cycle.is_active == True).first()
    if not active_cycle:
        return []
    
    # Current quarter for check-ins (q1 as requested)
    current_q = Quarter.Q1
    
    # Get direct reports
    team_ids = [u.id for u in db.query(User).filter(User.manager_id == current_user.id).all()]
    
    # Query goals with outer joins to achievements and checkins
    results = db.query(
        Goal,
        User.name.label("employee_name"),
        Achievement.actual_value,
        Achievement.score_percent,
        Checkin.comment
    ).join(User, Goal.employee_id == User.id)\
     .outerjoin(Achievement, (Goal.id == Achievement.goal_id) & (Achievement.quarter == current_q))\
     .outerjoin(Checkin, (Goal.id == Checkin.goal_id) & (Checkin.quarter == current_q))\
     .filter(
         Goal.employee_id.in_(team_ids),
         Goal.cycle_id == active_cycle.id,
         Goal.status.in_([GoalStatus.APPROVED, GoalStatus.LOCKED])
     ).all()
     
    return [
        GoalCheckinOut(
            goal_id=r.Goal.id,
            title=r.Goal.title,
            target_value=r.Goal.target_value,
            target_date=r.Goal.target_date,
            uom_type=r.Goal.uom_type.value,
            employee_id=r.Goal.employee_id,
            employee_name=r.employee_name,
            actual_value=r.actual_value,
            score_percent=r.score_percent,
            comment=r.comment
        ) for r in results
    ]

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

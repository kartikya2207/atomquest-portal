from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models import Achievement, Goal, Cycle, User, Quarter
from app.schemas.achievement import AchievementUpsert, AchievementOut
from app.deps import get_current_user
from app.services.score import compute_score
from app.services.window import get_current_quarter_window

router = APIRouter(prefix="/achievements", tags=["achievements"])

@router.get("/goal/{goal_id}", response_model=List[AchievementOut])
def get_achievements(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Achievement).filter(Achievement.goal_id == goal_id).all()

@router.put("/goal/{goal_id}/quarter/{q}", response_model=AchievementOut)
def upsert_achievement(
    goal_id: int,
    q: Quarter,
    achievement_in: AchievementUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    if goal.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Window enforcement
    cycle = db.query(Cycle).filter(Cycle.id == goal.cycle_id).first()
    today = date.today()
    current_q = get_current_quarter_window(cycle, today)
    
    if current_q != q:
        raise HTTPException(status_code=400, detail=f"Quarter {q} window is closed")

    # Compute score
    score = compute_score(
        uom_type=goal.uom_type,
        target=float(goal.target_value) if goal.target_value else 0,
        actual=achievement_in.actual_value,
        target_date=goal.target_date,
        actual_date=achievement_in.actual_date
    )
    
    achievement = db.query(Achievement).filter(
        Achievement.goal_id == goal_id,
        Achievement.quarter == q
    ).first()
    
    if not achievement:
        achievement = Achievement(
            goal_id=goal_id,
            quarter=q,
            **achievement_in.dict(),
            score_percent=score
        )
        db.add(achievement)
    else:
        for field, value in achievement_in.dict().items():
            setattr(achievement, field, value)
        achievement.score_percent = score
    
    db.commit()
    db.refresh(achievement)
    
    # Shared goals propagation
    if goal.is_shared and goal.is_shared_primary:
        # Find all sibling goals
        siblings = db.query(Goal).filter(
            Goal.shared_parent_id == goal.id,
            Goal.id != goal.id
        ).all()
        
        for sibling in siblings:
            sibling_achievement = db.query(Achievement).filter(
                Achievement.goal_id == sibling.id,
                Achievement.quarter == q
            ).first()
            
            if not sibling_achievement:
                sibling_achievement = Achievement(
                    goal_id=sibling.id,
                    quarter=q,
                    actual_value=achievement.actual_value,
                    actual_date=achievement.actual_date,
                    status=achievement.status,
                    score_percent=achievement.score_percent
                )
                db.add(sibling_achievement)
            else:
                sibling_achievement.actual_value = achievement.actual_value
                sibling_achievement.actual_date = achievement.actual_date
                sibling_achievement.status = achievement.status
                sibling_achievement.score_percent = achievement.score_percent
        
        db.commit()
    
    return achievement

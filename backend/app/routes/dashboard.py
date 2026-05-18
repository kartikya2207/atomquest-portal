from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Goal, GoalStatus, Cycle, Achievement
from app.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get active cycle
    active_cycle = db.query(Cycle).filter(Cycle.is_active == True).first()
    if not active_cycle:
        return {"error": "No active cycle"}

    # Sum weightage specifically for the current user and active cycle
    from sqlalchemy import func
    total_weightage = db.query(func.sum(Goal.weightage)).filter(
        Goal.employee_id == current_user.id,
        Goal.cycle_id == active_cycle.id
    ).scalar() or 0
    
    goal_count = db.query(Goal).filter(
        Goal.employee_id == current_user.id,
        Goal.cycle_id == active_cycle.id
    ).count()
    
    # Get goals for status summary
    goals = db.query(Goal).filter(
        Goal.employee_id == current_user.id,
        Goal.cycle_id == active_cycle.id
    ).all()
    
    # Status summary
    status_counts = {}
    for g in goals:
        status_counts[g.status] = status_counts.get(g.status, 0) + 1
        
    # Achievements for current quarter (demo q1)
    achievements = db.query(Achievement).filter(
        Achievement.goal_id.in_([g.id for g in goals]),
        Achievement.quarter == "q1"
    ).all()
    
    avg_score = sum(float(a.score_percent) for a in achievements) / len(achievements) if achievements else 0
    
    return {
        "total_weightage": total_weightage,
        "goal_count": goal_count,
        "status_counts": status_counts,
        "avg_score_q1": avg_score,
        "active_cycle_name": active_cycle.name
    }

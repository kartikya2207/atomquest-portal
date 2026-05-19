from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Goal, GoalStatus, Cycle, Achievement
from app.models.user import UserRole
from app.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    active_cycle = db.query(Cycle).filter(Cycle.is_active == True).first()
    active_cycle_name = active_cycle.name if active_cycle else None

    if current_user.role == UserRole.ADMIN:
        total_users = db.query(User).count()
        total_goals = db.query(Goal).filter(
            Goal.cycle_id == active_cycle.id
        ).count() if active_cycle else 0
        pending_approvals = db.query(Goal).filter(
            Goal.cycle_id == active_cycle.id,
            Goal.status == GoalStatus.SUBMITTED
        ).count() if active_cycle else 0
        achievements = db.query(Achievement).join(Goal).filter(
            Goal.cycle_id == active_cycle.id
        ).all() if active_cycle else []
        avg_org_score = (
            sum(float(a.score_percent) for a in achievements) / len(achievements)
            if achievements else 0
        )
        return {
            "role": "admin",
            "total_users": total_users,
            "total_goals": total_goals,
            "pending_approvals": pending_approvals,
            "avg_org_score": avg_org_score,
            "active_cycle_name": active_cycle_name,
        }

    if current_user.role == UserRole.MANAGER:
        team = db.query(User).filter(User.manager_id == current_user.id).all()
        team_ids = [u.id for u in team]
        pending_approvals = 0
        avg_team_score = 0.0
        if active_cycle and team_ids:
            pending_approvals = db.query(Goal).filter(
                Goal.employee_id.in_(team_ids),
                Goal.cycle_id == active_cycle.id,
                Goal.status == GoalStatus.SUBMITTED
            ).count()
            achievements = db.query(Achievement).join(Goal).filter(
                Goal.employee_id.in_(team_ids),
                Goal.cycle_id == active_cycle.id,
                Achievement.quarter == "q1"
            ).all()
            avg_team_score = (
                sum(float(a.score_percent) for a in achievements) / len(achievements)
                if achievements else 0.0
            )
        return {
            "role": "manager",
            "team_members": len(team),
            "pending_approvals": pending_approvals,
            "avg_team_score": avg_team_score,
            "active_cycle_name": active_cycle_name,
        }

    # Employee
    if not active_cycle:
        return {"error": "No active cycle"}

    total_weightage = db.query(func.sum(Goal.weightage)).filter(
        Goal.employee_id == current_user.id,
        Goal.cycle_id == active_cycle.id
    ).scalar() or 0

    goal_count = db.query(Goal).filter(
        Goal.employee_id == current_user.id,
        Goal.cycle_id == active_cycle.id
    ).count()

    goals = db.query(Goal).filter(
        Goal.employee_id == current_user.id,
        Goal.cycle_id == active_cycle.id
    ).all()

    status_counts = {}
    for g in goals:
        status_counts[g.status] = status_counts.get(g.status, 0) + 1

    achievements = db.query(Achievement).filter(
        Achievement.goal_id.in_([g.id for g in goals]),
        Achievement.quarter == "q1"
    ).all()

    avg_score = (
        sum(float(a.score_percent) for a in achievements) / len(achievements)
        if achievements else 0
    )

    return {
        "role": "employee",
        "total_weightage": total_weightage,
        "goal_count": goal_count,
        "status_counts": status_counts,
        "avg_score_q1": avg_score,
        "active_cycle_name": active_cycle_name,
    }

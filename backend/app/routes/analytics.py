from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Goal, GoalStatus, Cycle, ThrustArea, Achievement
from app.models.achievement import Quarter
from app.deps import get_current_user, require_role
from app.models.user import UserRole
from typing import Optional

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/org-health")
def get_org_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    # Get active cycle
    active_cycle = db.query(Cycle).filter(Cycle.is_active == True).first()
    if not active_cycle:
        return {"error": "No active cycle"}

    # Base user query
    user_query = db.query(User)
    goal_query = db.query(Goal).filter(Goal.cycle_id == active_cycle.id)
    
    if current_user.role == UserRole.MANAGER:
        # Scope to team + self
        team_ids = [u.id for u in db.query(User.id).filter(User.manager_id == current_user.id).all()]
        team_ids.append(current_user.id)
        user_query = user_query.filter(User.id.in_(team_ids))
        goal_query = goal_query.filter(Goal.employee_id.in_(team_ids))

    total_users = user_query.count()
    
    # Users who have at least one approved/locked goal
    users_with_goals = goal_query.filter(
        Goal.status.in_([GoalStatus.APPROVED, GoalStatus.LOCKED])
    ).with_entities(Goal.employee_id).distinct().count()
    
    completion_rate = (users_with_goals / total_users * 100) if total_users > 0 else 0
    
    # Avg headcount per dept
    dept_stats = user_query.with_entities(
        User.department,
        func.count(User.id).label("user_count")
    ).group_by(User.department).all()
    
    return {
        "completion_rate": completion_rate,
        "total_users": total_users,
        "users_with_goals": users_with_goals,
        "dept_stats": [{"dept": d, "count": c} for d, c in dept_stats]
    }

@router.get("/qoq")
def get_qoq_analytics(
    user_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    # Security check for managers
    if current_user.role == UserRole.MANAGER:
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
             raise HTTPException(status_code=404, detail="User not found")
        if target_user.manager_id != current_user.id and target_user.id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this user's analytics")

    # Get all achievements for this user's goals
    results = db.query(
        Achievement.quarter,
        func.avg(Achievement.score_percent).label("avg_score")
    ).join(Goal).filter(
        Goal.employee_id == user_id
    ).group_by(Achievement.quarter).all()

    # Ensure all quarters are represented
    scores = {q.value: 0.0 for q in Quarter}
    for q, avg in results:
        scores[q.value] = float(avg) if avg else 0.0

    return [{"quarter": q, "score": s} for q, s in scores.items()]

@router.get("/department")
def get_dept_performance(
    cycle_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    if not cycle_id:
        active = db.query(Cycle).filter(Cycle.is_active == True).first()
        cycle_id = active.id if active else None

    if not cycle_id:
        return []

    query = db.query(
        User.department,
        func.avg(Achievement.score_percent).label("avg_score")
    ).join(Goal, User.id == Goal.employee_id)\
     .join(Achievement, Goal.id == Achievement.goal_id)\
     .filter(Goal.cycle_id == cycle_id)
     
    if current_user.role == UserRole.MANAGER:
        team_ids = [u.id for u in db.query(User.id).filter(User.manager_id == current_user.id).all()]
        team_ids.append(current_user.id)
        query = query.filter(User.id.in_(team_ids))

    results = query.group_by(User.department).all()

    return [{"dept": dept, "score": float(score) if score else 0.0} for dept, score in results]

@router.get("/thrust-distribution")
def get_thrust_distribution(
    cycle_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    if not cycle_id:
        active = db.query(Cycle).filter(Cycle.is_active == True).first()
        cycle_id = active.id if active else None

    if not cycle_id:
        return []

    query = db.query(
        ThrustArea.name,
        func.count(Goal.id).label("count")
    ).join(Goal, ThrustArea.id == Goal.thrust_area_id)\
     .filter(Goal.cycle_id == cycle_id)
     
    if current_user.role == UserRole.MANAGER:
        team_ids = [u.id for u in db.query(User.id).filter(User.manager_id == current_user.id).all()]
        team_ids.append(current_user.id)
        query = query.filter(Goal.employee_id.in_(team_ids))

    results = query.group_by(ThrustArea.name).all()

    return [{"area": name, "count": count} for name, count in results]

@router.get("/completion-heatmap")
def get_completion_heatmap(
    cycle_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    if not cycle_id:
        active = db.query(Cycle).filter(Cycle.is_active == True).first()
        cycle_id = active.id if active else None

    if not cycle_id:
        return []

    # Get departments
    dept_query = db.query(User.department).distinct()
    if current_user.role == UserRole.MANAGER:
        team_ids = [u.id for u in db.query(User.id).filter(User.manager_id == current_user.id).all()]
        team_ids.append(current_user.id)
        dept_query = dept_query.filter(User.id.in_(team_ids))
        
    depts = [d[0] for d in dept_query.all()]
    quarters = [q.value for q in Quarter]
    
    heatmap = []
    for dept in depts:
        dept_data = {"dept": dept}
        for q_val in Quarter:
            q = q_val.value
            base_query = db.query(Goal).join(User).filter(
                User.department == dept,
                Goal.cycle_id == cycle_id
            )
            
            if current_user.role == UserRole.MANAGER:
                 # Even within department, manager only sees their team
                 team_ids = [u.id for u in db.query(User.id).filter(User.manager_id == current_user.id).all()]
                 team_ids.append(current_user.id)
                 base_query = base_query.filter(User.id.in_(team_ids))

            total_goals = base_query.count()
            
            completed_query = db.query(Achievement).join(Goal).join(User).filter(
                User.department == dept,
                Goal.cycle_id == cycle_id,
                Achievement.quarter == q_val,
                Achievement.actual_value != None
            )
            
            if current_user.role == UserRole.MANAGER:
                 completed_query = completed_query.filter(User.id.in_(team_ids))

            completed_goals = completed_query.count()
            
            rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
            dept_data[q] = round(rate, 1)
        heatmap.append(dept_data)
        
    return heatmap

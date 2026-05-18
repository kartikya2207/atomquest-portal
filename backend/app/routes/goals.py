from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Goal, GoalStatus, Cycle, User, UserRole
from app.schemas.goal import GoalCreate, GoalOut, GoalUpdate
from app.deps import get_current_user, require_role
from app.services.email import send_goal_notification

from app.schemas.shared_goal import SharedGoalCreate
from app.schemas.goal_approval import GoalReturn, GoalManagerEdit

router = APIRouter(prefix="/goals", tags=["goals"])

@router.get("/mine", response_model=List[GoalOut])
def get_my_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get active cycle
    active_cycle = db.query(Cycle).filter(Cycle.is_active == True).first()
    if not active_cycle:
        return []
    
    return db.query(Goal).filter(
        Goal.employee_id == current_user.id,
        Goal.cycle_id == active_cycle.id
    ).all()

@router.get("/team", response_model=List[GoalOut])
def get_team_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only manager and admin can see team goals
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get active cycle
    active_cycle = db.query(Cycle).filter(Cycle.is_active == True).first()
    if not active_cycle:
        return []

    if current_user.role == UserRole.ADMIN:
        return db.query(Goal).filter(Goal.cycle_id == active_cycle.id).all()
    
    # Get direct reports
    team_ids = [u.id for u in db.query(User).filter(User.manager_id == current_user.id).all()]
    
    return db.query(Goal).filter(
        Goal.employee_id.in_(team_ids),
        Goal.cycle_id == active_cycle.id
    ).all()

@router.post("", response_model=GoalOut)
def create_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if cycle exists and is active
    cycle = db.query(Cycle).filter(Cycle.id == goal_in.cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    
    new_goal = Goal(
        **goal_in.dict(),
        employee_id=current_user.id,
        status=GoalStatus.DRAFT
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.patch("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    if goal.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this goal")
    
    if goal.status not in [GoalStatus.DRAFT, GoalStatus.RETURNED]:
        raise HTTPException(status_code=400, detail="Goal can only be edited in draft or returned status")
    
    update_data = goal_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    if goal.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this goal")
    
    if goal.status != GoalStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only draft goals can be deleted")
    
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}

@router.post("/submit")
def submit_goals(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get active cycle
    active_cycle = db.query(Cycle).filter(Cycle.is_active == True).first()
    if not active_cycle:
        raise HTTPException(status_code=400, detail="No active cycle found")
    
    # Get all draft/returned goals for current user in active cycle
    goals = db.query(Goal).filter(
        Goal.employee_id == current_user.id,
        Goal.cycle_id == active_cycle.id,
        Goal.status.in_([GoalStatus.DRAFT, GoalStatus.RETURNED])
    ).all()
    
    if not goals:
        raise HTTPException(status_code=400, detail="No goals to submit")
    
    # Validation
    total_weightage = sum(g.weightage for g in goals)
    if total_weightage != 100:
        raise HTTPException(status_code=400, detail=f"Total weightage must be exactly 100 (current: {total_weightage})")
    
    if len(goals) > 8:
        raise HTTPException(status_code=400, detail="Maximum 8 goals allowed")
    
    for goal in goals:
        if goal.weightage < 10:
            raise HTTPException(status_code=400, detail=f"Minimum weightage per goal is 10 (goal '{goal.title}' has {goal.weightage})")
        
        if not goal.title or not goal.uom_type:
             raise HTTPException(status_code=400, detail=f"Goal '{goal.title}' is missing required fields")
             
        goal.status = GoalStatus.SUBMITTED
    
    db.commit()
    background_tasks.add_task(send_goal_notification, current_user, "submitted")
    return {"message": f"Successfully submitted {len(goals)} goals for approval"}

from app.utils.audit import log_audit
from app.models.audit_log import AuditAction
from sqlalchemy.sql import func

@router.post("/{goal_id}/approve")
def approve_goal(
    goal_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    owner = db.query(User).filter(User.id == goal.employee_id).first()
    if current_user.role != UserRole.ADMIN and owner.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this goal")
    
    if goal.status != GoalStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Goal must be in submitted status to approve")
    
    old_status = goal.status
    goal.status = GoalStatus.LOCKED
    goal.approved_by = current_user.id
    goal.approved_at = func.now()
    
    log_audit(
        db, "goal", goal.id, AuditAction.APPROVE, current_user.id,
        old_value={"status": old_status}, new_value={"status": GoalStatus.LOCKED}
    )
    
    db.commit()
    background_tasks.add_task(send_goal_notification, owner, "approved")
    return {"message": "Goal approved and locked"}

@router.post("/{goal_id}/return")
def return_goal(
    goal_id: int,
    return_in: GoalReturn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    owner = db.query(User).filter(User.id == goal.employee_id).first()
    if current_user.role != UserRole.ADMIN and owner.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to return this goal")
    
    if goal.status != GoalStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Goal must be in submitted status to return")
    
    goals = db.query(Goal).filter(
        Goal.employee_id == goal.employee_id,
        Goal.cycle_id == goal.cycle_id,
        Goal.status == GoalStatus.SUBMITTED
    ).all()
    
    for g in goals:
        old_status = g.status
        g.status = GoalStatus.RETURNED
        g.returned_comment = return_in.comment
        log_audit(
            db, "goal", g.id, AuditAction.RETURN, current_user.id,
            old_value={"status": old_status}, new_value={"status": GoalStatus.RETURNED},
            reason=return_in.comment
        )
    
    db.commit()
    background_tasks.add_task(send_goal_notification, owner, "returned", return_in.comment)
    return {"message": "Goals returned for rework"}

@router.patch("/{goal_id}/manager-edit")
def manager_edit_goal(
    goal_id: int,
    goal_in: GoalManagerEdit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    owner = db.query(User).filter(User.id == goal.employee_id).first()
    if current_user.role != UserRole.ADMIN and owner.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this goal")
    
    if goal.status != GoalStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Goal must be in submitted status for manager edit")
    
    update_data = goal_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    return goal

from app.schemas.goal_unlock import GoalUnlock

@router.post("/{goal_id}/unlock")
def unlock_goal(
    goal_id: int,
    unlock_in: GoalUnlock,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    old_status = goal.status
    goal.status = GoalStatus.DRAFT
    
    log_audit(
        db, "goal", goal.id, AuditAction.UNLOCK, current_user.id,
        old_value={"status": old_status}, new_value={"status": GoalStatus.DRAFT},
        reason=unlock_in.reason
    )
    
    db.commit()
    return {"message": "Goal unlocked and set to draft"}

@router.post("/shared")
def create_shared_goal(
    goal_in: SharedGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create shared goals")
    
    created_goals = []
    primary_goal = None
    
    for user_id in goal_in.recipient_user_ids:
        is_primary = (user_id == goal_in.primary_owner_id)
        
        new_goal = Goal(
            title=goal_in.title,
            description=goal_in.description,
            uom_type=goal_in.uom_type,
            target_value=goal_in.target_value,
            target_date=goal_in.target_date,
            weightage=goal_in.weightage,
            thrust_area_id=goal_in.thrust_area_id,
            cycle_id=goal_in.cycle_id,
            employee_id=user_id,
            is_shared=True,
            is_shared_primary=is_primary,
            status=GoalStatus.LOCKED
        )
        db.add(new_goal)
        db.flush()
        created_goals.append(new_goal)
        if is_primary:
            primary_goal = new_goal

    if primary_goal:
        for goal in created_goals:
            goal.shared_parent_id = primary_goal.id
    
    db.commit()
    return {"message": f"Successfully created {len(created_goals)} shared goals"}

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Goal, User, Cycle, Achievement, Checkin
from app.deps import get_current_user, require_role
from app.models.user import UserRole
import pandas as pd
import io

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/export")
def export_master_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    # Join goals with users and Q1 achievements
    query = db.query(
        Goal.id,
        User.name.label("employee_name"),
        User.department,
        Goal.title,
        Goal.uom_type,
        Goal.target_value,
        Goal.weightage,
        Goal.status,
        Achievement.score_percent.label("q1_score_percent")
    ).join(User, Goal.employee_id == User.id)\
     .outerjoin(Achievement, (Goal.id == Achievement.goal_id) & (Achievement.quarter == "q1"))
    
    df = pd.read_sql(query.statement, db.bind)
    
    # Format enums
    if 'status' in df.columns:
        df['status'] = df['status'].apply(lambda x: x.name if hasattr(x, 'name') else str(x).replace('GoalStatus.', '').upper())
    if 'uom_type' in df.columns:
        df['uom_type'] = df['uom_type'].apply(lambda x: x.name if hasattr(x, 'name') else str(x).replace('UoMType.', '').upper())
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Master Data')
    
    headers = {
        'Content-Disposition': 'attachment; filename="atomquest_master_data.xlsx"'
    }
    return Response(content=output.getvalue(), headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, UserRole
from app.schemas.user import UserOut
from app.deps import get_current_user, require_role
from app.services.excel import parse_user_upload
from app.auth.utils import get_password_hash
import uuid

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/bulk-upload")
async def bulk_upload_users(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    content = await file.read()
    try:
        data = parse_user_upload(content, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}")
    
    # First pass: Create users
    for row in data:
        email = row.get("email")
        if not email: continue
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Generate random password for new users
            temp_password = str(uuid.uuid4())[:8]
            user = User(
                email=email,
                name=row.get("name"),
                role=UserRole(row.get("role", "employee")),
                department=row.get("department"),
                designation=row.get("designation"),
                password_hash=get_password_hash("Atomberg@123") # Default for hackathon
            )
            db.add(user)
        else:
            # Update existing user
            user.name = row.get("name", user.name)
            user.role = UserRole(row.get("role", user.role))
            user.department = row.get("department", user.department)
            user.designation = row.get("designation", user.designation)
    
    db.commit()
    
    # Second pass: Link managers
    for row in data:
        email = row.get("email")
        manager_email = row.get("manager_email")
        if not email or not manager_email: continue
        
        user = db.query(User).filter(User.email == email).first()
        manager = db.query(User).filter(User.email == manager_email).first()
        
        if user and manager:
            user.manager_id = manager.id
            
    db.commit()
    return {"message": f"Processed {len(data)} users"}

@router.get("", response_model=List[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    return db.query(User).all()

@router.get("/team", response_model=List[UserOut])
def get_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(User).filter(User.manager_id == current_user.id).all()

@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

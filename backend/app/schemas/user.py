from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    department: str
    designation: str
    manager_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    manager_id: Optional[int] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class Login(BaseModel):
    email: EmailStr
    password: str

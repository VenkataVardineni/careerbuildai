from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: str
    career_role: str
    skills: str
    resume_content: Optional[str] = None
    resume_file_path: Optional[str] = None
    resume_file_name: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    career_role: Optional[str] = None
    skills: Optional[str] = None
    resume_content: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    resume_file_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class GuestProfileCreate(BaseModel):
    full_name: str
    career_role: str
    skills: str
    resume_content: Optional[str] = None
    resume_file_path: Optional[str] = None
    resume_file_name: Optional[str] = None 
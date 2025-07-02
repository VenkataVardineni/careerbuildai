from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import json
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse, GuestProfileCreate
from app.core.auth import get_current_active_user
from app.services.resume_parser import ResumeParser
import os
import uuid

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ProfileResponse)
async def create_profile(
    profile: ProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new profile for the current user"""
    db_profile = Profile(
        user_id=current_user.id,
        full_name=profile.full_name,
        career_role=profile.career_role,
        skills=profile.skills,
        resume_content=profile.resume_content,
        resume_file_path=profile.resume_file_path,
        resume_file_name=profile.resume_file_name
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.post("/guest", response_model=ProfileResponse)
async def create_guest_profile(
    profile: GuestProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a profile for guest users"""
    if current_user.is_guest != True:
        raise HTTPException(status_code=400, detail="This endpoint is for guest users only")
    
    db_profile = Profile(
        user_id=current_user.id,
        full_name=profile.full_name,
        career_role=profile.career_role,
        skills=profile.skills,
        resume_content=profile.resume_content,
        resume_file_path=profile.resume_file_path,
        resume_file_name=profile.resume_file_name
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and parse resume file (no authentication required for guest users)"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.doc']
    file_extension = file.filename.lower().split('.')[-1]
    if f'.{file_extension}' not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Parse resume content
        resume_parser = ResumeParser()
        resume_content = await resume_parser.parse_file(file)
        file.file.seek(0)  # Reset file pointer after reading
        # Save the file to disk
        file_location = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_location, "wb") as f:
            f.write(await file.read())
        return {
            "message": "Resume uploaded and parsed successfully",
            "resume_content": resume_content,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@router.get("/", response_model=List[ProfileResponse])
async def get_user_profiles(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all profiles for the current user"""
    profiles = db.query(Profile).filter(Profile.user_id == current_user.id).all()
    return profiles

@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(
    profile_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile

@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: int,
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a profile"""
    db_profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update fields
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.delete("/{profile_id}")
async def delete_profile(
    profile_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a profile"""
    db_profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    db.delete(db_profile)
    db.commit()
    return {"message": "Profile deleted successfully"} 
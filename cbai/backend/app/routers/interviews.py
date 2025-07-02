from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.interview import Interview, InterviewQuestion
from app.schemas.interview import (
    InterviewCreate, InterviewResponse, InterviewWithQuestions,
    QuestionGenerationRequest, QuestionGenerationResponse
)
from app.core.auth import get_current_active_user
from app.services.groq_service import GroqService

router = APIRouter(prefix="/api/v1/interviews", tags=["interviews"])

@router.post("/", response_model=InterviewResponse)
async def create_interview(
    interview: InterviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new interview session"""
    # Verify profile exists and belongs to user
    profile = db.query(Profile).filter(
        Profile.id == interview.profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Create interview
    db_interview = Interview(
        user_id=current_user.id,
        profile_id=interview.profile_id,
        job_role=interview.job_role,
        job_description=interview.job_description,
        interview_mode=interview.interview_mode,
        duration_minutes=interview.duration_minutes
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    return db_interview

@router.get("/", response_model=List[InterviewResponse])
async def get_user_interviews(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all interviews for the current user"""
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    return interviews

@router.get("/{interview_id}", response_model=InterviewWithQuestions)
async def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific interview with all questions"""
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return interview

@router.post("/{interview_id}/generate-question", response_model=QuestionGenerationResponse)
async def generate_question(
    interview_id: int,
    request: QuestionGenerationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a new question for the interview"""
    # Verify interview exists and belongs to user
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Get profile for resume content
    profile = db.query(Profile).filter(Profile.id == interview.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        # Generate question using Groq API
        groq_service = GroqService()
        
        if not request.conversation_history:
            # First question
            question_text = await groq_service.generate_question(
                resume_content=request.resume_content,
                job_role=request.job_role,
                job_description=request.job_description
            )
            question_type = "initial"
            # Build the same prompt as in GroqService for frontend logging
            system_prompt = f"""
            You are a world-class interviewer conducting a technical and behavioral interview.

            CANDIDATE BACKGROUND:
            - Resume Content: {request.resume_content}
            - Target Job Role: {request.job_role}
            {f'- Job Description: {request.job_description}' if request.job_description else ''}

            INTERVIEW CONTEXT:
            - Here is the full conversation history so far (questions and answers):
            {json.dumps(request.conversation_history, indent=1) if request.conversation_history else '[]'}
            - For every question, you must generate a follow-up that references specific details from the candidate's resume and/or their previous answers.
            - Do not ask generic questions. Every question should be tailored to the candidate's unique background and the flow of the interview so far.
            - If clarification is needed, ask for it in a way that builds on what the candidate has already said.
            - Only output the next interview question, nothing else.
            """
        else:
            # Follow-up question
            question_text = await groq_service.generate_follow_up_question(
                resume_content=request.resume_content,
                job_role=request.job_role,
                conversation_history=request.conversation_history,
                job_description=request.job_description
            )
            question_type = "follow_up"
            # Build the same prompt as in GroqService for frontend logging
            system_prompt = f"""
            You are a world-class interviewer conducting a technical and behavioral interview.

            CANDIDATE BACKGROUND:
            - Resume Content: {request.resume_content}
            - Target Job Role: {request.job_role}
            {f'- Job Description: {request.job_description}' if request.job_description else ''}

            INTERVIEW CONTEXT:
            - Here is the full conversation history so far (questions and answers):
            {json.dumps(request.conversation_history, indent=1) if request.conversation_history else '[]'}
            - For every question, you must generate a follow-up that references specific details from the candidate's resume and/or their previous answers.
            - Do not ask generic questions. Every question should be tailored to the candidate's unique background and the flow of the interview so far.
            - If clarification is needed, ask for it in a way that builds on what the candidate has already said.
            - Only output the next interview question, nothing else.
            """
        
        # Save question to database
        db_question = InterviewQuestion(
            interview_id=interview_id,
            question_text=question_text,
            question_type=question_type
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        return QuestionGenerationResponse(
            question=question_text,
            question_type=question_type,
            prompt=system_prompt
        )
        
    except Exception as e:
        print("Error generating question:", str(e))  # DEBUG: print the real error
        raise HTTPException(status_code=500, detail=f"Error generating question: {str(e)}")

@router.post("/{interview_id}/questions/{question_id}/respond")
async def respond_to_question(
    interview_id: int,
    question_id: int,
    response: str = Body(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Record user response to a question"""
    # Verify interview and question exist
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.id == question_id,
        InterviewQuestion.interview_id == interview_id
    ).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Update question with response
    question.user_response = response
    question.response_timestamp = datetime.utcnow()
    db.commit()
    
    return {"message": "Response recorded successfully"}

@router.post("/{interview_id}/complete")
async def complete_interview(
    interview_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark interview as completed"""
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    interview.is_completed = True
    interview.completed_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Interview completed successfully"}

@router.delete("/{interview_id}")
async def delete_interview(
    interview_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an interview"""
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    db.delete(interview)
    db.commit()
    
    return {"message": "Interview deleted successfully"}

@router.post("/{interview_id}/feedback")
async def generate_feedback(
    interview_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate feedback for each answer in the interview."""
    # Verify interview exists and belongs to user
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    # Get profile for resume content
    profile = db.query(Profile).filter(Profile.id == interview.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    # Get all questions and answers
    questions = db.query(InterviewQuestion).filter(InterviewQuestion.interview_id == interview_id).all()
    qa_pairs = [
        {"question": q.question_text, "answer": q.user_response or ""} for q in questions
    ]
    # Generate feedback using GroqService
    groq_service = GroqService()
    feedback, raw_response = await groq_service.evaluate_answers(
        qa_pairs,
        resume_content=str(profile.resume_content) if profile.resume_content is not None else None,
        job_role=str(interview.job_role) if interview.job_role is not None else None,
        job_description=str(interview.job_description) if interview.job_description is not None else None,
        return_raw_response=True
    )
    return {"feedback": feedback, "raw_response": raw_response} 
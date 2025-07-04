from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class InterviewBase(BaseModel):
    job_role: str
    job_description: Optional[str] = None
    interview_mode: str  # "real" or "guided"
    duration_minutes: int

class InterviewCreate(InterviewBase):
    profile_id: int

class InterviewResponse(InterviewBase):
    id: int
    user_id: int
    profile_id: Optional[int] = None
    is_completed: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class InterviewQuestionBase(BaseModel):
    question_text: str
    question_type: str  # "initial" or "follow_up"

class InterviewQuestionCreate(InterviewQuestionBase):
    interview_id: int

class InterviewQuestionResponse(InterviewQuestionBase):
    id: int
    interview_id: int
    user_response: Optional[str] = None
    response_timestamp: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class InterviewWithQuestions(InterviewResponse):
    questions: List[InterviewQuestionResponse] = []

class QuestionGenerationRequest(BaseModel):
    conversation_history: List[dict]
    resume_content: str
    job_role: str
    job_description: Optional[str] = None

class QuestionGenerationResponse(BaseModel):
    question: str
    question_type: str
    prompt: Optional[str] = None 
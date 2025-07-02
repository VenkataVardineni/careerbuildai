from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, auth, profiles, interviews
from app.database import engine, Base
from app.models import User, Profile, Interview, InterviewQuestion

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="CareerBuildAI API",
    description="AI-Powered Mock Interview Platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        # Add more ports if needed
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(interviews.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to CareerBuildAI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "CareerBuildAI API is running"} 
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database - Using SQLite for development
    database_url: str = "sqlite:///./cbai.db"
    direct_url: Optional[str] = None
    
    # JWT
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # App
    app_name: str = "CBAI API"
    debug: bool = True
    
    # External APIs
    groq_api_key: Optional[str] = None
    
    # Redis
    redis_url: Optional[str] = None
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields

settings = Settings()

# Use direct_url for database operations if available
def get_database_url():
    return settings.direct_url or settings.database_url 
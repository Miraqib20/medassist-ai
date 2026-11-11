import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "MediAssist AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    JWT_SECRET: str = "mediassist_super_secret_jwt_key_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    DATABASE_URL: str = "sqlite:///./mediassist.db"

    AI_PROVIDER: str = "local_fallback" # gemini, openai, anthropic, or local_fallback
    AI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gemini-1.5-flash"

    RAG_TOP_K: int = 3
    SIMILARITY_THRESHOLD: float = 0.2

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

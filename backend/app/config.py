from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://aquasense:aquasense123@localhost:5432/aquasense"
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DEVICE_OFFLINE_TIMEOUT_MINUTES: int = 15
    LEAK_THRESHOLD_PERCENT: float = 5.0
    HIGH_USAGE_THRESHOLD_PERCENT: float = 50.0
    VERY_HIGH_USAGE_THRESHOLD_PERCENT: float = 100.0
    GEMINI_API_KEY: str = ""
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()

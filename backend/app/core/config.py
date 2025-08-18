"""
Configuration settings for the Environmental Intelligence Platform
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Environmental Intelligence Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Database (SQLite for simplicity)
    DATABASE_URL: str = "sqlite:///./env_intel.db"

    # Cache settings (in-memory instead of Redis)
    ENABLE_CACHING: bool = True
    CACHE_TTL: int = 300  # 5 minutes
    
    # External APIs
    OPENWEATHER_API_KEY: Optional[str] = None
    WAQI_API_KEY: Optional[str] = None
    MAPBOX_ACCESS_TOKEN: Optional[str] = None

    # Source control / feature flags (allow forcing mock responses even if creds exist)
    FORCE_MOCK_WEATHER: bool = False
    FORCE_MOCK_AQI: bool = False
    FORCE_MOCK_SATELLITE: bool = False
    FORCE_MOCK_MODELS: bool = True  # Default to mock model predictions until real models integrated
    ALLOW_GEE_USER_AUTH: bool = False  # If False, require service account vars for GEE
    
    # Google Earth Engine
    GEE_SERVICE_ACCOUNT_KEY: Optional[str] = None
    GEE_PROJECT_ID: Optional[str] = None
    
    # Sentinel Hub
    SENTINEL_HUB_CLIENT_ID: Optional[str] = None
    SENTINEL_HUB_CLIENT_SECRET: Optional[str] = None
    
    # Planetary Computer
    PC_SUBSCRIPTION_KEY: Optional[str] = None
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # ML Models
    MODEL_DIR: str = "models"
    ENABLE_GPU: bool = False
    
    # Background tasks (in-memory instead of Celery)
    ENABLE_BACKGROUND_TASKS: bool = True
    BACKGROUND_TASK_INTERVAL: int = 60  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

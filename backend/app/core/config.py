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
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"
    WEATHER_CACHE_TTL: int = 600  # seconds
    ALLOW_GEE_USER_AUTH: bool = False  # If True, allow ee.Authenticate() user-prompt flow
    
    # Google Earth Engine
    # Prefer Application Default Credentials (ADC) via GOOGLE_APPLICATION_CREDENTIALS env var.
    # Optionally, provide a direct path to the service account key JSON via GEE_CREDENTIALS_FILE.
    # The older pair (GEE_SERVICE_ACCOUNT_EMAIL/GEE_SERVICE_ACCOUNT_KEY) remains for backward compatibility,
    # but is not required when ADC is configured.
    GEE_PROJECT_ID: Optional[str] = None
    GEE_CREDENTIALS_FILE: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    GEE_SERVICE_ACCOUNT_EMAIL: Optional[str] = None  # deprecated in favor of ADC
    GEE_SERVICE_ACCOUNT_KEY: Optional[str] = None    # deprecated in favor of ADC
    
    # Sentinel Hub
    SENTINEL_HUB_CLIENT_ID: Optional[str] = None
    SENTINEL_HUB_CLIENT_SECRET: Optional[str] = None
    
    # Planetary Computer
    PC_SUBSCRIPTION_KEY: Optional[str] = None
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # AI Narration (set OPENAI_API_KEY to enable live LLM responses)
    OPENAI_API_KEY: Optional[str] = None

    # ML Models — auto-trained from synthetic data on startup if .pkl absent
    MODEL_DIR: str = "models"
    ENABLE_GPU: bool = False
    STARTUP_TRAIN_MODELS: bool = True  # False to skip auto-training (use only if pkls exist)

    # NASA APIs (optional enrichment)
    FIRMS_API_KEY: Optional[str] = None         # https://firms.modaps.eosdis.nasa.gov/api/
    NASA_EARTHDATA_TOKEN: Optional[str] = None  # https://urs.earthdata.nasa.gov/
    
    # Background tasks (in-memory instead of Celery)
    ENABLE_BACKGROUND_TASKS: bool = True
    BACKGROUND_TASK_INTERVAL: int = 60  # seconds

    # Enhanced Air Quality (optional premium integrations)
    IQAIR_API_KEY: Optional[str] = None
    BREEZOMETER_API_KEY: Optional[str] = None
    AIRVIEW_DATA_PATH: str = "data/airview_hackathon_data.csv"
    # Disable paid/premium providers by default (keep code paths but don't use them)
    ENABLE_ARCGIS: bool = False
    ENABLE_AIRVIEW: bool = False
    ENABLE_PREMIUM_AQI: bool = False



    # Fusion priority order for AQI sources
    AQI_FUSION_PRIORITY: List[str] = [
        "baseline", "breezometer", "iqair", "waqi", "openweather"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

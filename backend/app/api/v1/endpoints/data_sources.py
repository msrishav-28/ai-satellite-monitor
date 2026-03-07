"""Endpoints exposing live vs unavailable status for external data sources."""

from fastapi import APIRouter
from app.core.config import settings
from app.services.satellite_data import SatelliteDataService

router = APIRouter()

_sat_service: SatelliteDataService | None = None

def _get_sat_service() -> SatelliteDataService:
    global _sat_service
    if _sat_service is None:
        _sat_service = SatelliteDataService()
    return _sat_service

@router.get("/health", summary="Data source health and connectivity status")
async def data_sources_health():
    sat_service = _get_sat_service()

    return {
        "weather": {
            "configured": bool(settings.OPENWEATHER_API_KEY),
            "live": bool(settings.OPENWEATHER_API_KEY),
        },
        "aqi": {
            "configured": bool(settings.WAQI_API_KEY),
            "live": bool(settings.WAQI_API_KEY),
        },
        "satellite": {
            "gee_available": sat_service.gee_initialized,
            "live": sat_service.gee_initialized,
            "allow_user_auth": settings.ALLOW_GEE_USER_AUTH,
        },
        "models": {
            "startup_train_enabled": settings.STARTUP_TRAIN_MODELS,
            "live": True,
        },
        "sentinel_hub": {
            "configured": bool(settings.SENTINEL_HUB_CLIENT_ID and settings.SENTINEL_HUB_CLIENT_SECRET),
            "implemented": False,
        },
        "planetary_computer": {
            "configured": bool(settings.PC_SUBSCRIPTION_KEY),
            "implemented": False,
        },
    }

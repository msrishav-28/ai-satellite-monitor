"""Endpoints exposing live vs unavailable status for external data sources."""

from fastapi import APIRouter

from app.core.config import settings
from app.core.runtime import build_provider_status, get_mock_flags

router = APIRouter()

@router.get("/health", summary="Data source health and connectivity status")
async def data_sources_health():
    return {
        "environment": settings.RUNTIME_ENV,
        "mock_flags": get_mock_flags(),
        "providers": build_provider_status(),
    }

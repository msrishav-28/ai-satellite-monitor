"""Runtime environment validation and provider status helpers."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from app.core.config import Settings, settings
from app.core.exceptions import ImproperlyConfigured

MOCK_FLAG_MAP = {
    "satellite": "FORCE_MOCK_SATELLITE",
    "ai": "FORCE_MOCK_AI",
    "weather": "FORCE_MOCK_WEATHER",
    "aqi": "FORCE_MOCK_AQI",
    "iqair": "FORCE_MOCK_IQAIR",
    "breezometer": "FORCE_MOCK_BREEZOMETER",
    "enhanced_aqi": "FORCE_MOCK_ENHANCED_AQI",
    "models": "FORCE_MOCK_MODELS",
}


def get_mock_flags(cfg: Settings = settings) -> Dict[str, bool]:
    """Return all configured mock flags keyed by domain."""
    return {
        name: bool(getattr(cfg, env_name))
        for name, env_name in MOCK_FLAG_MAP.items()
    }


def validate_runtime_environment(cfg: Settings = settings) -> None:
    """Enforce environment-tier rules before the app accepts traffic."""
    env = cfg.RUNTIME_ENV
    mock_flags = get_mock_flags(cfg)

    if env in {"staging", "production"}:
        enabled_mock = [MOCK_FLAG_MAP[name] for name, enabled in mock_flags.items() if enabled]
        if enabled_mock:
            raise ImproperlyConfigured(", ".join(enabled_mock))

        if not cfg.DATABASE_URL.startswith("postgresql"):
            raise ImproperlyConfigured("DATABASE_URL")
        if not cfg.REDIS_URL:
            raise ImproperlyConfigured("REDIS_URL")
        if not cfg.CELERY_BROKER_URL:
            raise ImproperlyConfigured("CELERY_BROKER_URL")
        if not cfg.CELERY_RESULT_BACKEND:
            raise ImproperlyConfigured("CELERY_RESULT_BACKEND")

    if env == "production":
        for required in ("OPENWEATHER_API_KEY", "WAQI_API_KEY", "GEE_PROJECT_ID", "GOOGLE_APPLICATION_CREDENTIALS"):
            if not getattr(cfg, required):
                raise ImproperlyConfigured(required)
        if not Path(str(cfg.GOOGLE_APPLICATION_CREDENTIALS)).exists():
            raise ImproperlyConfigured("GOOGLE_APPLICATION_CREDENTIALS")


def build_provider_status(cfg: Settings = settings) -> Dict[str, Dict[str, Any]]:
    """Expose provider configuration truth for the data-sources endpoint."""
    sentinel_configured = bool(cfg.SENTINEL_HUB_CLIENT_ID and cfg.SENTINEL_HUB_CLIENT_SECRET)
    gee_configured = bool(cfg.GEE_PROJECT_ID and cfg.GOOGLE_APPLICATION_CREDENTIALS)

    return {
        "google_earth_engine": {
            "purpose": "baseline satellite analysis",
            "status": "mocked" if cfg.FORCE_MOCK_SATELLITE else ("live" if gee_configured else "partial"),
            "configured": gee_configured,
            "auth_method": "application_default_credentials",
            "env_vars": ["GEE_PROJECT_ID", "GOOGLE_APPLICATION_CREDENTIALS"],
        },
        "openweather": {
            "purpose": "weather snapshots and forecasts",
            "status": "mocked" if cfg.FORCE_MOCK_WEATHER else ("live" if bool(cfg.OPENWEATHER_API_KEY) else "partial"),
            "configured": bool(cfg.OPENWEATHER_API_KEY),
            "auth_method": "query_param:appid",
            "env_vars": ["OPENWEATHER_API_KEY"],
        },
        "aqicn": {
            "purpose": "air quality index snapshots",
            "status": "mocked" if cfg.FORCE_MOCK_AQI else ("live" if bool(cfg.WAQI_API_KEY) else "partial"),
            "configured": bool(cfg.WAQI_API_KEY),
            "auth_method": "query_param:token",
            "env_vars": ["WAQI_API_KEY"],
        },
        "sentinel_hub": {
            "purpose": "imagery acceleration",
            "status": "partial" if sentinel_configured else "blocked_pending_docs",
            "configured": sentinel_configured,
            "auth_method": "oauth_client_credentials",
            "env_vars": ["SENTINEL_HUB_CLIENT_ID", "SENTINEL_HUB_CLIENT_SECRET"],
        },
        "iqair": {
            "purpose": "premium air quality fallback",
            "status": "blocked_pending_docs",
            "configured": bool(cfg.IQAIR_API_KEY),
            "auth_method": "blocked_pending_docs",
            "env_vars": ["IQAIR_API_KEY"],
        },
        "breezometer": {
            "purpose": "premium hyperlocal air quality fallback",
            "status": "blocked_pending_docs",
            "configured": bool(cfg.BREEZOMETER_API_KEY),
            "auth_method": "blocked_pending_docs",
            "env_vars": ["BREEZOMETER_API_KEY"],
        },
        "arcgis": {
            "purpose": "optional mapping and enrichment",
            "status": "blocked_pending_docs",
            "configured": False,
            "auth_method": "blocked_pending_docs",
            "env_vars": ["ARCGIS_API_KEY"],
        },
        "firms": {
            "purpose": "fire hotspots",
            "status": "blocked_pending_docs",
            "configured": bool(cfg.FIRMS_API_KEY),
            "auth_method": "blocked_pending_docs",
            "env_vars": ["FIRMS_API_KEY"],
        },
        "jrc_global_surface_water": {
            "purpose": "surface water analytics",
            "status": "blocked_pending_docs",
            "configured": False,
            "auth_method": "blocked_pending_docs",
            "env_vars": [],
        },
        "mapbox_backend": {
            "purpose": "backend map behavior",
            "status": "blocked_pending_docs",
            "configured": bool(cfg.MAPBOX_ACCESS_TOKEN),
            "auth_method": "blocked_pending_docs",
            "env_vars": ["MAPBOX_ACCESS_TOKEN"],
        },
        "bigquery": {
            "purpose": "future production ingestion",
            "status": "blocked_pending_docs",
            "configured": False,
            "auth_method": "blocked_pending_docs",
            "env_vars": [],
        },
    }

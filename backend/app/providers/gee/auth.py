"""Google Earth Engine authentication helpers."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from app.core.config import Settings, settings
from app.core.exceptions import ImproperlyConfigured


@dataclass(frozen=True)
class GEEAuthConfig:
    project_id: str
    credentials_path: str


def get_gee_auth_config(cfg: Settings = settings) -> GEEAuthConfig:
    """Validate the configured Earth Engine environment."""
    if not cfg.GEE_PROJECT_ID:
        raise ImproperlyConfigured("GEE_PROJECT_ID")
    credentials_path = cfg.GOOGLE_APPLICATION_CREDENTIALS or cfg.GEE_CREDENTIALS_FILE
    if not credentials_path:
        raise ImproperlyConfigured("GOOGLE_APPLICATION_CREDENTIALS")
    if not Path(credentials_path).exists():
        raise ImproperlyConfigured("GOOGLE_APPLICATION_CREDENTIALS")
    return GEEAuthConfig(project_id=cfg.GEE_PROJECT_ID, credentials_path=credentials_path)


def initialize_earth_engine(ee_module=None, cfg: Settings = settings) -> GEEAuthConfig:
    """Initialize Earth Engine with explicit project wiring."""
    auth = get_gee_auth_config(cfg)
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = auth.credentials_path
    if ee_module is None:
        import ee as ee_module  # pragma: no cover - depends on optional dependency
    ee_module.Initialize(project=auth.project_id)
    return auth

"""Sentinel Hub OAuth client-credentials helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional, Tuple

from app.core.config import Settings, settings
from app.core.exceptions import ImproperlyConfigured

SENTINEL_HUB_TOKEN_URL = "https://services.sentinel-hub.com/oauth/token"


@dataclass(frozen=True)
class SentinelHubAuthConfig:
    client_id: str
    client_secret: str
    token_url: str = SENTINEL_HUB_TOKEN_URL


def get_sentinel_hub_auth_config(cfg: Settings = settings) -> SentinelHubAuthConfig:
    if not cfg.SENTINEL_HUB_CLIENT_ID:
        raise ImproperlyConfigured("SENTINEL_HUB_CLIENT_ID")
    if not cfg.SENTINEL_HUB_CLIENT_SECRET:
        raise ImproperlyConfigured("SENTINEL_HUB_CLIENT_SECRET")
    return SentinelHubAuthConfig(
        client_id=cfg.SENTINEL_HUB_CLIENT_ID,
        client_secret=cfg.SENTINEL_HUB_CLIENT_SECRET,
    )


def build_token_request(cfg: Optional[Settings] = None) -> Tuple[str, Dict[str, str]]:
    auth = get_sentinel_hub_auth_config(cfg or settings)
    return auth.token_url, {
        "grant_type": "client_credentials",
        "client_id": auth.client_id,
        "client_secret": auth.client_secret,
    }

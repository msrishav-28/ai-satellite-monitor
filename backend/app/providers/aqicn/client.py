"""AQICN request builder helpers."""

from __future__ import annotations

from typing import Dict, Optional, Tuple


class AQICNClient:
    """Small helper for building AQICN requests with the correct token parameter."""

    def __init__(self, api_key: Optional[str], base_url: str = "https://api.waqi.info"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def build_geo_request(self, lat: float, lon: float) -> Tuple[str, Dict[str, str]]:
        return f"{self.base_url}/feed/geo:{lat};{lon}/", {"token": self.api_key or ""}

    def build_city_request(self, city_or_station: str) -> Tuple[str, Dict[str, str]]:
        return f"{self.base_url}/feed/{city_or_station}/", {"token": self.api_key or ""}

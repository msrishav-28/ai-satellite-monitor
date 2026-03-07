"""OpenWeather request builder and typed client helpers."""

from __future__ import annotations

from typing import Dict, Optional, Tuple


class OpenWeatherClient:
    """Small helper for building OpenWeather requests with the correct auth parameter."""

    def __init__(self, api_key: Optional[str], base_url: str = "https://api.openweathermap.org/data/2.5"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def build_request(self, endpoint: str, lat: float, lon: float, **extra_params: int) -> Tuple[str, Dict[str, float | str | int]]:
        params: Dict[str, float | str | int] = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key or "",
            "units": "metric",
        }
        params.update(extra_params)
        return f"{self.base_url}/{endpoint.lstrip('/')}", params

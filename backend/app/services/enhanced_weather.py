"""Enhanced weather service extending WeatherService to include OpenWeather Air Pollution API.
No mock fallbacks — raises ExternalAPIError if API key missing or API fails.
"""
from __future__ import annotations

import aiohttp
import logging
from typing import Dict, Any
from datetime import datetime

from app.core.config import settings
from app.core.exceptions import ExternalAPIError
from app.services.weather import WeatherService

logger = logging.getLogger(__name__)


class EnhancedWeatherService(WeatherService):
    async def get_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        if not self.enabled:
            raise ExternalAPIError("OpenWeatherMap", detail="OPENWEATHER_API_KEY not configured")
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/air_pollution"
                params = {"lat": lat, "lon": lon, "appid": self.api_key}
                async with session.get(url, params=params) as resp:
                    if resp.status == 200:
                        raw = await resp.json()
                        return self._format_air_quality_data(raw)
                    raise ExternalAPIError("OpenWeatherMap Air Pollution", resp.status, await resp.text())
        except ExternalAPIError:
            raise
        except Exception as e:
            raise ExternalAPIError("OpenWeatherMap Air Pollution", detail=str(e))

    def _format_air_quality_data(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        item = (raw.get("list") or [{}])[0]
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "aqi": (item.get("main") or {}).get("aqi"),
            "components": item.get("components", {}),
            "source": "openweathermap_air",
            "data_quality": "live",
        }

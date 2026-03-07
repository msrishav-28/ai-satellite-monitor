"""Premium air quality provider integrations (IQAir, BreezoMeter).
No mock fallbacks — raises ExternalAPIError if API key is missing or call fails.
"""
from __future__ import annotations

from typing import Any, Dict
import aiohttp
from app.core.config import settings
from app.core.exceptions import ExternalAPIError, ImproperlyConfigured


class IQAirService:
    """IQAir (AirVisual) integration for hyperlocal AQI."""

    base_url = "http://api.airvisual.com/v2"

    async def get_aqi_data(self, lat: float, lon: float) -> Dict[str, Any]:
        if not settings.IQAIR_API_KEY:
            raise ImproperlyConfigured("IQAIR_API_KEY")
        params = {"lat": lat, "lon": lon, "key": settings.IQAIR_API_KEY}
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/nearest_city", params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return self._format_iqair_data(data)
                raise ExternalAPIError("IQAir", resp.status, await resp.text())

    def _format_iqair_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            aqi_us = data["data"]["current"]["pollution"]["aqius"]
            return {
                "source": "iqair",
                "aqi": aqi_us,
                "pm25": data["data"]["current"]["pollution"].get("pm25"),
                "pm10": data["data"]["current"]["pollution"].get("pm10"),
            }
        except (KeyError, TypeError):
            return {"source": "iqair", "aqi": 0, "error": "unexpected response format"}


class BreezoMeterService:
    """BreezoMeter integration for street-level AQI."""

    base_url = "https://api.breezometer.com/air-quality/v2"

    async def get_aqi_data(self, lat: float, lon: float) -> Dict[str, Any]:
        if not settings.BREEZOMETER_API_KEY:
            raise ImproperlyConfigured("BREEZOMETER_API_KEY")
        params = {
            "lat": lat,
            "lon": lon,
            "key": settings.BREEZOMETER_API_KEY,
            "features": "breezometer_aqi,local_aqi,health_recommendations,sources_and_effects",
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/current-conditions", params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return self._format_breezometer_data(data)
                raise ExternalAPIError("BreezoMeter", resp.status, await resp.text())

    def _format_breezometer_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            aqi = data["data"]["indexes"]["baqi"]["aqi"]
            return {"source": "breezometer", "aqi": aqi}
        except (KeyError, TypeError):
            return {"source": "breezometer", "aqi": 0, "error": "unexpected response format"}

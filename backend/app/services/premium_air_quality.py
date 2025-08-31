"""Premium air quality provider integrations (IQAir, BreezoMeter).

These are optional and can operate in mock mode via config flags.
"""
from __future__ import annotations

from typing import Any, Dict, Optional
import asyncio
import aiohttp
from app.core.config import settings


class IQAirService:
    """IQAir (AirVisual) integration for hyperlocal AQI.
    Falls back to mock if FORCE_MOCK_IQAIR or missing API key.
    """

    base_url = "http://api.airvisual.com/v2"

    async def get_aqi_data(self, lat: float, lon: float) -> Dict[str, Any]:
        if settings.FORCE_MOCK_IQAIR or not settings.IQAIR_API_KEY:
            return self._mock_iqair_data(lat, lon)
        params = {"lat": lat, "lon": lon, "key": settings.IQAIR_API_KEY}
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/nearest_city", params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return self._format_iqair_data(data)
                return self._mock_iqair_data(lat, lon)

    def _format_iqair_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            aqi_us = data["data"]["current"]["pollution"]["aqius"]
            return {
                "source": "iqair",
                "aqi": aqi_us,
                "pm25": data["data"]["current"]["pollution"].get("pm25"),
                "pm10": data["data"]["current"]["pollution"].get("pm10"),
            }
        except Exception:
            return {"source": "iqair", "aqi": 0}

    def _mock_iqair_data(self, lat: float, lon: float) -> Dict[str, Any]:
        # Simple mock around plausible AQI scale
        return {"source": "iqair", "aqi": int(50 + (abs(lat) + abs(lon)) % 100)}


class BreezoMeterService:
    """BreezoMeter integration for street-level AQI.
    Falls back to mock if FORCE_MOCK_BREEZOMETER or missing API key.
    """

    base_url = "https://api.breezometer.com/air-quality/v2"

    async def get_aqi_data(self, lat: float, lon: float) -> Dict[str, Any]:
        if settings.FORCE_MOCK_BREEZOMETER or not settings.BREEZOMETER_API_KEY:
            return self._mock_breezometer_data(lat, lon)
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
                return self._mock_breezometer_data(lat, lon)

    def _format_breezometer_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            aqi = data["data"]["indexes"]["baqi"]["aqi"]
            return {"source": "breezometer", "aqi": aqi}
        except Exception:
            return {"source": "breezometer", "aqi": 0}

    def _mock_breezometer_data(self, lat: float, lon: float) -> Dict[str, Any]:
        return {"source": "breezometer", "aqi": int(40 + (abs(lat*2) + abs(lon)) % 110)}

"""Enhanced weather service extending WeatherService to include OpenWeather Air Pollution API."""
from __future__ import annotations

import aiohttp
import logging
from typing import Dict, Any
from datetime import datetime

from app.core.config import settings
from app.services.weather import WeatherService

logger = logging.getLogger(__name__)


class EnhancedWeatherService(WeatherService):
    async def get_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        if not self.enabled:
            return self._mock_air_quality_data(lat, lon)
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/air_pollution"
                params = {"lat": lat, "lon": lon, "appid": self.api_key}
                async with session.get(url, params=params) as resp:
                    if resp.status == 200:
                        raw = await resp.json()
                        return self._format_air_quality_data(raw)
                    logger.warning(f"OpenWeather Air Quality failed: HTTP {resp.status}")
                    return self._mock_air_quality_data(lat, lon)
        except Exception as e:
            logger.error(f"OpenWeather Air Quality error: {e}")
            return self._mock_air_quality_data(lat, lon)

    def _format_air_quality_data(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        item = (raw.get("list") or [{}])[0]
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "aqi": (item.get("main") or {}).get("aqi"),
            "components": item.get("components", {}),
            "source": "openweathermap_air",
            "data_quality": "live",
        }

    def _mock_air_quality_data(self, lat: float, lon: float) -> Dict[str, Any]:
        base = int((abs(lat) + abs(lon)) % 5) + 1  # 1-5 scale
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "aqi": base,
            "components": {"pm25": 12.3, "pm10": 20.5, "o3": 30.1},
            "source": "mock",
            "data_quality": "simulated",
        }

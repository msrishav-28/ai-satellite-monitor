"""OpenWeatherMap-backed weather service with mock-first design and caching."""
from __future__ import annotations

import aiohttp
import logging
from typing import Dict, Any
from datetime import datetime

from app.core.config import settings
from app.core.cache import cache

logger = logging.getLogger(__name__)


class WeatherService:
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = settings.OPENWEATHER_BASE_URL
        self.enabled = not settings.FORCE_MOCK_WEATHER and bool(self.api_key)
        self.cache_ttl = settings.WEATHER_CACHE_TTL

    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        if not self.enabled:
            return self._mock_weather_data(lat, lon)

        cache_key = f"weather:current:{lat:.4f}:{lon:.4f}"
        cached = await cache.get(cache_key)
        if cached:
            return cached

        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/weather"
                params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"}
                async with session.get(url, params=params) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        processed = self._format_weather_data(data)
                        await cache.set(cache_key, processed, ttl=self.cache_ttl)
                        return processed
                    logger.warning(f"OpenWeather weather failed: HTTP {resp.status}")
                    return self._mock_weather_data(lat, lon)
        except Exception as e:
            logger.error(f"OpenWeather API error: {e}")
            return self._mock_weather_data(lat, lon)

    async def get_weather_forecast(self, lat: float, lon: float, days: int = 5) -> Dict[str, Any]:
        if not self.enabled:
            return self._mock_forecast_data(lat, lon, days)
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/forecast"
                params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric", "cnt": days * 8}
                async with session.get(url, params=params) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return self._format_forecast_data(data)
                    logger.warning(f"OpenWeather forecast failed: HTTP {resp.status}")
                    return self._mock_forecast_data(lat, lon, days)
        except Exception as e:
            logger.error(f"OpenWeather forecast error: {e}")
            return self._mock_forecast_data(lat, lon, days)

    def _format_weather_data(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location": {
                "lat": raw.get("coord", {}).get("lat"),
                "lon": raw.get("coord", {}).get("lon"),
                "city": raw.get("name", "Unknown"),
                "country": raw.get("sys", {}).get("country"),
            },
            "current": {
                "temperature": raw.get("main", {}).get("temp"),
                "feels_like": raw.get("main", {}).get("feels_like"),
                "humidity": raw.get("main", {}).get("humidity"),
                "pressure": raw.get("main", {}).get("pressure"),
                "wind_speed": raw.get("wind", {}).get("speed", 0),
                "wind_direction": raw.get("wind", {}).get("deg", 0),
                "visibility": raw.get("visibility", 0),
                "description": (raw.get("weather") or [{}])[0].get("description"),
                "icon": (raw.get("weather") or [{}])[0].get("icon"),
            },
            "source": "openweathermap",
            "data_quality": "live",
        }

    def _format_forecast_data(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        items = raw.get("list", [])
        out = []
        for it in items:
            out.append({
                "timestamp": it.get("dt"),
                "temperature": it.get("main", {}).get("temp"),
                "humidity": it.get("main", {}).get("humidity"),
                "wind_speed": it.get("wind", {}).get("speed"),
                "description": (it.get("weather") or [{}])[0].get("description"),
            })
        return {"forecast": out, "source": "openweathermap"}

    def _mock_weather_data(self, lat: float, lon: float) -> Dict[str, Any]:
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location": {"lat": lat, "lon": lon, "city": "Mock City"},
            "current": {
                "temperature": 22.5,
                "feels_like": 24.0,
                "humidity": 65,
                "pressure": 1013,
                "wind_speed": 3.2,
                "wind_direction": 180,
                "visibility": 10000,
                "description": "partly cloudy",
                "icon": "02d",
            },
            "source": "mock",
            "data_quality": "simulated",
        }

    def _mock_forecast_data(self, lat: float, lon: float, days: int) -> Dict[str, Any]:
        out = []
        for i in range(days * 8):
            out.append({
                "timestamp": i * 10800,  # 3-hour steps
                "temperature": 20 + (i % 5),
                "humidity": 60 + (i % 10),
                "wind_speed": 2 + (i % 3),
                "description": "partly cloudy",
            })
        return {"forecast": out, "source": "mock"}

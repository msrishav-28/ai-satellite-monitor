"""OpenWeatherMap-backed weather service — no mock fallbacks.
Raises ExternalAPIError if API key is missing or API calls fail.
"""
from __future__ import annotations

import aiohttp
import logging
from typing import Dict, Any
from datetime import datetime

from app.core.config import settings
from app.core.cache import cache
from app.core.exceptions import ExternalAPIError, ImproperlyConfigured
from app.providers.openweather.client import OpenWeatherClient

logger = logging.getLogger(__name__)


class WeatherService:
    def __init__(self):
        self.client = OpenWeatherClient(
            api_key=settings.OPENWEATHER_API_KEY,
            base_url=settings.OPENWEATHER_BASE_URL,
        )
        self.api_key = self.client.api_key
        self.base_url = self.client.base_url
        self.enabled = self.client.enabled
        self.cache_ttl = settings.WEATHER_CACHE_TTL

    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        if not self.enabled:
            raise ImproperlyConfigured("OPENWEATHER_API_KEY")

        cache_key = f"weather:current:{lat:.4f}:{lon:.4f}"
        cached = await cache.get(cache_key)
        if cached:
            return cached

        try:
            async with aiohttp.ClientSession() as session:
                url, params = self.client.build_request("weather", lat, lon)
                async with session.get(url, params=params) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        processed = self._format_weather_data(data)
                        await cache.set(cache_key, processed, ttl=self.cache_ttl)
                        return processed
                    raise ExternalAPIError("OpenWeatherMap", resp.status, await resp.text())
        except ExternalAPIError:
            raise
        except Exception as e:
            raise ExternalAPIError("OpenWeatherMap", detail=str(e))

    async def get_weather_forecast(self, lat: float, lon: float, days: int = 5) -> Dict[str, Any]:
        if not self.enabled:
            raise ImproperlyConfigured("OPENWEATHER_API_KEY")
        try:
            async with aiohttp.ClientSession() as session:
                url, params = self.client.build_request("forecast", lat, lon, cnt=days * 8)
                async with session.get(url, params=params) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return self._format_forecast_data(data)
                    raise ExternalAPIError("OpenWeatherMap", resp.status, await resp.text())
        except ExternalAPIError:
            raise
        except Exception as e:
            raise ExternalAPIError("OpenWeatherMap", detail=str(e))

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

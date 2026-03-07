"""
Environmental data service — fetches weather + AQI from real APIs.
Raises ExternalAPIError when API keys are missing or calls fail — no mock fallbacks.
"""

import httpx
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ExternalAPIError, ImproperlyConfigured
from app.providers.aqicn.client import AQICNClient
from app.providers.openweather.client import OpenWeatherClient
from app.schemas.common import EnvironmentalMetrics, WeatherData, AQIData, CoordinatePoint

logger = logging.getLogger(__name__)


class EnvironmentalService:
    """Service for fetching environmental data from external APIs."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.http_client = httpx.AsyncClient(timeout=30.0)
        self.weather_client = OpenWeatherClient(api_key=settings.OPENWEATHER_API_KEY, base_url=settings.OPENWEATHER_BASE_URL)
        self.aqi_client = AQICNClient(api_key=settings.WAQI_API_KEY)

    async def get_environmental_data(self, lat: float, lon: float) -> EnvironmentalMetrics:
        """Get combined environmental data (weather + AQI) for a location."""
        try:
            weather_task = self.get_weather_data(lat, lon)
            aqi_task = self.get_aqi_data(lat, lon)
            weather_data, aqi_data = await asyncio.gather(weather_task, aqi_task)

            return EnvironmentalMetrics(
                location=CoordinatePoint(latitude=lat, longitude=lon),
                timestamp=datetime.utcnow(),
                weather=weather_data,
                aqi=aqi_data,
            )
        except Exception as e:
            logger.error(f"Error fetching environmental data: {e}")
            raise

    async def get_weather_data(self, lat: float, lon: float) -> WeatherData:
        """Fetch weather data from OpenWeatherMap API."""
        if not settings.OPENWEATHER_API_KEY:
            raise ImproperlyConfigured("OPENWEATHER_API_KEY")

        try:
            url, params = self.weather_client.build_request("weather", lat, lon)
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            return WeatherData(
                temperature=data["main"]["temp"],
                apparent_temperature=data["main"]["feels_like"],
                humidity=data["main"]["humidity"],
                wind_speed=data["wind"]["speed"],
                wind_direction=data["wind"].get("deg", 0),
                description=data["weather"][0]["description"],
                pressure=data["main"].get("pressure"),
                visibility=data.get("visibility", 0) / 1000,
            )
        except httpx.HTTPStatusError as e:
            raise ExternalAPIError("OpenWeatherMap", e.response.status_code, str(e))
        except Exception as e:
            raise ExternalAPIError("OpenWeatherMap", detail=str(e))

    async def get_aqi_data(self, lat: float, lon: float) -> AQIData:
        """Fetch AQI data from World Air Quality Index API."""
        if not settings.WAQI_API_KEY:
            raise ImproperlyConfigured("WAQI_API_KEY")

        try:
            url, params = self.aqi_client.build_geo_request(lat, lon)
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if data["status"] != "ok":
                raise ExternalAPIError("WAQI", detail=f"API error: {data.get('data', 'Unknown error')}")

            aqi_value = data["data"]["aqi"]
            category = self._get_aqi_category(aqi_value)

            pollutants = []
            if "iaqi" in data["data"]:
                for pollutant, value_data in data["data"]["iaqi"].items():
                    pollutants.append({
                        "name": pollutant.upper(),
                        "value": value_data["v"],
                        "unit": "µg/m³",
                    })

            return AQIData(
                value=aqi_value,
                category=category,
                pollutants=pollutants,
                source="ground-station",
            )
        except ExternalAPIError:
            raise
        except httpx.HTTPStatusError as e:
            raise ExternalAPIError("WAQI", e.response.status_code, str(e))
        except Exception as e:
            raise ExternalAPIError("WAQI", detail=str(e))

    def _get_aqi_category(self, aqi_value: int) -> str:
        if aqi_value <= 50:
            return "Good"
        elif aqi_value <= 100:
            return "Moderate"
        elif aqi_value <= 150:
            return "Unhealthy for Sensitive Groups"
        elif aqi_value <= 200:
            return "Unhealthy"
        elif aqi_value <= 300:
            return "Very Unhealthy"
        else:
            return "Hazardous"

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()

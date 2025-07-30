"""
Environmental data service for fetching weather and AQI data
"""

import httpx
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.schemas.common import EnvironmentalMetrics, WeatherData, AQIData, CoordinatePoint

logger = logging.getLogger(__name__)


class EnvironmentalService:
    """Service for fetching environmental data from external APIs"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.http_client = httpx.AsyncClient(timeout=30.0)
    
    async def get_environmental_data(self, lat: float, lon: float) -> EnvironmentalMetrics:
        """
        Get combined environmental data (weather + AQI) for a location
        """
        try:
            # Fetch weather and AQI data concurrently
            weather_task = self.get_weather_data(lat, lon)
            aqi_task = self.get_aqi_data(lat, lon)
            
            weather_data, aqi_data = await asyncio.gather(weather_task, aqi_task)
            
            return EnvironmentalMetrics(
                location=CoordinatePoint(latitude=lat, longitude=lon),
                timestamp=datetime.utcnow(),
                weather=weather_data,
                aqi=aqi_data
            )
            
        except Exception as e:
            logger.error(f"Error fetching environmental data: {e}")
            raise
    
    async def get_weather_data(self, lat: float, lon: float) -> WeatherData:
        """
        Fetch weather data from OpenWeatherMap API
        """
        if not settings.OPENWEATHER_API_KEY:
            logger.warning("OpenWeatherMap API key not configured, using mock data")
            return self._get_mock_weather_data()
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric"
            }
            
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
                visibility=data.get("visibility", 0) / 1000  # Convert to km
            )
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
            return self._get_mock_weather_data()
    
    async def get_aqi_data(self, lat: float, lon: float) -> AQIData:
        """
        Fetch AQI data from World Air Quality Index API
        """
        if not settings.WAQI_API_KEY:
            logger.warning("WAQI API key not configured, using mock data")
            return self._get_mock_aqi_data()
        
        try:
            url = f"https://api.waqi.info/feed/geo:{lat};{lon}/"
            params = {"token": settings.WAQI_API_KEY}
            
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] != "ok":
                raise Exception(f"WAQI API error: {data.get('data', 'Unknown error')}")
            
            aqi_value = data["data"]["aqi"]
            category = self._get_aqi_category(aqi_value)
            
            # Extract pollutant data
            pollutants = []
            if "iaqi" in data["data"]:
                for pollutant, value_data in data["data"]["iaqi"].items():
                    pollutants.append({
                        "name": pollutant.upper(),
                        "value": value_data["v"],
                        "unit": "µg/m³"
                    })
            
            return AQIData(
                value=aqi_value,
                category=category,
                pollutants=pollutants,
                source="ground-station"
            )
            
        except Exception as e:
            logger.error(f"Error fetching AQI data: {e}")
            return self._get_mock_aqi_data()
    
    def _get_aqi_category(self, aqi_value: int) -> str:
        """Convert AQI value to category"""
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
    
    def _get_mock_weather_data(self) -> WeatherData:
        """Return mock weather data when API is unavailable"""
        return WeatherData(
            temperature=22.5,
            apparent_temperature=24.1,
            humidity=65,
            wind_speed=3.2,
            wind_direction=180,
            description="partly cloudy",
            pressure=1013.25,
            visibility=10.0
        )
    
    def _get_mock_aqi_data(self) -> AQIData:
        """Return mock AQI data when API is unavailable"""
        return AQIData(
            value=45,
            category="Good",
            pollutants=[
                {"name": "PM2.5", "value": 12, "unit": "µg/m³"},
                {"name": "PM10", "value": 18, "unit": "µg/m³"},
                {"name": "NO2", "value": 25, "unit": "µg/m³"},
                {"name": "O3", "value": 85, "unit": "µg/m³"}
            ],
            source="mock"
        )
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()

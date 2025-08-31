"""
Environmental data endpoints for real-time weather and AQI data
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import logging
from typing import Optional, Dict, Any, List
import asyncio

from app.core.database import get_db
from app.core.config import settings
from app.schemas.common import (
    EnvironmentalMetrics,
    WeatherData,
    AQIData,
    CoordinatePoint,
    APIResponse,
    EnhancedAQIRequest,
    LocationRequest,
)
from app.services.environmental import EnvironmentalService
from app.services.enhanced_air_quality import EnhancedAirQualityService
from app.services.weather import WeatherService
from app.services.enhanced_weather import EnhancedWeatherService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/data", response_model=APIResponse)
async def get_environmental_data(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get real-time environmental data (weather + AQI) for a specific location
    
    This endpoint fetches live weather data from OpenWeatherMap and AQI data
    from multiple sources including ground stations and satellite data.
    """
    try:
        service = EnvironmentalService(db)
        
        # Get environmental data
        environmental_data = await service.get_environmental_data(lat, lon)
        
        return APIResponse(
            success=True,
            message="Environmental data retrieved successfully",
            data=environmental_data
        )
        
    except Exception as e:
        logger.error(f"Error fetching environmental data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch environmental data: {str(e)}"
        )


@router.get("/weather", response_model=APIResponse)
async def get_weather_data(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current weather data for a specific location
    """
    try:
        service = EnvironmentalService(db)
        weather_data = await service.get_weather_data(lat, lon)
        
        return APIResponse(
            success=True,
            message="Weather data retrieved successfully",
            data=weather_data
        )
        
    except Exception as e:
        logger.error(f"Error fetching weather data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch weather data: {str(e)}"
        )


@router.get("/aqi", response_model=APIResponse)
async def get_aqi_data(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get Air Quality Index data for a specific location
    
    Combines ground-station data with satellite-derived measurements
    from Sentinel-5P TROPOMI for comprehensive AQI coverage.
    """
    try:
        service = EnvironmentalService(db)
        aqi_data = await service.get_aqi_data(lat, lon)
        
        return APIResponse(
            success=True,
            message="AQI data retrieved successfully",
            data=aqi_data
        )
        
    except Exception as e:
        logger.error(f"Error fetching AQI data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch AQI data: {str(e)}"
        )

@router.post("/enhanced-aqi", response_model=APIResponse)
async def get_enhanced_aqi(
    request: EnhancedAQIRequest,
):
    """Get enhanced air quality data combining multiple sources."""
    try:
        service = EnhancedAirQualityService()
        data = await service.get_hyperlocal_aqi(request.lat, request.lon)
        return APIResponse(
            success=True,
            message=f"Enhanced AQI data for {request.lat}, {request.lon}",
            data=data,
        )
    except Exception as e:
        logger.error(f"Enhanced AQI error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/aqi-coverage/{lat}/{lon}", response_model=APIResponse)
async def check_aqi_coverage(lat: float, lon: float):
    """Check what air quality data coverage is available for coordinates."""
    try:
        service = EnhancedAirQualityService()
        coverage = service.check_coverage_quality(lat, lon)
        return APIResponse(
            success=True,
            message="AQI coverage",
            data={
                "coordinates": {"lat": lat, "lon": lon},
                "coverage": coverage,
                "has_hyperlocal": coverage.get("baseline", False),
                "realtime_sources": coverage.get("realtime_count", 0),
            },
        )
    except Exception as e:
        logger.error(f"AQI coverage error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weather/{lat}/{lon}")
async def get_weather_details(
    lat: float,
    lon: float,
    include_forecast: bool = Query(False),
    include_air_quality: bool = Query(False),
):
    """Enhanced weather endpoint using OpenWeather service.
    Backward compatible: returns current weather by default, optionally forecast and air quality.
    """
    try:
        svc = EnhancedWeatherService()
        current = await svc.get_current_weather(lat, lon)
        data: Dict[str, Any] = {"current_weather": current}
        if include_forecast:
            data["forecast"] = await svc.get_weather_forecast(lat, lon)
        if include_air_quality and hasattr(svc, "get_air_quality"):
            data["air_quality"] = await svc.get_air_quality(lat, lon)
        return {"success": True, **data}
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/weather/bulk")
async def get_bulk_weather_data(
    locations: List[LocationRequest],
):
    """Bulk weather data for multiple locations (lat/lon pairs)."""
    try:
        svc = EnhancedWeatherService()
        tasks = [svc.get_current_weather(loc.lat, loc.lon) for loc in locations]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        data = [r for r in results if not isinstance(r, Exception)]
        return {"success": True, "locations": len(data), "weather_data": data}
    except Exception as e:
        logger.error(f"Bulk weather error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

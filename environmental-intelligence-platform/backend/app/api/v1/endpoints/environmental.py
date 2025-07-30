"""
Environmental data endpoints for real-time weather and AQI data
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import logging
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.schemas.common import EnvironmentalMetrics, WeatherData, AQIData, CoordinatePoint, APIResponse
from app.services.environmental import EnvironmentalService

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

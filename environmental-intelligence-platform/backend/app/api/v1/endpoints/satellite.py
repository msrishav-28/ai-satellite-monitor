"""
Satellite data endpoints for time-lapse generation and satellite imagery
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from datetime import datetime

from app.core.database import get_db
from app.schemas.common import AOIRequest, APIResponse, TimeRange
from app.services.satellite_data import SatelliteDataService
from app.services.timelapse import TimelapseService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/timelapse", response_model=APIResponse)
async def generate_timelapse(
    request: AOIRequest,
    time_range: TimeRange,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate time-lapse animation for an AOI over a specified time period
    """
    try:
        service = TimelapseService(db)
        timelapse_result = await service.generate_timelapse(
            request.geometry, 
            time_range.start_date, 
            time_range.end_date
        )
        
        return APIResponse(
            success=True,
            message="Time-lapse generated successfully",
            data=timelapse_result
        )
        
    except Exception as e:
        logger.error(f"Error generating time-lapse: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate time-lapse: {str(e)}"
        )


@router.post("/data", response_model=APIResponse)
async def get_satellite_data(
    request: AOIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive satellite data for an AOI
    """
    try:
        service = SatelliteDataService()
        satellite_data = await service.get_aoi_data(request.geometry)
        
        return APIResponse(
            success=True,
            message="Satellite data retrieved successfully",
            data=satellite_data
        )
        
    except Exception as e:
        logger.error(f"Error fetching satellite data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch satellite data: {str(e)}"
        )

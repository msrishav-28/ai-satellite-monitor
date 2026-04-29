"""
Hazard analysis endpoints for multi-hazard prediction models
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from typing import Dict, Any

from app.core.database import get_db
from app.schemas.common import AOIRequest, APIResponse
from app.schemas.hazards import HazardAnalysisResponse, HazardRisk
from app.services.hazard_models import HazardModelService
from app.services.realtime_data import RealtimeDataService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=APIResponse)
async def analyze_hazards(
    request: AOIRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze multiple hazard risks for a given Area of Interest (AOI)
    
    This endpoint runs all hazard prediction models:
    - Wildfire ignition and spread risk
    - Flood susceptibility 
    - Landslide susceptibility
    - Deforestation risk
    - Heat wave forecasting
    - Cyclone intensity prediction
    """
    try:
        service = HazardModelService(db)
        
        # Run hazard analysis for the AOI
        hazard_results = await service.analyze_all_hazards(request.geometry)
        
        return APIResponse(
            success=True,
            message="Hazard analysis completed successfully",
            data=hazard_results
        )
        
    except Exception as e:
        logger.error(f"Error in hazard analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze hazards: {str(e)}"
        )


@router.post("/wildfire", response_model=APIResponse)
async def analyze_wildfire_risk(
    request: AOIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze wildfire ignition and spread risk for an AOI
    
    Input variables:
    - Land Surface Temperature (LST) from MODIS/Landsat
    - Fuel moisture content
    - Vegetation type/fuel load maps
    - Real-time wind speed/direction
    - Topographic slope and aspect (DEM)
    - Lightning strike data
    """
    try:
        service = HazardModelService(db)
        wildfire_risk = await service.analyze_wildfire_risk(request.geometry)
        
        return APIResponse(
            success=True,
            message="Wildfire risk analysis completed",
            data=wildfire_risk
        )
        
    except Exception as e:
        logger.error(f"Error in wildfire analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze wildfire risk: {str(e)}"
        )


@router.post("/flood", response_model=APIResponse)
async def analyze_flood_risk(
    request: AOIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze flood susceptibility for an AOI
    
    Input variables:
    - Near real-time precipitation data (GPM)
    - Digital Elevation Models (DEM)
    - River network data
    - Land use/land cover type
    - Soil saturation models
    """
    try:
        service = HazardModelService(db)
        flood_risk = await service.analyze_flood_risk(request.geometry)
        
        return APIResponse(
            success=True,
            message="Flood risk analysis completed",
            data=flood_risk
        )
        
    except Exception as e:
        logger.error(f"Error in flood analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze flood risk: {str(e)}"
        )


@router.post("/landslide", response_model=APIResponse)
async def analyze_landslide_risk(
    request: AOIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze landslide susceptibility for an AOI
    
    Input variables:
    - Slope angle from DEM
    - Soil type data
    - Land cover (forest vs. bare soil)
    - Precipitation intensity data
    - Proximity to fault lines or roads
    """
    try:
        service = HazardModelService(db)
        landslide_risk = await service.analyze_landslide_risk(request.geometry)
        
        return APIResponse(
            success=True,
            message="Landslide risk analysis completed",
            data=landslide_risk
        )
        
    except Exception as e:
        logger.error(f"Error in landslide analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze landslide risk: {str(e)}"
        )


@router.get("/alerts/active", response_model=APIResponse)
async def get_active_hazard_alerts(
    db: AsyncSession = Depends(get_db)
):
    """
    Return active hazard alerts from the database.

    This powers the operational alerts console and never fabricates alert rows
    when the database is empty.
    """
    try:
        service = RealtimeDataService(db)
        alerts = await service.get_active_alerts()

        return APIResponse(
            success=True,
            message="Active hazard alerts retrieved successfully",
            data=alerts
        )

    except Exception as e:
        logger.error(f"Error getting active hazard alerts: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get active hazard alerts: {str(e)}"
        )


@router.get("/updates/recent", response_model=APIResponse)
async def get_recent_hazard_updates(
    db: AsyncSession = Depends(get_db)
):
    """
    Return recent hazard updates derived from stored alert records.
    """
    try:
        service = RealtimeDataService(db)
        updates = await service.get_hazard_updates()

        return APIResponse(
            success=True,
            message="Recent hazard updates retrieved successfully",
            data=updates
        )

    except Exception as e:
        logger.error(f"Error getting recent hazard updates: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recent hazard updates: {str(e)}"
        )

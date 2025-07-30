"""
Impact analysis endpoints for environmental and resource impact assessment
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.database import get_db
from app.schemas.common import AOIRequest, APIResponse
from app.services.impact_analysis import ImpactAnalysisService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=APIResponse)
async def analyze_impact(
    request: AOIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Comprehensive impact analysis including:
    - Carbon emissions estimation
    - Biodiversity impact assessment
    - Agricultural yield prediction
    - Water resource analysis
    """
    try:
        service = ImpactAnalysisService(db)
        impact_results = await service.analyze_comprehensive_impact(request.geometry)
        
        return APIResponse(
            success=True,
            message="Impact analysis completed successfully",
            data=impact_results
        )
        
    except Exception as e:
        logger.error(f"Error in impact analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze impact: {str(e)}"
        )


@router.post("/carbon", response_model=APIResponse)
async def analyze_carbon_impact(
    request: AOIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze carbon emissions and sequestration
    """
    try:
        service = ImpactAnalysisService(db)
        carbon_impact = await service.analyze_carbon_impact(request.geometry)
        
        return APIResponse(
            success=True,
            message="Carbon impact analysis completed",
            data=carbon_impact
        )
        
    except Exception as e:
        logger.error(f"Error in carbon analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze carbon impact: {str(e)}"
        )

"""
AI Insights endpoints for advanced analytics
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.database import get_db
from app.schemas.common import AOIRequest, APIResponse
from app.services.ai_analytics import AIAnalyticsService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=APIResponse)
async def get_ai_insights(
    request: AOIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI-powered insights for an AOI including:
    - Anomaly detection
    - Causal inference analysis  
    - Radar-optical data fusion status
    """
    try:
        service = AIAnalyticsService(db)
        insights = await service.generate_insights(request.geometry)
        
        return APIResponse(
            success=True,
            message="AI insights generated successfully",
            data=insights
        )
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI insights: {str(e)}"
        )


@router.post("/anomaly-detection", response_model=APIResponse)
async def detect_anomalies(
    request: AOIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Run anomaly detection on satellite time series data
    """
    try:
        service = AIAnalyticsService(db)
        anomalies = await service.detect_anomalies(request.geometry)
        
        return APIResponse(
            success=True,
            message="Anomaly detection completed",
            data=anomalies
        )
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to detect anomalies: {str(e)}"
        )

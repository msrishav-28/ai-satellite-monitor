"""
Main API router for v1 endpoints
"""

from fastapi import APIRouter
from app.api.v1.endpoints import environmental, hazards, ai_insights, impact, satellite

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    environmental.router, 
    prefix="/environmental", 
    tags=["environmental"]
)

api_router.include_router(
    hazards.router, 
    prefix="/hazards", 
    tags=["hazards"]
)

api_router.include_router(
    ai_insights.router, 
    prefix="/ai-insights", 
    tags=["ai-insights"]
)

api_router.include_router(
    impact.router, 
    prefix="/impact", 
    tags=["impact"]
)

api_router.include_router(
    satellite.router, 
    prefix="/satellite", 
    tags=["satellite"]
)

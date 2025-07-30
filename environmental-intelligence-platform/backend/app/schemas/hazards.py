"""
Pydantic schemas for hazard analysis
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum


class HazardType(str, Enum):
    """Supported hazard types"""
    WILDFIRE = "wildfire"
    FLOOD = "flood"
    LANDSLIDE = "landslide"
    DEFORESTATION = "deforestation"
    HEATWAVE = "heatwave"
    CYCLONE = "cyclone"


class RiskLevel(str, Enum):
    """Risk level categories"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    EXTREME = "extreme"


class TrendDirection(str, Enum):
    """Risk trend directions"""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class HazardRisk(BaseModel):
    """Individual hazard risk assessment"""
    hazard_type: HazardType
    risk_score: float = Field(..., ge=0, le=100, description="Risk score from 0-100")
    risk_level: RiskLevel
    trend: TrendDirection
    confidence: float = Field(..., ge=0, le=100, description="Model confidence percentage")
    factors: List[str] = Field(..., description="Key contributing factors")
    recommendations: List[str] = Field(..., description="Risk mitigation recommendations")


class WildfireRisk(HazardRisk):
    """Wildfire-specific risk assessment"""
    ignition_probability: float = Field(..., ge=0, le=1, description="Probability of fire ignition")
    spread_rate: float = Field(..., ge=0, description="Estimated spread rate in km/h")
    fuel_moisture: float = Field(..., ge=0, le=100, description="Fuel moisture content percentage")
    fire_weather_index: float = Field(..., ge=0, description="Fire Weather Index value")


class FloodRisk(HazardRisk):
    """Flood-specific risk assessment"""
    return_period: int = Field(..., gt=0, description="Estimated return period in years")
    max_depth: float = Field(..., ge=0, description="Maximum estimated flood depth in meters")
    affected_area: float = Field(..., ge=0, description="Potentially affected area in km²")
    drainage_capacity: float = Field(..., ge=0, le=100, description="Drainage system capacity percentage")


class LandslideRisk(HazardRisk):
    """Landslide-specific risk assessment"""
    slope_stability: float = Field(..., ge=0, le=100, description="Slope stability index")
    soil_saturation: float = Field(..., ge=0, le=100, description="Soil saturation percentage")
    trigger_threshold: float = Field(..., ge=0, description="Precipitation trigger threshold in mm")


class DeforestationRisk(HazardRisk):
    """Deforestation-specific risk assessment"""
    clearing_probability: float = Field(..., ge=0, le=1, description="Probability of forest clearing")
    road_proximity: float = Field(..., ge=0, description="Distance to nearest road in km")
    protection_status: str = Field(..., description="Protected area status")


class HeatwaveRisk(HazardRisk):
    """Heatwave-specific risk assessment"""
    max_temperature: float = Field(..., description="Predicted maximum temperature in °C")
    duration_days: int = Field(..., ge=0, description="Estimated duration in days")
    heat_index: float = Field(..., description="Heat index value")


class CycloneRisk(HazardRisk):
    """Cyclone-specific risk assessment"""
    intensity_category: int = Field(..., ge=1, le=5, description="Saffir-Simpson category")
    wind_speed: float = Field(..., ge=0, description="Maximum sustained wind speed in km/h")
    storm_surge: float = Field(..., ge=0, description="Estimated storm surge height in meters")
    track_probability: float = Field(..., ge=0, le=1, description="Probability of cyclone track")


class HazardAnalysisResponse(BaseModel):
    """Complete hazard analysis response"""
    wildfire: WildfireRisk
    flood: FloodRisk
    landslide: LandslideRisk
    deforestation: DeforestationRisk
    heatwave: HeatwaveRisk
    cyclone: CycloneRisk
    overall_risk_score: float = Field(..., ge=0, le=100, description="Combined risk score")
    priority_hazards: List[HazardType] = Field(..., description="Hazards requiring immediate attention")

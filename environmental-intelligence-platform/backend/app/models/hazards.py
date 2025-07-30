"""
Database models for hazard analysis and predictions
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Boolean, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class RiskLevel(enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    EXTREME = "extreme"


class TrendDirection(enum.Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class HazardType(enum.Enum):
    WILDFIRE = "wildfire"
    FLOOD = "flood"
    LANDSLIDE = "landslide"
    DEFORESTATION = "deforestation"
    HEATWAVE = "heatwave"
    CYCLONE = "cyclone"


class HazardAnalysis(Base):
    """Model for storing hazard analysis results"""
    __tablename__ = "hazard_analysis"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)  # GeoJSON polygon
    
    # Overall analysis
    overall_risk_score = Column(Float, nullable=False)
    priority_hazards = Column(JSON)  # List of hazard types
    
    # Individual hazard scores
    wildfire_risk_score = Column(Float)
    flood_risk_score = Column(Float)
    landslide_risk_score = Column(Float)
    deforestation_risk_score = Column(Float)
    heatwave_risk_score = Column(Float)
    cyclone_risk_score = Column(Float)
    
    # Analysis metadata
    model_version = Column(String(20))
    confidence_score = Column(Float)
    analysis_timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WildfireRisk(Base):
    """Model for detailed wildfire risk analysis"""
    __tablename__ = "wildfire_risk"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), nullable=False)  # Reference to HazardAnalysis
    
    risk_score = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    trend = Column(Enum(TrendDirection), nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Wildfire-specific metrics
    ignition_probability = Column(Float)
    spread_rate = Column(Float)
    fuel_moisture = Column(Float)
    fire_weather_index = Column(Float)
    
    # Contributing factors and recommendations
    factors = Column(JSON)  # List of contributing factors
    recommendations = Column(JSON)  # List of recommendations
    
    # Input variables used
    land_surface_temperature = Column(Float)
    vegetation_index = Column(Float)
    wind_speed = Column(Float)
    humidity = Column(Float)
    slope = Column(Float)
    fuel_load = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class FloodRisk(Base):
    """Model for detailed flood risk analysis"""
    __tablename__ = "flood_risk"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), nullable=False)
    
    risk_score = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    trend = Column(Enum(TrendDirection), nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Flood-specific metrics
    return_period = Column(Integer)
    max_depth = Column(Float)
    affected_area = Column(Float)
    drainage_capacity = Column(Float)
    
    # Contributing factors and recommendations
    factors = Column(JSON)
    recommendations = Column(JSON)
    
    # Input variables used
    precipitation = Column(Float)
    elevation = Column(Float)
    slope = Column(Float)
    land_cover = Column(String(50))
    soil_moisture = Column(Float)
    drainage_density = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class LandslideRisk(Base):
    """Model for detailed landslide risk analysis"""
    __tablename__ = "landslide_risk"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), nullable=False)
    
    risk_score = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    trend = Column(Enum(TrendDirection), nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Landslide-specific metrics
    slope_stability = Column(Float)
    soil_saturation = Column(Float)
    trigger_threshold = Column(Float)
    
    # Contributing factors and recommendations
    factors = Column(JSON)
    recommendations = Column(JSON)
    
    # Input variables used
    slope_angle = Column(Float)
    soil_type = Column(String(50))
    land_cover = Column(String(50))
    precipitation = Column(Float)
    fault_distance = Column(Float)
    road_distance = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class HazardAlert(Base):
    """Model for storing hazard alerts and warnings"""
    __tablename__ = "hazard_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hazard_type = Column(Enum(HazardType), nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    
    title = Column(String(200), nullable=False)
    description = Column(Text)
    location_name = Column(String(200))
    aoi_geometry = Column(JSON)
    
    # Alert timing
    issued_at = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime)
    
    # Alert status
    is_active = Column(Boolean, default=True)
    severity = Column(String(20))
    urgency = Column(String(20))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

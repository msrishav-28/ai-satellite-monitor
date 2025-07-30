"""
Database models for AI analytics and insights
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.core.database import Base


class AIInsight(Base):
    """Model for storing AI-generated insights"""
    __tablename__ = "ai_insights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)  # GeoJSON polygon
    
    # Insight details
    insight_type = Column(String(50), nullable=False)  # anomaly, causal, fusion, prediction
    title = Column(String(200), nullable=False)
    details = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(20))  # low, medium, high
    
    # Location information
    location_lat = Column(Float)
    location_lon = Column(Float)
    
    # Timing
    detected_at = Column(DateTime, default=datetime.utcnow)
    
    # Additional data
    metadata = Column(JSON)  # Additional insight-specific data
    
    # Status
    is_active = Column(Boolean, default=True)
    reviewed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AnomalyDetection(Base):
    """Model for storing anomaly detection results"""
    __tablename__ = "anomaly_detection"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)
    
    # Detection summary
    anomalies_detected = Column(Integer, default=0)
    detection_method = Column(String(100))
    time_period_start = Column(DateTime)
    time_period_end = Column(DateTime)
    
    # Model performance
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    
    # Detected anomalies
    anomalies = Column(JSON)  # List of individual anomalies
    
    # Analysis metadata
    model_version = Column(String(20))
    processing_time = Column(Float)  # seconds
    
    created_at = Column(DateTime, default=datetime.utcnow)


class CausalAnalysis(Base):
    """Model for storing causal inference analysis results"""
    __tablename__ = "causal_analysis"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)
    
    # Analysis details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    treatment_variable = Column(String(100))  # e.g., "new_road"
    outcome_variable = Column(String(100))    # e.g., "deforestation_rate"
    
    # Results
    causal_effect = Column(Float)  # Estimated causal impact
    effect_description = Column(String(200))  # e.g., "15% increase"
    confidence = Column(Float)
    p_value = Column(Float)
    
    # Methodology
    method = Column(String(100))  # e.g., "difference-in-differences"
    control_areas = Column(Integer)
    treatment_areas = Column(Integer)
    
    # Time period
    baseline_start = Column(DateTime)
    baseline_end = Column(DateTime)
    treatment_start = Column(DateTime)
    treatment_end = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class DataFusionStatus(Base):
    """Model for tracking radar-optical data fusion status"""
    __tablename__ = "data_fusion_status"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)
    
    # Fusion status
    status = Column(String(20), nullable=False)  # Active, Inactive, Partial
    optical_coverage = Column(Float)  # Percentage
    radar_coverage = Column(Float)    # Percentage
    fusion_quality = Column(String(20))  # excellent, good, fair, poor
    
    # Data sources
    optical_source = Column(String(100))  # e.g., "Sentinel-2"
    radar_source = Column(String(100))    # e.g., "Sentinel-1"
    
    # Last update
    last_optical_update = Column(DateTime)
    last_radar_update = Column(DateTime)
    
    # Quality metrics
    cloud_coverage = Column(Float)
    data_gaps = Column(JSON)  # List of temporal gaps
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ModelPrediction(Base):
    """Model for storing ML model predictions"""
    __tablename__ = "model_predictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)
    
    # Prediction details
    model_type = Column(String(50), nullable=False)  # wildfire, flood, etc.
    prediction_type = Column(String(50))  # short_term, long_term
    prediction_value = Column(Float)
    prediction_text = Column(Text)
    confidence = Column(Float)
    
    # Input features
    input_features = Column(JSON)
    
    # Model metadata
    model_version = Column(String(20))
    model_name = Column(String(100))
    
    # Timing
    prediction_date = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)

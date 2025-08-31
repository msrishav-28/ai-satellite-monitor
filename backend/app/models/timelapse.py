"""
Database models for timelapse generation and management
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Boolean, Text
from app.core.database import GUID
from datetime import datetime
import uuid

from app.core.database import Base


class TimelapseRequest(Base):
    """Model for storing timelapse generation requests"""
    __tablename__ = "timelapse_requests"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)  # GeoJSON polygon
    
    # Time range
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    duration_days = Column(Integer)
    
    # Processing status
    status = Column(String(20), default='pending')  # pending, processing, completed, failed
    progress_percentage = Column(Float, default=0.0)
    
    # Output files
    video_url = Column(String(500))
    gif_url = Column(String(500))
    thumbnail_url = Column(String(500))
    
    # Processing metadata
    processing_started_at = Column(DateTime)
    processing_completed_at = Column(DateTime)
    processing_time_seconds = Column(Float)
    error_message = Column(Text)
    
    # Request metadata
    requested_by = Column(String(100))  # User identifier
    priority = Column(String(20), default='normal')  # low, normal, high
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TimelapseMetadata(Base):
    """Model for storing detailed timelapse metadata"""
    __tablename__ = "timelapse_metadata"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    request_id = Column(GUID(), nullable=False)  # Reference to TimelapseRequest
    
    # Video specifications
    frame_count = Column(Integer)
    resolution = Column(String(20))  # e.g., "1920x1080"
    frame_rate = Column(Integer)     # frames per second
    file_size_mb = Column(Float)
    duration_seconds = Column(Float)
    
    # Satellite data used
    primary_source = Column(String(100))    # e.g., "Sentinel-2"
    secondary_source = Column(String(100))  # e.g., "Landsat-8/9"
    images_used = Column(Integer)
    cloud_coverage_threshold = Column(Float)
    data_quality = Column(String(20))       # excellent, good, fair, poor
    
    # Visualization settings
    bands_used = Column(JSON)               # e.g., ["B4", "B3", "B2"]
    enhancement_method = Column(String(50)) # e.g., "histogram_stretch"
    cloud_masking_enabled = Column(Boolean, default=True)
    temporal_smoothing_enabled = Column(Boolean, default=True)
    
    # Analysis insights
    change_detected = Column(Boolean, default=False)
    change_type = Column(String(50))        # e.g., "vegetation_loss"
    change_magnitude = Column(String(20))   # low, moderate, high
    change_locations = Column(JSON)         # List of change locations with scores
    
    # Quality metrics
    temporal_coverage = Column(Float)       # percentage of time period covered
    spatial_coverage = Column(Float)        # percentage of AOI covered
    overall_quality_score = Column(Float)   # 0-100
    
    created_at = Column(DateTime, default=datetime.utcnow)


class TimelapseDownload(Base):
    """Model for tracking timelapse downloads"""
    __tablename__ = "timelapse_downloads"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    request_id = Column(GUID(), nullable=False)
    
    # Download details
    file_type = Column(String(10))          # mp4, gif, webm
    file_url = Column(String(500))
    file_size_mb = Column(Float)
    resolution = Column(String(20))
    
    # Download tracking
    download_count = Column(Integer, default=0)
    last_downloaded_at = Column(DateTime)
    
    # Expiry
    expires_at = Column(DateTime)
    is_expired = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SatelliteImagery(Base):
    """Model for storing satellite imagery metadata used in timelapses"""
    __tablename__ = "satellite_imagery"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    
    # Image identification
    image_id = Column(String(100), unique=True, nullable=False)
    satellite = Column(String(50))          # Sentinel-2, Landsat-8, etc.
    sensor = Column(String(50))             # MSI, OLI, etc.
    
    # Spatial information
    aoi_geometry = Column(JSON)             # GeoJSON polygon
    scene_geometry = Column(JSON)           # Full scene geometry
    
    # Temporal information
    acquisition_date = Column(DateTime, nullable=False)
    processing_date = Column(DateTime)
    
    # Quality metrics
    cloud_coverage = Column(Float)          # percentage
    data_quality = Column(String(20))       # excellent, good, fair, poor
    sun_elevation = Column(Float)           # degrees
    sun_azimuth = Column(Float)             # degrees
    
    # Processing information
    processing_level = Column(String(10))   # L1C, L2A, etc.
    bands_available = Column(JSON)          # List of available bands
    
    # File information
    file_path = Column(String(500))
    file_size_mb = Column(Float)
    
    # Usage tracking
    used_in_timelapses = Column(Integer, default=0)
    last_used_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProcessingQueue(Base):
    """Model for managing timelapse processing queue"""
    __tablename__ = "processing_queue"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    request_id = Column(GUID(), nullable=False)
    
    # Queue management
    queue_position = Column(Integer)
    priority = Column(String(20), default='normal')  # low, normal, high, urgent
    estimated_processing_time = Column(Integer)      # minutes
    
    # Resource requirements
    cpu_cores_required = Column(Integer, default=2)
    memory_gb_required = Column(Float, default=4.0)
    storage_gb_required = Column(Float, default=10.0)
    
    # Processing worker
    assigned_worker = Column(String(100))
    worker_started_at = Column(DateTime)
    
    # Status tracking
    status = Column(String(20), default='queued')  # queued, assigned, processing, completed, failed
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Timing
    queued_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

"""
Database models for environmental data
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Boolean, Text
from app.core.database import GUID
from datetime import datetime
import uuid

from app.core.database import Base


class EnvironmentalData(Base):
    """Model for storing environmental metrics data"""
    __tablename__ = "environmental_data"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    # Weather data
    temperature = Column(Float)
    apparent_temperature = Column(Float)
    humidity = Column(Integer)
    wind_speed = Column(Float)
    wind_direction = Column(Integer)
    pressure = Column(Float)
    visibility = Column(Float)
    weather_description = Column(String(100))
    
    # Air quality data
    aqi_value = Column(Integer)
    aqi_category = Column(String(50))
    aqi_source = Column(String(50))
    pollutants = Column(JSON)
    
    # Metadata
    data_source = Column(String(100))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SatelliteData(Base):
    """Model for storing satellite imagery data and indices"""
    __tablename__ = "satellite_data"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)  # GeoJSON polygon
    
    # Vegetation indices
    ndvi = Column(Float)
    evi = Column(Float)
    savi = Column(Float)
    
    # Temperature data
    land_surface_temperature = Column(Float)
    temperature_anomaly = Column(Float)
    
    # Precipitation
    precipitation = Column(Float)
    precipitation_anomaly = Column(Float)
    
    # Topography
    elevation = Column(Float)
    slope = Column(Float)
    aspect = Column(Float)
    
    # Land cover
    land_cover = Column(String(50))
    forest_percentage = Column(Float)
    urban_percentage = Column(Float)
    
    # Soil and moisture
    soil_moisture = Column(Float)
    soil_type = Column(String(50))
    
    # Infrastructure proximity
    road_distance = Column(Float)
    settlement_distance = Column(Float)
    fault_distance = Column(Float)
    
    # Fire-related
    fuel_load = Column(Float)
    fuel_moisture = Column(Float)
    
    # Water-related
    drainage_density = Column(Float)
    river_distance = Column(Float)
    
    # Data quality
    cloud_cover = Column(Float)
    data_quality = Column(String(20))
    acquisition_date = Column(DateTime)
    
    # Metadata
    data_source = Column(String(100))
    processing_level = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WeatherHistory(Base):
    """Model for storing historical weather data"""
    __tablename__ = "weather_history"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    temperature = Column(Float)
    humidity = Column(Integer)
    wind_speed = Column(Float)
    wind_direction = Column(Integer)
    pressure = Column(Float)
    precipitation = Column(Float)
    
    timestamp = Column(DateTime, nullable=False, index=True)
    data_source = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

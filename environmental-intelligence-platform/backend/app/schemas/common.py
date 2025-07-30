"""
Common Pydantic schemas for the Environmental Intelligence Platform
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from geojson_pydantic import Polygon, Point


class AOIRequest(BaseModel):
    """Area of Interest request schema"""
    geometry: Polygon = Field(..., description="GeoJSON Polygon defining the area of interest")
    properties: Optional[Dict[str, Any]] = Field(default={}, description="Additional properties")


class CoordinatePoint(BaseModel):
    """Geographic coordinate point"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")


class TimeRange(BaseModel):
    """Time range for temporal queries"""
    start_date: datetime = Field(..., description="Start date and time")
    end_date: datetime = Field(..., description="End date and time")


class WeatherData(BaseModel):
    """Weather data schema"""
    temperature: float = Field(..., description="Temperature in Celsius")
    apparent_temperature: float = Field(..., description="Feels-like temperature in Celsius")
    humidity: int = Field(..., ge=0, le=100, description="Relative humidity percentage")
    wind_speed: float = Field(..., ge=0, description="Wind speed in m/s")
    wind_direction: int = Field(..., ge=0, le=360, description="Wind direction in degrees")
    description: str = Field(..., description="Weather description")
    pressure: Optional[float] = Field(None, description="Atmospheric pressure in hPa")
    visibility: Optional[float] = Field(None, description="Visibility in km")


class AQIData(BaseModel):
    """Air Quality Index data schema"""
    value: int = Field(..., ge=0, description="Overall AQI value")
    category: str = Field(..., description="AQI category (Good, Moderate, etc.)")
    pollutants: List[Dict[str, Union[str, float]]] = Field(..., description="Individual pollutant measurements")
    source: str = Field(..., description="Data source (satellite/ground-station)")


class EnvironmentalMetrics(BaseModel):
    """Combined environmental metrics response"""
    location: CoordinatePoint
    timestamp: datetime
    weather: WeatherData
    aqi: AQIData


class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool = Field(True, description="Request success status")
    message: str = Field("Success", description="Response message")
    data: Optional[Any] = Field(None, description="Response data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")


class ErrorResponse(BaseModel):
    """Error response schema"""
    success: bool = Field(False, description="Request success status")
    error: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")

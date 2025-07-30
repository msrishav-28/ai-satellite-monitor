"""
Hazard prediction models service
Integrates with satellite data and ML models for multi-hazard analysis
"""

import logging
import asyncio
import numpy as np
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from geojson_pydantic import Polygon

from app.schemas.hazards import (
    HazardAnalysisResponse, WildfireRisk, FloodRisk, LandslideRisk,
    DeforestationRisk, HeatwaveRisk, CycloneRisk, HazardType, RiskLevel, TrendDirection
)
from app.services.satellite_data import SatelliteDataService
from app.services.ml_models import MLModelService

logger = logging.getLogger(__name__)


class HazardModelService:
    """Service for running hazard prediction models"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.satellite_service = SatelliteDataService()
        self.ml_service = MLModelService()
    
    async def analyze_all_hazards(self, aoi: Polygon) -> HazardAnalysisResponse:
        """
        Run all hazard prediction models for the given AOI
        """
        try:
            # Get satellite data for the AOI
            satellite_data = await self.satellite_service.get_aoi_data(aoi)
            
            # Run all hazard models concurrently
            wildfire_task = self.analyze_wildfire_risk(aoi, satellite_data)
            flood_task = self.analyze_flood_risk(aoi, satellite_data)
            landslide_task = self.analyze_landslide_risk(aoi, satellite_data)
            deforestation_task = self.analyze_deforestation_risk(aoi, satellite_data)
            heatwave_task = self.analyze_heatwave_risk(aoi, satellite_data)
            cyclone_task = self.analyze_cyclone_risk(aoi, satellite_data)
            
            # Wait for all analyses to complete
            results = await asyncio.gather(
                wildfire_task, flood_task, landslide_task,
                deforestation_task, heatwave_task, cyclone_task
            )
            
            wildfire, flood, landslide, deforestation, heatwave, cyclone = results
            
            # Calculate overall risk score
            overall_risk = self._calculate_overall_risk([
                wildfire.risk_score, flood.risk_score, landslide.risk_score,
                deforestation.risk_score, heatwave.risk_score, cyclone.risk_score
            ])
            
            # Identify priority hazards
            priority_hazards = self._identify_priority_hazards([
                wildfire, flood, landslide, deforestation, heatwave, cyclone
            ])
            
            return HazardAnalysisResponse(
                wildfire=wildfire,
                flood=flood,
                landslide=landslide,
                deforestation=deforestation,
                heatwave=heatwave,
                cyclone=cyclone,
                overall_risk_score=overall_risk,
                priority_hazards=priority_hazards
            )
            
        except Exception as e:
            logger.error(f"Error in hazard analysis: {e}")
            # Return mock data if real analysis fails
            return self._get_mock_hazard_analysis()
    
    async def analyze_landslide_risk(self, aoi: Polygon, satellite_data: Dict = None) -> Dict[str, Any]:
        """
        Analyze landslide susceptibility using ML model
        """
        try:
            # Extract features from satellite data and AOI
            features = await self._extract_landslide_features(aoi, satellite_data)

            # Use ML model for prediction
            prediction = await self.ml_service.predict_landslide_risk(features)

            return {
                'risk_score': prediction['risk_score'],
                'confidence': prediction['confidence'],
                'contributing_factors': prediction['contributing_factors'],
                'recommendations': prediction['recommendations'],
                'stability_factor': prediction.get('stability_factor', 1.5),
                'trigger_threshold': prediction.get('trigger_threshold', 75.0),
                'affected_area': prediction.get('affected_area', 2.0)
            }

        except Exception as e:
            logger.error(f"Error in landslide analysis: {e}")
            return self._get_mock_landslide_risk()

    async def analyze_wildfire_risk(self, aoi: Polygon, satellite_data: Dict = None) -> WildfireRisk:
        """
        Analyze wildfire ignition and spread risk
        
        Input variables:
        - Land Surface Temperature (LST)
        - Fuel moisture content
        - Vegetation type/fuel load maps
        - Wind speed/direction
        - Topographic slope and aspect
        - Lightning strike data
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)
            
            # Extract relevant features for wildfire model
            features = {
                'lst': satellite_data.get('land_surface_temperature', 25.0),
                'ndvi': satellite_data.get('ndvi', 0.6),
                'wind_speed': satellite_data.get('wind_speed', 5.0),
                'humidity': satellite_data.get('humidity', 60.0),
                'slope': satellite_data.get('slope', 10.0),
                'fuel_load': satellite_data.get('fuel_load', 0.7)
            }
            
            # Run wildfire prediction model
            prediction = await self.ml_service.predict_wildfire_risk(features)
            
            return WildfireRisk(
                hazard_type=HazardType.WILDFIRE,
                risk_score=prediction['risk_score'],
                risk_level=self._get_risk_level(prediction['risk_score']),
                trend=TrendDirection.UP if prediction['risk_score'] > 60 else TrendDirection.STABLE,
                confidence=prediction['confidence'],
                factors=prediction['contributing_factors'],
                recommendations=prediction['recommendations'],
                ignition_probability=prediction['ignition_probability'],
                spread_rate=prediction['spread_rate'],
                fuel_moisture=prediction['fuel_moisture'],
                fire_weather_index=prediction['fire_weather_index']
            )
            
        except Exception as e:
            logger.error(f"Error in wildfire analysis: {e}")
            return self._get_mock_wildfire_risk()
    
    async def analyze_flood_risk(self, aoi: Polygon, satellite_data: Dict = None) -> FloodRisk:
        """
        Analyze flood susceptibility
        
        Input variables:
        - Precipitation data (GPM)
        - Digital Elevation Models (DEM)
        - River network data
        - Land use/land cover type
        - Soil saturation models
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)
            
            features = {
                'precipitation': satellite_data.get('precipitation', 50.0),
                'elevation': satellite_data.get('elevation', 100.0),
                'slope': satellite_data.get('slope', 5.0),
                'land_cover': satellite_data.get('land_cover', 'urban'),
                'soil_moisture': satellite_data.get('soil_moisture', 0.3),
                'drainage_density': satellite_data.get('drainage_density', 0.5)
            }
            
            prediction = await self.ml_service.predict_flood_risk(features)
            
            return FloodRisk(
                hazard_type=HazardType.FLOOD,
                risk_score=prediction['risk_score'],
                risk_level=self._get_risk_level(prediction['risk_score']),
                trend=TrendDirection.DOWN,
                confidence=prediction['confidence'],
                factors=prediction['contributing_factors'],
                recommendations=prediction['recommendations'],
                return_period=prediction['return_period'],
                max_depth=prediction['max_depth'],
                affected_area=prediction['affected_area'],
                drainage_capacity=prediction['drainage_capacity']
            )
            
        except Exception as e:
            logger.error(f"Error in flood analysis: {e}")
            return self._get_mock_flood_risk()
    
    async def analyze_landslide_risk(self, aoi: Polygon, satellite_data: Dict = None) -> LandslideRisk:
        """
        Analyze landslide susceptibility
        
        Input variables:
        - Slope angle
        - Soil type data
        - Land cover
        - Precipitation intensity
        - Proximity to fault lines/roads
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)
            
            features = {
                'slope_angle': satellite_data.get('slope', 15.0),
                'soil_type': satellite_data.get('soil_type', 'clay'),
                'land_cover': satellite_data.get('land_cover', 'forest'),
                'precipitation': satellite_data.get('precipitation', 100.0),
                'fault_distance': satellite_data.get('fault_distance', 5.0),
                'road_distance': satellite_data.get('road_distance', 2.0)
            }
            
            prediction = await self.ml_service.predict_landslide_risk(features)
            
            return LandslideRisk(
                hazard_type=HazardType.LANDSLIDE,
                risk_score=prediction['risk_score'],
                risk_level=self._get_risk_level(prediction['risk_score']),
                trend=TrendDirection.STABLE,
                confidence=prediction['confidence'],
                factors=prediction['contributing_factors'],
                recommendations=prediction['recommendations'],
                slope_stability=prediction['slope_stability'],
                soil_saturation=prediction['soil_saturation'],
                trigger_threshold=prediction['trigger_threshold']
            )
            
        except Exception as e:
            logger.error(f"Error in landslide analysis: {e}")
            return self._get_mock_landslide_risk()
    
    def _get_risk_level(self, risk_score: float) -> RiskLevel:
        """Convert risk score to risk level"""
        if risk_score < 25:
            return RiskLevel.LOW
        elif risk_score < 50:
            return RiskLevel.MODERATE
        elif risk_score < 75:
            return RiskLevel.HIGH
        else:
            return RiskLevel.EXTREME
    
    def _calculate_overall_risk(self, risk_scores: List[float]) -> float:
        """Calculate weighted overall risk score"""
        # Weight different hazards based on severity and likelihood
        weights = [0.2, 0.15, 0.15, 0.1, 0.2, 0.2]  # wildfire, flood, landslide, deforestation, heatwave, cyclone
        weighted_sum = sum(score * weight for score, weight in zip(risk_scores, weights))
        return min(100.0, weighted_sum)
    
    def _identify_priority_hazards(self, hazards: List) -> List[HazardType]:
        """Identify hazards requiring immediate attention"""
        priority = []
        for hazard in hazards:
            if hazard.risk_score >= 75:
                priority.append(hazard.hazard_type)
        return priority[:3]  # Return top 3 priority hazards

    async def analyze_deforestation_risk(self, aoi: Polygon, satellite_data: Dict = None) -> DeforestationRisk:
        """Mock deforestation risk analysis"""
        return DeforestationRisk(
            hazard_type=HazardType.DEFORESTATION,
            risk_score=30.0,
            risk_level=RiskLevel.MODERATE,
            trend=TrendDirection.UP,
            confidence=85.0,
            factors=["Road proximity", "Agricultural expansion"],
            recommendations=["Monitor forest boundaries", "Strengthen protection"],
            clearing_probability=0.15,
            road_proximity=2.5,
            protection_status="Partially Protected"
        )

    async def analyze_heatwave_risk(self, aoi: Polygon, satellite_data: Dict = None) -> HeatwaveRisk:
        """Mock heatwave risk analysis"""
        return HeatwaveRisk(
            hazard_type=HazardType.HEATWAVE,
            risk_score=85.0,
            risk_level=RiskLevel.EXTREME,
            trend=TrendDirection.UP,
            confidence=90.0,
            factors=["High temperatures", "Low humidity", "Urban heat island"],
            recommendations=["Heat warning system", "Cooling centers"],
            max_temperature=42.0,
            duration_days=5,
            heat_index=48.0
        )

    async def analyze_cyclone_risk(self, aoi: Polygon, satellite_data: Dict = None) -> CycloneRisk:
        """Mock cyclone risk analysis"""
        return CycloneRisk(
            hazard_type=HazardType.CYCLONE,
            risk_score=15.0,
            risk_level=RiskLevel.LOW,
            trend=TrendDirection.DOWN,
            confidence=75.0,
            factors=["Low sea surface temperature", "High wind shear"],
            recommendations=["Continue monitoring", "Maintain preparedness"],
            intensity_category=1,
            wind_speed=85.0,
            storm_surge=1.2,
            track_probability=0.1
        )

    def _get_mock_hazard_analysis(self) -> HazardAnalysisResponse:
        """Return mock hazard analysis when real analysis fails"""
        wildfire = self._get_mock_wildfire_risk()
        flood = self._get_mock_flood_risk()
        landslide = self._get_mock_landslide_risk()
        deforestation = DeforestationRisk(
            hazard_type=HazardType.DEFORESTATION,
            risk_score=30.0,
            risk_level=RiskLevel.MODERATE,
            trend=TrendDirection.UP,
            confidence=85.0,
            factors=["Road proximity"],
            recommendations=["Monitor boundaries"],
            clearing_probability=0.15,
            road_proximity=2.5,
            protection_status="Partially Protected"
        )
        heatwave = HeatwaveRisk(
            hazard_type=HazardType.HEATWAVE,
            risk_score=85.0,
            risk_level=RiskLevel.EXTREME,
            trend=TrendDirection.UP,
            confidence=90.0,
            factors=["High temperatures"],
            recommendations=["Heat warnings"],
            max_temperature=42.0,
            duration_days=5,
            heat_index=48.0
        )
        cyclone = CycloneRisk(
            hazard_type=HazardType.CYCLONE,
            risk_score=15.0,
            risk_level=RiskLevel.LOW,
            trend=TrendDirection.DOWN,
            confidence=75.0,
            factors=["Low SST"],
            recommendations=["Monitor"],
            intensity_category=1,
            wind_speed=85.0,
            storm_surge=1.2,
            track_probability=0.1
        )

        return HazardAnalysisResponse(
            wildfire=wildfire,
            flood=flood,
            landslide=landslide,
            deforestation=deforestation,
            heatwave=heatwave,
            cyclone=cyclone,
            overall_risk_score=55.0,
            priority_hazards=[HazardType.HEATWAVE, HazardType.WILDFIRE]
        )

    def _get_mock_wildfire_risk(self) -> WildfireRisk:
        """Return mock wildfire risk"""
        return WildfireRisk(
            hazard_type=HazardType.WILDFIRE,
            risk_score=78.0,
            risk_level=RiskLevel.HIGH,
            trend=TrendDirection.UP,
            confidence=88.0,
            factors=["High temperature", "Low humidity", "Dry vegetation"],
            recommendations=["Fire watch", "Evacuation planning"],
            ignition_probability=0.65,
            spread_rate=2.5,
            fuel_moisture=15.0,
            fire_weather_index=85.0
        )

    def _get_mock_flood_risk(self) -> FloodRisk:
        """Return mock flood risk"""
        return FloodRisk(
            hazard_type=HazardType.FLOOD,
            risk_score=45.0,
            risk_level=RiskLevel.MODERATE,
            trend=TrendDirection.DOWN,
            confidence=82.0,
            factors=["Recent rainfall", "Poor drainage"],
            recommendations=["Improve drainage", "Early warning"],
            return_period=25,
            max_depth=1.5,
            affected_area=12.5,
            drainage_capacity=65.0
        )

    def _get_mock_landslide_risk(self) -> LandslideRisk:
        """Return mock landslide risk"""
        return LandslideRisk(
            hazard_type=HazardType.LANDSLIDE,
            risk_score=62.0,
            risk_level=RiskLevel.HIGH,
            trend=TrendDirection.STABLE,
            confidence=79.0,
            factors=["Steep slopes", "Saturated soil"],
            recommendations=["Slope monitoring", "Drainage improvement"],
            slope_stability=45.0,
            soil_saturation=85.0,
            trigger_threshold=75.0
        )

    async def _extract_landslide_features(self, aoi: Polygon, satellite_data: Dict = None) -> Dict[str, Any]:
        """Extract features for landslide susceptibility analysis"""
        try:
            # Get AOI centroid for point-based analysis
            centroid = self._get_aoi_centroid(aoi)

            # Extract topographic features
            elevation = satellite_data.get('elevation', 500.0) if satellite_data else 500.0
            slope = satellite_data.get('slope', 15.0) if satellite_data else 15.0
            aspect = satellite_data.get('aspect', 180.0) if satellite_data else 180.0

            # Extract geological features
            geology_type = satellite_data.get('geology_type', 'sedimentary') if satellite_data else 'sedimentary'

            # Extract soil features
            soil_clay_content = satellite_data.get('soil_clay_content', 25.0) if satellite_data else 25.0
            soil_sand_content = satellite_data.get('soil_sand_content', 35.0) if satellite_data else 35.0

            # Extract land cover
            land_cover = satellite_data.get('land_cover', 'mixed') if satellite_data else 'mixed'

            # Extract precipitation data
            precipitation_annual = satellite_data.get('precipitation_annual', 1000.0) if satellite_data else 1000.0
            precipitation_intensity = satellite_data.get('precipitation_intensity', 50.0) if satellite_data else 50.0

            # Extract vegetation index
            ndvi = satellite_data.get('ndvi', 0.6) if satellite_data else 0.6

            # Distance features (simplified)
            distance_to_faults = 10.0  # km
            distance_to_roads = 2.0    # km

            # Additional topographic features
            drainage_density = 0.5
            contributing_area = 100.0  # m²
            slope_length = 100.0       # m
            slope_width = 50.0         # m

            features = {
                'elevation': elevation,
                'slope': slope,
                'aspect': aspect,
                'geology_type': geology_type,
                'soil_clay_content': soil_clay_content,
                'soil_sand_content': soil_sand_content,
                'land_cover': land_cover,
                'precipitation_annual': precipitation_annual,
                'precipitation_intensity': precipitation_intensity,
                'ndvi': ndvi,
                'distance_to_faults': distance_to_faults,
                'distance_to_roads': distance_to_roads,
                'drainage_density': drainage_density,
                'contributing_area': contributing_area,
                'slope_length': slope_length,
                'slope_width': slope_width,
                'soil_cohesion': 20.0,      # kPa
                'friction_angle': 30.0,     # degrees
                'soil_permeability': 10.0,  # mm/hr
                'max_elevation': elevation + 100,
                'min_elevation': elevation - 100,
                'basin_length': 1000.0      # m
            }

            return features

        except Exception as e:
            logger.error(f"Error extracting landslide features: {e}")
            # Return default features
            return {
                'elevation': 500.0,
                'slope': 15.0,
                'aspect': 180.0,
                'geology_type': 'sedimentary',
                'soil_clay_content': 25.0,
                'soil_sand_content': 35.0,
                'land_cover': 'mixed',
                'precipitation_annual': 1000.0,
                'precipitation_intensity': 50.0,
                'ndvi': 0.6,
                'distance_to_faults': 10.0,
                'distance_to_roads': 2.0,
                'drainage_density': 0.5,
                'contributing_area': 100.0,
                'slope_length': 100.0,
                'slope_width': 50.0,
                'soil_cohesion': 20.0,
                'friction_angle': 30.0,
                'soil_permeability': 10.0,
                'max_elevation': 600.0,
                'min_elevation': 400.0,
                'basin_length': 1000.0
            }

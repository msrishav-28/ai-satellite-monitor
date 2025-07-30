"""
Machine Learning models service for hazard prediction
Loads and runs trained ML models for various environmental hazards
"""

import logging
import numpy as np
from typing import Dict, Any, List
import asyncio

logger = logging.getLogger(__name__)


class MLModelService:
    """Service for running ML prediction models"""
    
    def __init__(self):
        self.models_loaded = False
        self.wildfire_model = None
        self.flood_model = None
        self.landslide_model = None
        self.deforestation_model = None
        self.anomaly_model = None
    
    async def load_models(self):
        """Load all trained ML models"""
        try:
            # In a real implementation, load actual trained models here
            # self.wildfire_model = joblib.load('models/wildfire_model.pkl')
            # self.flood_model = joblib.load('models/flood_model.pkl')
            # etc.
            
            self.models_loaded = True
            logger.info("ML models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading ML models: {e}")
            self.models_loaded = False
    
    async def predict_wildfire_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict wildfire ignition and spread risk
        
        Features:
        - lst: Land Surface Temperature
        - ndvi: Vegetation index
        - wind_speed: Wind speed
        - humidity: Relative humidity
        - slope: Terrain slope
        - fuel_load: Vegetation fuel load
        """
        try:
            # Mock prediction logic - replace with actual model inference
            lst = features.get('lst', 25.0)
            ndvi = features.get('ndvi', 0.6)
            wind_speed = features.get('wind_speed', 5.0)
            humidity = features.get('humidity', 60.0)
            slope = features.get('slope', 10.0)
            fuel_load = features.get('fuel_load', 0.7)
            
            # Simple risk calculation (replace with actual model)
            temperature_risk = min(100, max(0, (lst - 20) * 4))
            vegetation_risk = max(0, (0.8 - ndvi) * 100)
            wind_risk = min(100, wind_speed * 8)
            humidity_risk = max(0, (70 - humidity) * 2)
            slope_risk = min(100, slope * 2)
            fuel_risk = fuel_load * 100
            
            # Weighted combination
            risk_score = (
                temperature_risk * 0.25 +
                vegetation_risk * 0.15 +
                wind_risk * 0.20 +
                humidity_risk * 0.15 +
                slope_risk * 0.10 +
                fuel_risk * 0.15
            )
            
            # Calculate derived metrics
            ignition_prob = min(1.0, risk_score / 100)
            spread_rate = max(0, wind_speed * (1 - humidity/100) * fuel_load)
            fuel_moisture = max(5, 50 - temperature_risk/2)
            fire_weather_index = (temperature_risk + wind_risk - humidity_risk/2) / 2
            
            return {
                'risk_score': min(100, risk_score),
                'confidence': 85.0,
                'contributing_factors': self._get_wildfire_factors(features),
                'recommendations': self._get_wildfire_recommendations(risk_score),
                'ignition_probability': ignition_prob,
                'spread_rate': spread_rate,
                'fuel_moisture': fuel_moisture,
                'fire_weather_index': max(0, fire_weather_index)
            }
            
        except Exception as e:
            logger.error(f"Error in wildfire prediction: {e}")
            return self._get_default_wildfire_prediction()
    
    async def predict_flood_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict flood susceptibility
        
        Features:
        - precipitation: Recent precipitation
        - elevation: Mean elevation
        - slope: Terrain slope
        - land_cover: Land cover type
        - soil_moisture: Soil moisture content
        - drainage_density: Drainage network density
        """
        try:
            precipitation = features.get('precipitation', 50.0)
            elevation = features.get('elevation', 100.0)
            slope = features.get('slope', 5.0)
            soil_moisture = features.get('soil_moisture', 0.3)
            drainage_density = features.get('drainage_density', 0.5)
            
            # Simple flood risk calculation
            precip_risk = min(100, precipitation * 1.5)
            elevation_risk = max(0, (200 - elevation) / 2)
            slope_risk = max(0, (10 - slope) * 8)
            moisture_risk = soil_moisture * 100
            drainage_risk = max(0, (0.3 - drainage_density) * 200)
            
            risk_score = (
                precip_risk * 0.30 +
                elevation_risk * 0.20 +
                slope_risk * 0.20 +
                moisture_risk * 0.15 +
                drainage_risk * 0.15
            )
            
            return {
                'risk_score': min(100, risk_score),
                'confidence': 82.0,
                'contributing_factors': self._get_flood_factors(features),
                'recommendations': self._get_flood_recommendations(risk_score),
                'return_period': max(5, int(100 - risk_score)),
                'max_depth': max(0.1, risk_score / 50),
                'affected_area': max(1, risk_score / 8),
                'drainage_capacity': max(20, 100 - risk_score)
            }
            
        except Exception as e:
            logger.error(f"Error in flood prediction: {e}")
            return self._get_default_flood_prediction()
    
    async def predict_landslide_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict landslide susceptibility
        """
        try:
            slope_angle = features.get('slope_angle', 15.0)
            precipitation = features.get('precipitation', 100.0)
            soil_type = features.get('soil_type', 'clay')
            fault_distance = features.get('fault_distance', 5.0)
            
            # Simple landslide risk calculation
            slope_risk = min(100, slope_angle * 3)
            precip_risk = min(100, precipitation * 0.8)
            soil_risk = 60 if soil_type == 'clay' else 40
            fault_risk = max(0, (10 - fault_distance) * 10)
            
            risk_score = (
                slope_risk * 0.35 +
                precip_risk * 0.25 +
                soil_risk * 0.25 +
                fault_risk * 0.15
            )
            
            return {
                'risk_score': min(100, risk_score),
                'confidence': 79.0,
                'contributing_factors': self._get_landslide_factors(features),
                'recommendations': self._get_landslide_recommendations(risk_score),
                'slope_stability': max(20, 100 - slope_risk),
                'soil_saturation': min(100, precipitation * 0.6),
                'trigger_threshold': max(50, 150 - risk_score)
            }
            
        except Exception as e:
            logger.error(f"Error in landslide prediction: {e}")
            return self._get_default_landslide_prediction()
    
    def _get_wildfire_factors(self, features: Dict) -> List[str]:
        """Get contributing factors for wildfire risk"""
        factors = []
        if features.get('lst', 25) > 30:
            factors.append("High temperature")
        if features.get('humidity', 60) < 40:
            factors.append("Low humidity")
        if features.get('wind_speed', 5) > 10:
            factors.append("Strong winds")
        if features.get('ndvi', 0.6) < 0.4:
            factors.append("Dry vegetation")
        return factors or ["Moderate conditions"]
    
    def _get_wildfire_recommendations(self, risk_score: float) -> List[str]:
        """Get recommendations based on wildfire risk"""
        if risk_score > 75:
            return ["Immediate fire watch", "Evacuation planning", "Resource pre-positioning"]
        elif risk_score > 50:
            return ["Enhanced monitoring", "Public warnings", "Fire crew readiness"]
        else:
            return ["Routine monitoring", "Maintain preparedness"]
    
    def _get_flood_factors(self, features: Dict) -> List[str]:
        """Get contributing factors for flood risk"""
        factors = []
        if features.get('precipitation', 50) > 75:
            factors.append("Heavy rainfall")
        if features.get('elevation', 100) < 50:
            factors.append("Low elevation")
        if features.get('slope', 5) < 3:
            factors.append("Flat terrain")
        return factors or ["Moderate conditions"]
    
    def _get_flood_recommendations(self, risk_score: float) -> List[str]:
        """Get recommendations based on flood risk"""
        if risk_score > 75:
            return ["Flood warnings", "Evacuation routes", "Emergency response"]
        elif risk_score > 50:
            return ["Monitor water levels", "Prepare drainage", "Public alerts"]
        else:
            return ["Routine monitoring", "Maintain drainage"]
    
    def _get_landslide_factors(self, features: Dict) -> List[str]:
        """Get contributing factors for landslide risk"""
        factors = []
        if features.get('slope_angle', 15) > 25:
            factors.append("Steep slopes")
        if features.get('precipitation', 100) > 150:
            factors.append("Heavy rainfall")
        if features.get('soil_type') == 'clay':
            factors.append("Clay soil")
        return factors or ["Moderate conditions"]
    
    def _get_landslide_recommendations(self, risk_score: float) -> List[str]:
        """Get recommendations based on landslide risk"""
        if risk_score > 75:
            return ["Slope monitoring", "Evacuation planning", "Drainage improvement"]
        elif risk_score > 50:
            return ["Enhanced monitoring", "Slope stabilization", "Early warning"]
        else:
            return ["Routine inspection", "Maintain drainage"]
    
    def _get_default_wildfire_prediction(self) -> Dict[str, Any]:
        """Default wildfire prediction when model fails"""
        return {
            'risk_score': 50.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable"],
            'recommendations': ["Use alternative assessment"],
            'ignition_probability': 0.3,
            'spread_rate': 1.0,
            'fuel_moisture': 25.0,
            'fire_weather_index': 40.0
        }
    
    def _get_default_flood_prediction(self) -> Dict[str, Any]:
        """Default flood prediction when model fails"""
        return {
            'risk_score': 40.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable"],
            'recommendations': ["Use alternative assessment"],
            'return_period': 50,
            'max_depth': 0.8,
            'affected_area': 5.0,
            'drainage_capacity': 60.0
        }
    
    def _get_default_landslide_prediction(self) -> Dict[str, Any]:
        """Default landslide prediction when model fails"""
        return {
            'risk_score': 45.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable"],
            'recommendations': ["Use alternative assessment"],
            'slope_stability': 55.0,
            'soil_saturation': 50.0,
            'trigger_threshold': 100.0
        }

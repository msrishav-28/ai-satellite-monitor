"""
Machine Learning models service for hazard prediction
Loads and runs trained ML models for various environmental hazards
"""

import logging
import asyncio
import numpy as np
from typing import Dict, Any, List

from app.ml.model_manager import model_manager
from app.core.config import settings

logger = logging.getLogger(__name__)


class MLModelService:
    """Service for running ML prediction models"""

    def __init__(self):
        self.model_manager = model_manager
        self.models_loaded = False
    
    async def load_models(self):
        """Load all trained ML models"""
        try:
            # Initialize all models through model manager
            model_status = await self.model_manager.initialize_models()

            self.models_loaded = any(model_status.values())
            logger.info(f"ML models loaded via model manager: {model_status}")

        except Exception as e:
            logger.error(f"Error loading ML models: {e}")
            self.models_loaded = False
    
    async def predict_wildfire_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict wildfire ignition and spread risk using advanced ML model

        Features:
        - land_surface_temperature: Land Surface Temperature
        - ndvi: Vegetation index
        - wind_speed: Wind speed
        - humidity: Relative humidity
        - slope: Terrain slope
        - fuel_load: Vegetation fuel load
        """
        if settings.FORCE_MOCK_MODELS:
            return self._get_default_wildfire_prediction()
        try:
            # Use the model manager for prediction
            prediction = await self.model_manager.predict_wildfire_risk(features)
            return prediction

        except Exception as e:
            logger.error(f"Error in wildfire prediction: {e}")
            return self._get_default_wildfire_prediction()
    
    async def predict_flood_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict flood susceptibility using advanced ML model

        Features:
        - precipitation: Recent precipitation
        - elevation: Mean elevation
        - slope: Terrain slope
        - land_cover: Land cover type
        - soil_moisture: Soil moisture content
        - drainage_density: Drainage network density
        """
        if settings.FORCE_MOCK_MODELS:
            return self._get_default_flood_prediction()
        try:
            # Use the model manager for prediction
            prediction = await self.model_manager.predict_flood_risk(features)
            return prediction

        except Exception as e:
            logger.error(f"Error in flood prediction: {e}")
            return self._get_default_flood_prediction()

    async def predict_landslide_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict landslide susceptibility using advanced ML model

        Features:
        - elevation: Elevation above sea level
        - slope: Terrain slope angle
        - aspect: Slope aspect
        - geology_type: Geological formation
        - soil_clay_content: Clay content in soil
        - precipitation_annual: Annual precipitation
        """
        if settings.FORCE_MOCK_MODELS:
            return self._get_default_landslide_prediction()
        try:
            # Use the model manager for prediction
            prediction = await self.model_manager.predict_landslide_risk(features)
            return prediction

        except Exception as e:
            logger.error(f"Error in landslide prediction: {e}")
            return self._get_default_landslide_prediction()

    async def predict_all_hazards(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run all hazard prediction models and return comprehensive analysis
        """
        if settings.FORCE_MOCK_MODELS:
            return self._get_default_multi_hazard_prediction()
        try:
            # Use the model manager for multi-hazard prediction
            prediction = await self.model_manager.predict_all_hazards(features)
            return prediction

        except Exception as e:
            logger.error(f"Error in multi-hazard prediction: {e}")
            return self._get_default_multi_hazard_prediction()

    def _get_default_wildfire_prediction(self) -> Dict[str, Any]:
        """Default wildfire prediction when model fails"""
        return {
            'risk_score': 50.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable - using default assessment"],
            'recommendations': ["Use alternative wildfire assessment methods"],
            'ignition_probability': 0.3,
            'spread_rate': 1.0,
            'fuel_moisture': 25.0,
            'fire_weather_index': 40.0,
            'model_type': 'wildfire',
            'model_status': 'fallback'
        }

    def _get_default_flood_prediction(self) -> Dict[str, Any]:
        """Default flood prediction when model fails"""
        return {
            'risk_score': 40.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable - using default assessment"],
            'recommendations': ["Use alternative flood assessment methods"],
            'return_period': 50,
            'max_depth': 0.8,
            'affected_area': 5.0,
            'drainage_capacity': 60.0,
            'model_type': 'flood',
            'model_status': 'fallback'
        }

    def _get_default_landslide_prediction(self) -> Dict[str, Any]:
        """Default landslide prediction when model fails"""
        return {
            'risk_score': 45.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable - using default assessment"],
            'recommendations': ["Use alternative landslide assessment methods"],
            'stability_factor': 1.5,
            'trigger_threshold': 75.0,
            'affected_area': 2.0,
            'model_type': 'landslide',
            'model_status': 'fallback'
        }

    def _get_default_multi_hazard_prediction(self) -> Dict[str, Any]:
        """Default multi-hazard prediction when model fails"""
        return {
            'wildfire': self._get_default_wildfire_prediction(),
            'flood': self._get_default_flood_prediction(),
            'landslide': self._get_default_landslide_prediction(),
            'overall_assessment': {
                'overall_risk_score': 45.0,
                'risk_level': 'moderate',
                'priority_hazards': [],
                'hazard_scores': {'wildfire': 50.0, 'flood': 40.0, 'landslide': 45.0},
                'recommendations': ['System error - manual assessment required'],
                'assessment_confidence': 60.0
            },
            'prediction_metadata': {
                'total_predictions': 0,
                'models_loaded': 0,
                'error': 'Model manager unavailable',
                'timestamp': '2024-01-01T00:00:00Z'
            }
        }
    
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

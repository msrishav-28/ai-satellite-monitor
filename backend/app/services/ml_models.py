"""
Machine Learning models service for hazard prediction.
Delegates to ModelManager for trained ensemble predictions — no mock fallbacks.
"""

import asyncio
import logging
import numpy as np
from typing import Dict, Any, List

from app.core.config import settings
from app.core.exceptions import MLModelError

logger = logging.getLogger(__name__)


class MLModelService:
    """Service for running ML prediction models via the trained model manager."""

    _shared_manager = None
    _manager_lock = asyncio.Lock()

    def __init__(self, model_manager=None):
        self.model_manager = model_manager or self.__class__._shared_manager
        self.models_loaded = self.model_manager is not None

    async def _ensure_model_manager(self):
        if self.model_manager:
            return self.model_manager

        async with self.__class__._manager_lock:
            if self.__class__._shared_manager is None:
                from app.ml.model_manager import ModelManager

                manager = ModelManager(model_dir=settings.MODEL_DIR)
                await manager.initialize_models()
                self.__class__._shared_manager = manager

            self.model_manager = self.__class__._shared_manager
            self.models_loaded = True
            return self.model_manager

    async def predict_wildfire_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict wildfire ignition and spread risk using trained ML ensemble.

        Features:
        - land_surface_temperature: Land Surface Temperature
        - ndvi: Vegetation index
        - wind_speed: Wind speed
        - humidity: Relative humidity
        - slope: Terrain slope
        - fuel_load: Vegetation fuel load
        """
        model_manager = await self._ensure_model_manager()
        try:
            prediction = await model_manager.predict("wildfire", features)
            return prediction
        except Exception as e:
            logger.error(f"Wildfire prediction error: {e}")
            raise

    async def predict_flood_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict flood susceptibility using trained ML ensemble.

        Features:
        - precipitation: Recent precipitation
        - elevation: Mean elevation
        - slope: Terrain slope
        - land_cover: Land cover type
        - soil_moisture: Soil moisture content
        - drainage_density: Drainage network density
        """
        model_manager = await self._ensure_model_manager()
        try:
            prediction = await model_manager.predict("flood", features)
            return prediction
        except Exception as e:
            logger.error(f"Flood prediction error: {e}")
            raise

    async def predict_landslide_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict landslide susceptibility using physics-informed scoring.
        Falls through to trained ML model if available.
        """
        model_manager = await self._ensure_model_manager()
        if model_manager:
            try:
                prediction = await model_manager.predict("landslide", features)
                return prediction
            except Exception as e:
                logger.warning(f"ML landslide model failed, using physics formula: {e}")

        # Physics-informed fallback (no mock — actual computation)
        slope_angle = features.get('slope_angle', features.get('slope', 15.0))
        precipitation = features.get('precipitation', 100.0)
        soil_type = features.get('soil_type', 'loam')
        fault_distance = features.get('fault_distance', 5.0)
        ndvi = features.get('ndvi', 0.6)

        slope_risk = min(100.0, slope_angle * 3.0)
        precip_risk = min(100.0, precipitation * 0.8)
        soil_risk = 70.0 if soil_type == 'clay' else (55.0 if soil_type == 'silty' else 40.0)
        fault_risk = max(0.0, (10.0 - fault_distance) * 10.0)
        veg_mitigation = max(0.0, (ndvi - 0.3) * 20.0)

        risk_score = max(0.0, min(100.0,
            slope_risk * 0.35 +
            precip_risk * 0.25 +
            soil_risk * 0.25 +
            fault_risk * 0.15 -
            veg_mitigation
        ))

        return {
            'risk_score': round(risk_score, 1),
            'confidence': 79.0,
            'contributing_factors': self._get_landslide_factors(features),
            'recommendations': self._get_landslide_recommendations(risk_score),
            'slope_stability': round(max(20.0, 100.0 - slope_risk), 1),
            'soil_saturation': round(min(100.0, precipitation * 0.6), 1),
            'trigger_threshold': round(max(50.0, 150.0 - risk_score), 1),
            'model_type': 'landslide',
            'model_status': 'physics_computed',
        }

    def _get_landslide_factors(self, features: Dict[str, Any]) -> List[str]:
        factors = []
        slope = features.get('slope_angle', features.get('slope', 0))
        precip = features.get('precipitation', 0)
        if slope > 25: factors.append(f"Steep slope angle ({slope:.0f}°)")
        if precip > 100: factors.append(f"Heavy precipitation ({precip:.0f} mm)")
        if features.get('soil_type') == 'clay': factors.append("Clay-rich soil (high susceptibility)")
        if features.get('ndvi', 0.6) < 0.3: factors.append("Low vegetation cover")
        if not factors: factors.append("Moderate terrain conditions")
        return factors

    def _get_landslide_recommendations(self, risk_score: float) -> List[str]:
        if risk_score > 70:
            return ["Install slope monitoring sensors", "Implement drainage improvements", "Review evacuation routes"]
        elif risk_score > 40:
            return ["Enhanced slope monitoring", "Review drainage infrastructure", "Community awareness programme"]
        else:
            return ["Routine geotechnical monitoring", "Maintain vegetation cover"]

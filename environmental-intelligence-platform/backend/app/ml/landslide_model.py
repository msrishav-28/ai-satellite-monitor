"""
Advanced Landslide Susceptibility Model
Uses geotechnical analysis and machine learning for landslide risk assessment
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
import logging
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

logger = logging.getLogger(__name__)


class LandslideRiskModel:
    """
    Advanced landslide susceptibility model
    
    Features used:
    - Digital Elevation Model (DEM) data
    - Slope angle and aspect
    - Curvature (plan and profile)
    - Topographic Wetness Index (TWI)
    - Stream Power Index (SPI)
    - Geology and soil type
    - Land use/land cover
    - Precipitation data
    - Distance to faults and roads
    - Vegetation density (NDVI)
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or "models/landslide_model.pkl"
        self.scaler_path = model_path.replace('.pkl', '_scaler.pkl') if model_path else "models/landslide_scaler.pkl"
        
        # Model components
        self.rf_model = None
        self.gb_model = None
        self.scaler = None
        self.feature_names = [
            'elevation',
            'slope_angle',
            'slope_aspect_sin',
            'slope_aspect_cos',
            'plan_curvature',
            'profile_curvature',
            'topographic_wetness_index',
            'stream_power_index',
            'geology_sedimentary',
            'geology_igneous',
            'geology_metamorphic',
            'soil_clay_content',
            'soil_sand_content',
            'land_cover_forest',
            'land_cover_urban',
            'land_cover_agriculture',
            'precipitation_annual',
            'precipitation_intensity',
            'distance_to_faults',
            'distance_to_roads',
            'ndvi',
            'drainage_density',
            'relief_ratio',
            'slope_length'
        ]
        
        self.is_trained = False
    
    def _prepare_features(self, raw_features: Dict[str, Any]) -> np.ndarray:
        """Prepare and engineer features for model input"""
        try:
            # Extract base features
            elevation = raw_features.get('elevation', 500.0)
            slope_angle = raw_features.get('slope', 15.0)
            slope_aspect = raw_features.get('aspect', 180.0)
            precipitation = raw_features.get('precipitation_annual', 1000.0)
            ndvi = raw_features.get('ndvi', 0.6)
            
            # Derived topographic features
            plan_curvature = self._calculate_plan_curvature(raw_features)
            profile_curvature = self._calculate_profile_curvature(raw_features)
            twi = self._calculate_topographic_wetness_index(slope_angle, raw_features)
            spi = self._calculate_stream_power_index(slope_angle, raw_features)
            
            # Geology features (one-hot encoded)
            geology_type = raw_features.get('geology_type', 'sedimentary')
            geology_sedimentary = 1.0 if geology_type == 'sedimentary' else 0.0
            geology_igneous = 1.0 if geology_type == 'igneous' else 0.0
            geology_metamorphic = 1.0 if geology_type == 'metamorphic' else 0.0
            
            # Soil properties
            soil_clay_content = raw_features.get('soil_clay_content', 25.0)
            soil_sand_content = raw_features.get('soil_sand_content', 35.0)
            
            # Land cover features
            land_cover = raw_features.get('land_cover', 'mixed')
            land_cover_forest = 1.0 if land_cover == 'forest' else 0.0
            land_cover_urban = 1.0 if land_cover == 'urban' else 0.0
            land_cover_agriculture = 1.0 if land_cover == 'agriculture' else 0.0
            
            # Precipitation features
            precipitation_intensity = raw_features.get('precipitation_intensity', 50.0)
            
            # Distance features
            distance_to_faults = raw_features.get('distance_to_faults', 10.0)
            distance_to_roads = raw_features.get('distance_to_roads', 2.0)
            
            # Additional topographic indices
            drainage_density = raw_features.get('drainage_density', 0.5)
            relief_ratio = self._calculate_relief_ratio(elevation, raw_features)
            slope_length = self._calculate_slope_length(slope_angle, raw_features)
            
            # Trigonometric encoding for aspect
            aspect_rad = np.radians(slope_aspect)
            
            # Assemble feature vector
            features = np.array([
                elevation,
                slope_angle,
                np.sin(aspect_rad),
                np.cos(aspect_rad),
                plan_curvature,
                profile_curvature,
                twi,
                spi,
                geology_sedimentary,
                geology_igneous,
                geology_metamorphic,
                soil_clay_content,
                soil_sand_content,
                land_cover_forest,
                land_cover_urban,
                land_cover_agriculture,
                precipitation,
                precipitation_intensity,
                distance_to_faults,
                distance_to_roads,
                ndvi,
                drainage_density,
                relief_ratio,
                slope_length
            ]).reshape(1, -1)
            
            return features
            
        except Exception as e:
            logger.error(f"Error preparing landslide features: {e}")
            return np.zeros((1, len(self.feature_names)))
    
    def _calculate_plan_curvature(self, features: Dict[str, Any]) -> float:
        """Calculate plan curvature (horizontal curvature)"""
        # Simplified calculation based on slope and aspect variation
        slope = features.get('slope', 15.0)
        aspect_variation = features.get('aspect_variation', 10.0)
        return (aspect_variation / 180.0) * (slope / 45.0) * 0.1
    
    def _calculate_profile_curvature(self, features: Dict[str, Any]) -> float:
        """Calculate profile curvature (vertical curvature)"""
        # Simplified calculation based on elevation change
        elevation = features.get('elevation', 500.0)
        slope = features.get('slope', 15.0)
        return (slope / 45.0) * (elevation / 1000.0) * 0.05
    
    def _calculate_topographic_wetness_index(self, slope_angle: float, features: Dict[str, Any]) -> float:
        """Calculate Topographic Wetness Index"""
        # TWI = ln(a / tan(slope))
        # where a is the upslope contributing area per unit width
        contributing_area = features.get('contributing_area', 100.0)
        slope_rad = np.radians(max(0.1, slope_angle))  # Avoid division by zero
        twi = np.log(contributing_area / np.tan(slope_rad))
        return max(0, min(20, twi))
    
    def _calculate_stream_power_index(self, slope_angle: float, features: Dict[str, Any]) -> float:
        """Calculate Stream Power Index"""
        # SPI = A * tan(slope)
        contributing_area = features.get('contributing_area', 100.0)
        slope_rad = np.radians(slope_angle)
        spi = contributing_area * np.tan(slope_rad)
        return min(1000, spi)
    
    def _calculate_relief_ratio(self, elevation: float, features: Dict[str, Any]) -> float:
        """Calculate relief ratio"""
        max_elevation = features.get('max_elevation', elevation + 100)
        min_elevation = features.get('min_elevation', elevation - 100)
        basin_length = features.get('basin_length', 1000.0)
        
        relief = max_elevation - min_elevation
        return relief / basin_length if basin_length > 0 else 0.1
    
    def _calculate_slope_length(self, slope_angle: float, features: Dict[str, Any]) -> float:
        """Calculate slope length factor"""
        # Simplified LS factor calculation
        slope_length = features.get('slope_length', 100.0)
        slope_steepness = np.sin(np.radians(slope_angle))
        return slope_length * slope_steepness
    
    def load_model(self) -> bool:
        """Load trained model from disk"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                model_data = joblib.load(self.model_path)
                self.rf_model = model_data['rf_model']
                self.gb_model = model_data['gb_model']
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info("Landslide model loaded successfully")
                return True
            else:
                logger.warning("Landslide model files not found, using fallback predictions")
                return False
        except Exception as e:
            logger.error(f"Error loading landslide model: {e}")
            return False
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict landslide susceptibility for given features"""
        try:
            # Prepare features
            X = self._prepare_features(features)
            
            if self.is_trained and self.rf_model and self.gb_model and self.scaler:
                # Scale features
                X_scaled = self.scaler.transform(X)
                
                # Get predictions from both models
                rf_pred = self.rf_model.predict_proba(X_scaled)[0][1] * 100  # Probability of landslide
                gb_pred = self.gb_model.predict_proba(X_scaled)[0][1] * 100
                
                # Ensemble prediction
                risk_score = (rf_pred * 0.6 + gb_pred * 0.4)
                risk_score = np.clip(risk_score, 0, 100)
                
                # Calculate confidence
                agreement = 1 - abs(rf_pred - gb_pred) / 100
                confidence = min(95, max(65, agreement * 100))
                
                # Get contributing factors
                if hasattr(self.rf_model, 'feature_importances_'):
                    feature_importance = self.rf_model.feature_importances_
                    top_factors = self._get_contributing_factors(X[0], feature_importance)
                else:
                    top_factors = ["Model-based assessment"]
                
            else:
                # Fallback prediction
                risk_score, confidence, top_factors = self._fallback_prediction(features)
            
            # Calculate derived metrics
            stability_factor = self._calculate_stability_factor(features, risk_score)
            trigger_threshold = self._calculate_trigger_threshold(features)
            affected_area = self._calculate_affected_area(risk_score, features)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(risk_score, features)
            
            return {
                'risk_score': float(risk_score),
                'confidence': float(confidence),
                'contributing_factors': top_factors,
                'recommendations': recommendations,
                'stability_factor': float(stability_factor),
                'trigger_threshold': float(trigger_threshold),
                'affected_area': float(affected_area)
            }
            
        except Exception as e:
            logger.error(f"Error in landslide prediction: {e}")
            return self._get_default_prediction()
    
    def _fallback_prediction(self, features: Dict[str, Any]) -> Tuple[float, float, List[str]]:
        """Rule-based fallback prediction"""
        slope = features.get('slope', 15.0)
        elevation = features.get('elevation', 500.0)
        precipitation = features.get('precipitation_annual', 1000.0)
        geology = features.get('geology_type', 'sedimentary')
        soil_clay = features.get('soil_clay_content', 25.0)
        
        # Rule-based risk calculation
        slope_risk = min(100, max(0, (slope - 10) * 4))
        elevation_risk = min(50, max(0, (elevation - 200) / 20))
        precip_risk = min(100, max(0, (precipitation - 500) / 20))
        
        # Geology risk factors
        geology_risk = 0
        if geology == 'sedimentary':
            geology_risk = 40
        elif geology == 'metamorphic':
            geology_risk = 60
        elif geology == 'igneous':
            geology_risk = 20
        
        # Soil risk
        soil_risk = min(50, soil_clay * 1.5)
        
        risk_score = (
            slope_risk * 0.35 +
            geology_risk * 0.25 +
            precip_risk * 0.20 +
            soil_risk * 0.15 +
            elevation_risk * 0.05
        )
        
        confidence = 70.0
        
        # Contributing factors
        factors = []
        if slope_risk > 40:
            factors.append("Steep slopes")
        if geology_risk > 30:
            factors.append("Unstable geology")
        if precip_risk > 40:
            factors.append("High precipitation")
        if soil_risk > 30:
            factors.append("Clay-rich soils")
        
        return risk_score, confidence, factors or ["Moderate conditions"]
    
    def _get_contributing_factors(self, features: np.ndarray, importance: np.ndarray) -> List[str]:
        """Get top contributing factors"""
        factor_map = {
            'slope_angle': 'Steep slopes',
            'geology_sedimentary': 'Sedimentary geology',
            'precipitation_annual': 'High precipitation',
            'soil_clay_content': 'Clay-rich soils',
            'distance_to_faults': 'Proximity to faults',
            'topographic_wetness_index': 'Water accumulation',
            'plan_curvature': 'Slope curvature',
            'distance_to_roads': 'Road cuts'
        }
        
        top_indices = np.argsort(importance)[-3:][::-1]
        factors = []
        
        for idx in top_indices:
            if idx < len(self.feature_names):
                feature_name = self.feature_names[idx]
                if feature_name in factor_map:
                    factors.append(factor_map[feature_name])
        
        return factors or ["Multiple geological factors"]
    
    def _calculate_stability_factor(self, features: Dict[str, Any], risk_score: float) -> float:
        """Calculate slope stability factor"""
        # Factor of Safety approximation
        slope = features.get('slope', 15.0)
        soil_cohesion = features.get('soil_cohesion', 20.0)  # kPa
        friction_angle = features.get('friction_angle', 30.0)  # degrees
        
        # Simplified infinite slope stability
        slope_rad = np.radians(slope)
        friction_rad = np.radians(friction_angle)
        
        # Basic factor of safety calculation
        fs = (soil_cohesion + np.cos(slope_rad) * np.tan(friction_rad)) / np.sin(slope_rad)
        
        # Adjust based on risk score
        fs_adjusted = fs * (1 - risk_score / 200)
        
        return max(0.5, min(3.0, fs_adjusted))
    
    def _calculate_trigger_threshold(self, features: Dict[str, Any]) -> float:
        """Calculate precipitation threshold for landslide triggering"""
        slope = features.get('slope', 15.0)
        soil_permeability = features.get('soil_permeability', 10.0)
        
        # Empirical threshold based on slope and soil properties
        base_threshold = 50.0  # mm/day
        slope_factor = slope / 30.0
        permeability_factor = max(0.5, soil_permeability / 20.0)
        
        threshold = base_threshold * slope_factor / permeability_factor
        return max(20.0, min(200.0, threshold))
    
    def _calculate_affected_area(self, risk_score: float, features: Dict[str, Any]) -> float:
        """Calculate potentially affected area in hectares"""
        slope_length = features.get('slope_length', 100.0)
        slope_width = features.get('slope_width', 50.0)
        
        # Base affected area
        base_area = (slope_length * slope_width) / 10000  # Convert to hectares
        
        # Scale by risk score
        risk_factor = risk_score / 100
        affected_area = base_area * risk_factor
        
        return max(0.1, min(100.0, affected_area))
    
    def _generate_recommendations(self, risk_score: float, features: Dict[str, Any]) -> List[str]:
        """Generate landslide mitigation recommendations"""
        recommendations = []
        
        if risk_score > 75:
            recommendations.extend([
                "Immediate evacuation of high-risk areas",
                "Install early warning systems",
                "Implement emergency response protocols",
                "Restrict access to unstable slopes"
            ])
        elif risk_score > 50:
            recommendations.extend([
                "Enhanced slope monitoring",
                "Install drainage systems",
                "Vegetation stabilization measures",
                "Regular geotechnical assessments"
            ])
        elif risk_score > 25:
            recommendations.extend([
                "Routine slope inspections",
                "Maintain existing drainage",
                "Monitor precipitation levels"
            ])
        else:
            recommendations.append("Continue standard slope maintenance")
        
        # Specific recommendations based on conditions
        slope = features.get('slope', 15.0)
        precipitation = features.get('precipitation_annual', 1000.0)
        
        if slope > 30:
            recommendations.append("Consider slope angle reduction or terracing")
        if precipitation > 1500:
            recommendations.append("Improve surface and subsurface drainage")
        
        return recommendations
    
    def _get_default_prediction(self) -> Dict[str, Any]:
        """Return default prediction when all else fails"""
        return {
            'risk_score': 45.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable - using default assessment"],
            'recommendations': ["Use alternative landslide assessment methods"],
            'stability_factor': 1.5,
            'trigger_threshold': 75.0,
            'affected_area': 2.0
        }

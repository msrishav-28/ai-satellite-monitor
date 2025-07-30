"""
Advanced Flood Risk Prediction Model
Uses hydrological modeling and machine learning for flood susceptibility assessment
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
import logging
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

logger = logging.getLogger(__name__)


class FloodRiskModel:
    """
    Advanced flood risk prediction model
    
    Features used:
    - Precipitation data (current and historical)
    - Digital Elevation Model (DEM) data
    - Slope and aspect
    - Land use/land cover
    - Soil type and permeability
    - Drainage network density
    - River proximity
    - Urbanization level
    - Soil moisture content
    - Antecedent precipitation
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or "models/flood_model.pkl"
        self.scaler_path = model_path.replace('.pkl', '_scaler.pkl') if model_path else "models/flood_scaler.pkl"
        
        # Model components
        self.rf_model = None
        self.gb_model = None
        self.scaler = None
        self.feature_names = [
            'precipitation_24h',
            'precipitation_7day',
            'precipitation_30day',
            'elevation',
            'slope',
            'aspect_sin',
            'aspect_cos',
            'land_cover_urban',
            'land_cover_forest',
            'land_cover_agriculture',
            'soil_permeability',
            'drainage_density',
            'river_distance',
            'stream_order',
            'soil_moisture',
            'antecedent_precipitation_index',
            'urbanization_ratio',
            'impervious_surface_ratio',
            'basin_area',
            'flow_accumulation'
        ]
        
        self.is_trained = False
    
    def _prepare_features(self, raw_features: Dict[str, Any]) -> np.ndarray:
        """Prepare and engineer features for model input"""
        try:
            # Extract base features
            precip_24h = raw_features.get('precipitation_24h', 10.0)
            precip_7day = raw_features.get('precipitation_7day', 25.0)
            precip_30day = raw_features.get('precipitation_30day', 75.0)
            elevation = raw_features.get('elevation', 100.0)
            slope = raw_features.get('slope', 5.0)
            aspect = raw_features.get('aspect', 180.0)
            soil_moisture = raw_features.get('soil_moisture', 0.3)
            drainage_density = raw_features.get('drainage_density', 0.5)
            river_distance = raw_features.get('river_distance', 2.0)
            
            # Land cover features (one-hot encoded)
            land_cover = raw_features.get('land_cover', 'mixed')
            land_cover_urban = 1.0 if land_cover == 'urban' else 0.0
            land_cover_forest = 1.0 if land_cover == 'forest' else 0.0
            land_cover_agriculture = 1.0 if land_cover == 'agriculture' else 0.0
            
            # Derived features
            soil_permeability = self._estimate_soil_permeability(raw_features)
            stream_order = self._estimate_stream_order(river_distance, drainage_density)
            antecedent_precip_index = self._calculate_api(precip_7day, precip_30day)
            urbanization_ratio = raw_features.get('urban_percentage', 15.0) / 100.0
            impervious_surface_ratio = urbanization_ratio * 0.7  # Estimate
            basin_area = raw_features.get('basin_area', 50.0)  # km²
            flow_accumulation = self._estimate_flow_accumulation(elevation, slope, basin_area)
            
            # Trigonometric encoding for aspect
            aspect_rad = np.radians(aspect)
            
            # Assemble feature vector
            features = np.array([
                precip_24h,
                precip_7day,
                precip_30day,
                elevation,
                slope,
                np.sin(aspect_rad),
                np.cos(aspect_rad),
                land_cover_urban,
                land_cover_forest,
                land_cover_agriculture,
                soil_permeability,
                drainage_density,
                river_distance,
                stream_order,
                soil_moisture,
                antecedent_precip_index,
                urbanization_ratio,
                impervious_surface_ratio,
                basin_area,
                flow_accumulation
            ]).reshape(1, -1)
            
            return features
            
        except Exception as e:
            logger.error(f"Error preparing flood features: {e}")
            return np.zeros((1, len(self.feature_names)))
    
    def _estimate_soil_permeability(self, features: Dict[str, Any]) -> float:
        """Estimate soil permeability based on soil type and land cover"""
        soil_type = features.get('soil_type', 'loam')
        land_cover = features.get('land_cover', 'mixed')
        
        # Base permeability by soil type (mm/hr)
        permeability_map = {
            'sand': 50.0,
            'sandy_loam': 25.0,
            'loam': 15.0,
            'clay_loam': 8.0,
            'clay': 3.0,
            'rock': 1.0
        }
        
        base_perm = permeability_map.get(soil_type, 15.0)
        
        # Adjust for land cover
        if land_cover == 'urban':
            base_perm *= 0.3  # Reduced by impervious surfaces
        elif land_cover == 'forest':
            base_perm *= 1.5  # Increased by organic matter
        
        return base_perm
    
    def _estimate_stream_order(self, river_distance: float, drainage_density: float) -> int:
        """Estimate stream order based on distance and drainage density"""
        if river_distance < 0.5:
            return min(6, max(3, int(drainage_density * 10)))
        elif river_distance < 2.0:
            return min(4, max(2, int(drainage_density * 8)))
        else:
            return min(2, max(1, int(drainage_density * 5)))
    
    def _calculate_api(self, precip_7day: float, precip_30day: float) -> float:
        """Calculate Antecedent Precipitation Index"""
        # Simplified API calculation
        api = precip_7day * 0.7 + (precip_30day - precip_7day) * 0.3
        return api
    
    def _estimate_flow_accumulation(self, elevation: float, slope: float, basin_area: float) -> float:
        """Estimate flow accumulation potential"""
        # Higher values for lower elevation, lower slope, larger basin
        flow_acc = (1000 - elevation) / 1000 * (10 - min(slope, 10)) / 10 * np.log(basin_area + 1)
        return max(0, flow_acc)
    
    def load_model(self) -> bool:
        """Load trained model from disk"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                model_data = joblib.load(self.model_path)
                self.rf_model = model_data['rf_model']
                self.gb_model = model_data['gb_model']
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info("Flood model loaded successfully")
                return True
            else:
                logger.warning("Flood model files not found, using fallback predictions")
                return False
        except Exception as e:
            logger.error(f"Error loading flood model: {e}")
            return False
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict flood risk for given features"""
        try:
            # Prepare features
            X = self._prepare_features(features)
            
            if self.is_trained and self.rf_model and self.gb_model and self.scaler:
                # Scale features
                X_scaled = self.scaler.transform(X)
                
                # Get predictions from both models
                rf_pred = self.rf_model.predict(X_scaled)[0]
                gb_pred = self.gb_model.predict(X_scaled)[0]
                
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
            return_period = self._calculate_return_period(risk_score)
            max_depth = self._calculate_max_depth(risk_score, features)
            affected_area = self._calculate_affected_area(risk_score, features)
            drainage_capacity = self._calculate_drainage_capacity(features)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(risk_score, features)
            
            return {
                'risk_score': float(risk_score),
                'confidence': float(confidence),
                'contributing_factors': top_factors,
                'recommendations': recommendations,
                'return_period': int(return_period),
                'max_depth': float(max_depth),
                'affected_area': float(affected_area),
                'drainage_capacity': float(drainage_capacity)
            }
            
        except Exception as e:
            logger.error(f"Error in flood prediction: {e}")
            return self._get_default_prediction()
    
    def _fallback_prediction(self, features: Dict[str, Any]) -> Tuple[float, float, List[str]]:
        """Rule-based fallback prediction"""
        precip_24h = features.get('precipitation_24h', 10.0)
        elevation = features.get('elevation', 100.0)
        slope = features.get('slope', 5.0)
        drainage_density = features.get('drainage_density', 0.5)
        urbanization = features.get('urban_percentage', 15.0)
        
        # Rule-based risk calculation
        precip_risk = min(100, precip_24h * 3)
        elevation_risk = max(0, (200 - elevation) / 2)
        slope_risk = max(0, (10 - slope) * 8)
        drainage_risk = max(0, (0.3 - drainage_density) * 200)
        urban_risk = urbanization * 1.5
        
        risk_score = (
            precip_risk * 0.35 +
            elevation_risk * 0.25 +
            slope_risk * 0.20 +
            drainage_risk * 0.15 +
            urban_risk * 0.05
        )
        
        confidence = 70.0
        
        # Contributing factors
        factors = []
        if precip_risk > 50:
            factors.append("Heavy precipitation")
        if elevation_risk > 40:
            factors.append("Low elevation")
        if slope_risk > 30:
            factors.append("Flat terrain")
        if drainage_risk > 40:
            factors.append("Poor drainage")
        if urban_risk > 20:
            factors.append("Urban runoff")
        
        return risk_score, confidence, factors or ["Moderate conditions"]
    
    def _get_contributing_factors(self, features: np.ndarray, importance: np.ndarray) -> List[str]:
        """Get top contributing factors"""
        factor_map = {
            'precipitation_24h': 'Heavy rainfall',
            'elevation': 'Low elevation',
            'slope': 'Flat terrain',
            'drainage_density': 'Poor drainage',
            'land_cover_urban': 'Urban runoff',
            'soil_permeability': 'Low soil permeability',
            'river_distance': 'River proximity',
            'antecedent_precipitation_index': 'Saturated conditions'
        }
        
        top_indices = np.argsort(importance)[-3:][::-1]
        factors = []
        
        for idx in top_indices:
            if idx < len(self.feature_names):
                feature_name = self.feature_names[idx]
                if feature_name in factor_map:
                    factors.append(factor_map[feature_name])
        
        return factors or ["Multiple hydrological factors"]
    
    def _calculate_return_period(self, risk_score: float) -> int:
        """Calculate flood return period in years"""
        if risk_score > 90:
            return 5
        elif risk_score > 75:
            return 10
        elif risk_score > 60:
            return 25
        elif risk_score > 40:
            return 50
        else:
            return 100
    
    def _calculate_max_depth(self, risk_score: float, features: Dict[str, Any]) -> float:
        """Calculate maximum flood depth in meters"""
        base_depth = risk_score / 50  # Base relationship
        
        # Adjust for topography
        slope = features.get('slope', 5.0)
        elevation = features.get('elevation', 100.0)
        
        if slope < 2:
            base_depth *= 1.5  # Flatter areas hold more water
        if elevation < 50:
            base_depth *= 1.3  # Lower areas more prone to deep flooding
        
        return min(5.0, max(0.1, base_depth))
    
    def _calculate_affected_area(self, risk_score: float, features: Dict[str, Any]) -> float:
        """Calculate potentially affected area in km²"""
        base_area = risk_score / 10
        
        # Adjust for basin characteristics
        basin_area = features.get('basin_area', 50.0)
        slope = features.get('slope', 5.0)
        
        area_factor = min(2.0, basin_area / 25.0)
        slope_factor = max(0.5, (10 - slope) / 10)
        
        affected_area = base_area * area_factor * slope_factor
        return min(100.0, max(0.5, affected_area))
    
    def _calculate_drainage_capacity(self, features: Dict[str, Any]) -> float:
        """Calculate drainage system capacity percentage"""
        drainage_density = features.get('drainage_density', 0.5)
        urbanization = features.get('urban_percentage', 15.0)
        slope = features.get('slope', 5.0)
        
        # Base capacity from natural drainage
        natural_capacity = drainage_density * 100
        
        # Adjust for slope (better drainage on steeper slopes)
        slope_factor = min(1.5, slope / 10)
        
        # Reduce for urbanization (overwhelmed systems)
        urban_factor = max(0.5, (100 - urbanization) / 100)
        
        capacity = natural_capacity * slope_factor * urban_factor
        return min(100.0, max(20.0, capacity))
    
    def _generate_recommendations(self, risk_score: float, features: Dict[str, Any]) -> List[str]:
        """Generate flood mitigation recommendations"""
        recommendations = []
        
        if risk_score > 75:
            recommendations.extend([
                "Issue flood warnings to residents",
                "Activate emergency response protocols",
                "Prepare evacuation routes",
                "Monitor water levels continuously"
            ])
        elif risk_score > 50:
            recommendations.extend([
                "Monitor weather and water levels",
                "Prepare flood barriers and sandbags",
                "Alert emergency services",
                "Check drainage system capacity"
            ])
        elif risk_score > 25:
            recommendations.extend([
                "Routine monitoring of precipitation",
                "Maintain drainage infrastructure",
                "Review flood preparedness plans"
            ])
        else:
            recommendations.append("Continue standard flood prevention measures")
        
        # Specific recommendations based on conditions
        urbanization = features.get('urban_percentage', 15.0)
        drainage_density = features.get('drainage_density', 0.5)
        
        if urbanization > 50:
            recommendations.append("Improve urban drainage and stormwater management")
        if drainage_density < 0.3:
            recommendations.append("Enhance natural drainage systems")
        
        return recommendations
    
    def _get_default_prediction(self) -> Dict[str, Any]:
        """Return default prediction when all else fails"""
        return {
            'risk_score': 40.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable - using default assessment"],
            'recommendations': ["Use alternative flood assessment methods"],
            'return_period': 50,
            'max_depth': 0.8,
            'affected_area': 5.0,
            'drainage_capacity': 60.0
        }

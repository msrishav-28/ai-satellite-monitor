"""
Advanced Wildfire Risk Prediction Model
Uses ensemble methods and deep learning for accurate wildfire risk assessment
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
import logging
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
import joblib
import os

logger = logging.getLogger(__name__)


class WildfireRiskModel:
    """
    Advanced wildfire risk prediction model using ensemble methods
    
    Features used:
    - Land Surface Temperature (LST)
    - Normalized Difference Vegetation Index (NDVI)
    - Fuel moisture content
    - Wind speed and direction
    - Topographic slope and aspect
    - Relative humidity
    - Precipitation history
    - Fuel load density
    - Distance to roads/settlements
    - Historical fire occurrence
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or "models/wildfire_model.pkl"
        self.scaler_path = model_path.replace('.pkl', '_scaler.pkl') if model_path else "models/wildfire_scaler.pkl"
        
        # Model components
        self.rf_model = None
        self.gb_model = None
        self.scaler = None
        self.feature_names = [
            'land_surface_temperature',
            'ndvi',
            'fuel_moisture',
            'wind_speed',
            'wind_direction_sin',
            'wind_direction_cos',
            'slope',
            'aspect_sin',
            'aspect_cos',
            'humidity',
            'precipitation_7day',
            'precipitation_30day',
            'fuel_load',
            'elevation',
            'road_distance',
            'settlement_distance',
            'fire_history_1year',
            'fire_history_5year',
            'drought_index',
            'temperature_anomaly'
        ]
        
        self.is_trained = False
        
    def _prepare_features(self, raw_features: Dict[str, Any]) -> np.ndarray:
        """
        Prepare and engineer features for model input
        """
        try:
            # Extract base features
            lst = raw_features.get('land_surface_temperature', 25.0)
            ndvi = raw_features.get('ndvi', 0.6)
            fuel_moisture = raw_features.get('fuel_moisture', 20.0)
            wind_speed = raw_features.get('wind_speed', 5.0)
            wind_direction = raw_features.get('wind_direction', 180.0)
            slope = raw_features.get('slope', 10.0)
            aspect = raw_features.get('aspect', 180.0)
            humidity = raw_features.get('humidity', 60.0)
            fuel_load = raw_features.get('fuel_load', 0.7)
            elevation = raw_features.get('elevation', 500.0)
            
            # Derived features
            precipitation_7day = raw_features.get('precipitation_7day', 5.0)
            precipitation_30day = raw_features.get('precipitation_30day', 25.0)
            road_distance = raw_features.get('road_distance', 5.0)
            settlement_distance = raw_features.get('settlement_distance', 10.0)
            fire_history_1year = raw_features.get('fire_history_1year', 0.0)
            fire_history_5year = raw_features.get('fire_history_5year', 0.1)
            
            # Calculate derived metrics
            drought_index = max(0, (30 - precipitation_30day) / 30)
            temperature_anomaly = lst - 25.0  # Assuming 25°C as baseline
            
            # Trigonometric encoding for circular features
            wind_direction_rad = np.radians(wind_direction)
            aspect_rad = np.radians(aspect)
            
            # Assemble feature vector
            features = np.array([
                lst,
                ndvi,
                fuel_moisture,
                wind_speed,
                np.sin(wind_direction_rad),
                np.cos(wind_direction_rad),
                slope,
                np.sin(aspect_rad),
                np.cos(aspect_rad),
                humidity,
                precipitation_7day,
                precipitation_30day,
                fuel_load,
                elevation,
                road_distance,
                settlement_distance,
                fire_history_1year,
                fire_history_5year,
                drought_index,
                temperature_anomaly
            ]).reshape(1, -1)
            
            return features
            
        except Exception as e:
            logger.error(f"Error preparing features: {e}")
            # Return default feature vector
            return np.zeros((1, len(self.feature_names)))
    
    def load_model(self) -> bool:
        """Load trained model from disk"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                model_data = joblib.load(self.model_path)
                self.rf_model = model_data['rf_model']
                self.gb_model = model_data['gb_model']
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info("Wildfire model loaded successfully")
                return True
            else:
                logger.warning("Wildfire model files not found, using fallback predictions")
                return False
        except Exception as e:
            logger.error(f"Error loading wildfire model: {e}")
            return False
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict wildfire risk for given features
        """
        try:
            # Prepare features
            X = self._prepare_features(features)
            
            if self.is_trained and self.rf_model and self.gb_model and self.scaler:
                # Scale features
                X_scaled = self.scaler.transform(X)
                
                # Get predictions from both models
                rf_pred = self.rf_model.predict(X_scaled)[0]
                gb_pred = self.gb_model.predict(X_scaled)[0]
                
                # Ensemble prediction (weighted average)
                risk_score = (rf_pred * 0.6 + gb_pred * 0.4)
                risk_score = np.clip(risk_score, 0, 100)
                
                # Calculate confidence based on model agreement
                agreement = 1 - abs(rf_pred - gb_pred) / 100
                confidence = min(95, max(60, agreement * 100))
                
                # Get feature importance for contributing factors
                feature_importance = self.rf_model.feature_importances_
                top_factors = self._get_contributing_factors(X[0], feature_importance)
                
            else:
                # Fallback to rule-based prediction
                risk_score, confidence, top_factors = self._fallback_prediction(features)
            
            # Calculate derived metrics
            ignition_probability = min(1.0, risk_score / 100)
            spread_rate = self._calculate_spread_rate(features, risk_score)
            fuel_moisture_calc = self._calculate_fuel_moisture(features)
            fire_weather_index = self._calculate_fire_weather_index(features)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(risk_score, features)
            
            return {
                'risk_score': float(risk_score),
                'confidence': float(confidence),
                'contributing_factors': top_factors,
                'recommendations': recommendations,
                'ignition_probability': float(ignition_probability),
                'spread_rate': float(spread_rate),
                'fuel_moisture': float(fuel_moisture_calc),
                'fire_weather_index': float(fire_weather_index)
            }
            
        except Exception as e:
            logger.error(f"Error in wildfire prediction: {e}")
            return self._get_default_prediction()
    
    def _fallback_prediction(self, features: Dict[str, Any]) -> Tuple[float, float, List[str]]:
        """Rule-based fallback prediction when ML model is unavailable"""
        lst = features.get('land_surface_temperature', 25.0)
        ndvi = features.get('ndvi', 0.6)
        wind_speed = features.get('wind_speed', 5.0)
        humidity = features.get('humidity', 60.0)
        fuel_moisture = features.get('fuel_moisture', 20.0)
        
        # Rule-based risk calculation
        temp_risk = min(100, max(0, (lst - 20) * 3))
        vegetation_risk = max(0, (0.8 - ndvi) * 125)
        wind_risk = min(100, wind_speed * 7)
        humidity_risk = max(0, (70 - humidity) * 1.5)
        fuel_risk = max(0, (30 - fuel_moisture) * 2.5)
        
        # Weighted combination
        risk_score = (
            temp_risk * 0.25 +
            vegetation_risk * 0.20 +
            wind_risk * 0.20 +
            humidity_risk * 0.20 +
            fuel_risk * 0.15
        )
        
        confidence = 75.0  # Lower confidence for rule-based prediction
        
        # Identify contributing factors
        factors = []
        if temp_risk > 50:
            factors.append("High temperature")
        if vegetation_risk > 40:
            factors.append("Dry vegetation")
        if wind_risk > 40:
            factors.append("Strong winds")
        if humidity_risk > 30:
            factors.append("Low humidity")
        if fuel_risk > 30:
            factors.append("Low fuel moisture")
        
        return risk_score, confidence, factors or ["Moderate conditions"]
    
    def _get_contributing_factors(self, features: np.ndarray, importance: np.ndarray) -> List[str]:
        """Get top contributing factors based on feature importance"""
        factor_map = {
            'land_surface_temperature': 'High temperature',
            'ndvi': 'Vegetation stress',
            'fuel_moisture': 'Low fuel moisture',
            'wind_speed': 'Strong winds',
            'humidity': 'Low humidity',
            'slope': 'Steep terrain',
            'fuel_load': 'High fuel load',
            'drought_index': 'Drought conditions',
            'fire_history_1year': 'Recent fire activity'
        }
        
        # Get top 3 most important features
        top_indices = np.argsort(importance)[-3:][::-1]
        factors = []
        
        for idx in top_indices:
            if idx < len(self.feature_names):
                feature_name = self.feature_names[idx]
                if feature_name in factor_map:
                    factors.append(factor_map[feature_name])
        
        return factors or ["Multiple environmental factors"]
    
    def _calculate_spread_rate(self, features: Dict[str, Any], risk_score: float) -> float:
        """Calculate fire spread rate in km/h"""
        wind_speed = features.get('wind_speed', 5.0)
        fuel_load = features.get('fuel_load', 0.7)
        humidity = features.get('humidity', 60.0)
        slope = features.get('slope', 10.0)
        
        # Base spread rate calculation
        base_rate = wind_speed * 0.3 * fuel_load
        humidity_factor = max(0.3, (100 - humidity) / 100)
        slope_factor = 1 + (slope / 100)
        risk_factor = risk_score / 100
        
        spread_rate = base_rate * humidity_factor * slope_factor * risk_factor
        return min(15.0, max(0.1, spread_rate))  # Cap at 15 km/h
    
    def _calculate_fuel_moisture(self, features: Dict[str, Any]) -> float:
        """Calculate fuel moisture content"""
        base_moisture = features.get('fuel_moisture', 20.0)
        humidity = features.get('humidity', 60.0)
        lst = features.get('land_surface_temperature', 25.0)
        precipitation = features.get('precipitation_7day', 5.0)
        
        # Adjust based on environmental conditions
        moisture = base_moisture
        moisture += (humidity - 50) * 0.2
        moisture -= (lst - 25) * 0.5
        moisture += precipitation * 0.3
        
        return max(5.0, min(50.0, moisture))
    
    def _calculate_fire_weather_index(self, features: Dict[str, Any]) -> float:
        """Calculate Fire Weather Index"""
        lst = features.get('land_surface_temperature', 25.0)
        wind_speed = features.get('wind_speed', 5.0)
        humidity = features.get('humidity', 60.0)
        precipitation = features.get('precipitation_7day', 5.0)
        
        # Simplified FWI calculation
        temp_component = (lst - 20) * 2
        wind_component = wind_speed * 3
        humidity_component = (100 - humidity) * 0.5
        drought_component = max(0, (10 - precipitation) * 2)
        
        fwi = temp_component + wind_component + humidity_component + drought_component
        return max(0, min(100, fwi))
    
    def _generate_recommendations(self, risk_score: float, features: Dict[str, Any]) -> List[str]:
        """Generate risk mitigation recommendations"""
        recommendations = []
        
        if risk_score > 75:
            recommendations.extend([
                "Implement immediate fire watch protocols",
                "Prepare evacuation routes and plans",
                "Pre-position firefighting resources",
                "Issue red flag warnings to public"
            ])
        elif risk_score > 50:
            recommendations.extend([
                "Enhanced fire monitoring and patrols",
                "Public fire safety warnings",
                "Restrict outdoor burning activities",
                "Increase firefighting crew readiness"
            ])
        elif risk_score > 25:
            recommendations.extend([
                "Routine fire monitoring",
                "Maintain firefighting equipment",
                "Monitor weather conditions closely"
            ])
        else:
            recommendations.append("Continue standard fire prevention measures")
        
        # Add specific recommendations based on conditions
        wind_speed = features.get('wind_speed', 5.0)
        humidity = features.get('humidity', 60.0)
        
        if wind_speed > 15:
            recommendations.append("High wind advisory - extreme caution with any ignition sources")
        if humidity < 30:
            recommendations.append("Low humidity conditions - increase moisture monitoring")
        
        return recommendations
    
    def _get_default_prediction(self) -> Dict[str, Any]:
        """Return default prediction when all else fails"""
        return {
            'risk_score': 50.0,
            'confidence': 60.0,
            'contributing_factors': ["Model unavailable - using default assessment"],
            'recommendations': ["Use alternative fire risk assessment methods"],
            'ignition_probability': 0.3,
            'spread_rate': 1.0,
            'fuel_moisture': 25.0,
            'fire_weather_index': 40.0
        }

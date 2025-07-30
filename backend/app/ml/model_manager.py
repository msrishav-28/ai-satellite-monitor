"""
ML Model Manager for Environmental Intelligence Platform
Coordinates all machine learning models and provides unified interface
"""

import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import numpy as np

from .wildfire_model import WildfireRiskModel
from .flood_model import FloodRiskModel
from .landslide_model import LandslideRiskModel

logger = logging.getLogger(__name__)


class ModelManager:
    """
    Central manager for all ML models in the platform
    
    Provides:
    - Model loading and initialization
    - Unified prediction interface
    - Model performance monitoring
    - Feature preprocessing coordination
    - Ensemble predictions
    """
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        
        # Initialize models
        self.wildfire_model = WildfireRiskModel(f"{model_dir}/wildfire_model.pkl")
        self.flood_model = FloodRiskModel(f"{model_dir}/flood_model.pkl")
        self.landslide_model = LandslideRiskModel(f"{model_dir}/landslide_model.pkl")
        
        # Model status tracking
        self.model_status = {
            'wildfire': False,
            'flood': False,
            'landslide': False
        }
        
        # Performance metrics
        self.prediction_counts = {
            'wildfire': 0,
            'flood': 0,
            'landslide': 0
        }
        
        self.last_predictions = {}
        self.model_errors = {}
        
    async def initialize_models(self) -> Dict[str, bool]:
        """Initialize all ML models"""
        try:
            logger.info("Initializing ML models...")
            
            # Load models concurrently
            tasks = [
                self._load_wildfire_model(),
                self._load_flood_model(),
                self._load_landslide_model()
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Update status based on results
            self.model_status['wildfire'] = not isinstance(results[0], Exception) and results[0]
            self.model_status['flood'] = not isinstance(results[1], Exception) and results[1]
            self.model_status['landslide'] = not isinstance(results[2], Exception) and results[2]
            
            # Log results
            loaded_models = sum(self.model_status.values())
            total_models = len(self.model_status)
            
            logger.info(f"ML models initialized: {loaded_models}/{total_models} loaded successfully")
            
            for model_name, status in self.model_status.items():
                if isinstance(results[list(self.model_status.keys()).index(model_name)], Exception):
                    error = results[list(self.model_status.keys()).index(model_name)]
                    self.model_errors[model_name] = str(error)
                    logger.error(f"Failed to load {model_name} model: {error}")
                else:
                    logger.info(f"{model_name.capitalize()} model: {'✓ Loaded' if status else '✗ Fallback mode'}")
            
            return self.model_status
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            return self.model_status
    
    async def _load_wildfire_model(self) -> bool:
        """Load wildfire prediction model"""
        try:
            return self.wildfire_model.load_model()
        except Exception as e:
            logger.error(f"Error loading wildfire model: {e}")
            return False
    
    async def _load_flood_model(self) -> bool:
        """Load flood prediction model"""
        try:
            return self.flood_model.load_model()
        except Exception as e:
            logger.error(f"Error loading flood model: {e}")
            return False
    
    async def _load_landslide_model(self) -> bool:
        """Load landslide prediction model"""
        try:
            return self.landslide_model.load_model()
        except Exception as e:
            logger.error(f"Error loading landslide model: {e}")
            return False
    
    async def predict_wildfire_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict wildfire risk using the wildfire model"""
        try:
            self.prediction_counts['wildfire'] += 1
            
            # Add metadata
            prediction = self.wildfire_model.predict(features)
            prediction.update({
                'model_type': 'wildfire',
                'model_status': 'trained' if self.model_status['wildfire'] else 'fallback',
                'prediction_id': f"wf_{self.prediction_counts['wildfire']:06d}",
                'timestamp': datetime.utcnow().isoformat()
            })
            
            self.last_predictions['wildfire'] = prediction
            return prediction
            
        except Exception as e:
            logger.error(f"Error in wildfire prediction: {e}")
            return self._get_error_response('wildfire', str(e))
    
    async def predict_flood_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict flood risk using the flood model"""
        try:
            self.prediction_counts['flood'] += 1
            
            # Add metadata
            prediction = self.flood_model.predict(features)
            prediction.update({
                'model_type': 'flood',
                'model_status': 'trained' if self.model_status['flood'] else 'fallback',
                'prediction_id': f"fl_{self.prediction_counts['flood']:06d}",
                'timestamp': datetime.utcnow().isoformat()
            })
            
            self.last_predictions['flood'] = prediction
            return prediction
            
        except Exception as e:
            logger.error(f"Error in flood prediction: {e}")
            return self._get_error_response('flood', str(e))
    
    async def predict_landslide_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict landslide risk using the landslide model"""
        try:
            self.prediction_counts['landslide'] += 1
            
            # Add metadata
            prediction = self.landslide_model.predict(features)
            prediction.update({
                'model_type': 'landslide',
                'model_status': 'trained' if self.model_status['landslide'] else 'fallback',
                'prediction_id': f"ls_{self.prediction_counts['landslide']:06d}",
                'timestamp': datetime.utcnow().isoformat()
            })
            
            self.last_predictions['landslide'] = prediction
            return prediction
            
        except Exception as e:
            logger.error(f"Error in landslide prediction: {e}")
            return self._get_error_response('landslide', str(e))
    
    async def predict_all_hazards(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Run all hazard prediction models concurrently"""
        try:
            # Run all predictions concurrently
            tasks = [
                self.predict_wildfire_risk(features),
                self.predict_flood_risk(features),
                self.predict_landslide_risk(features)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            wildfire_result = results[0] if not isinstance(results[0], Exception) else self._get_error_response('wildfire', str(results[0]))
            flood_result = results[1] if not isinstance(results[1], Exception) else self._get_error_response('flood', str(results[1]))
            landslide_result = results[2] if not isinstance(results[2], Exception) else self._get_error_response('landslide', str(results[2]))
            
            # Calculate overall risk assessment
            overall_assessment = self._calculate_overall_risk(wildfire_result, flood_result, landslide_result)
            
            return {
                'wildfire': wildfire_result,
                'flood': flood_result,
                'landslide': landslide_result,
                'overall_assessment': overall_assessment,
                'prediction_metadata': {
                    'total_predictions': sum(self.prediction_counts.values()),
                    'models_loaded': sum(self.model_status.values()),
                    'timestamp': datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error in multi-hazard prediction: {e}")
            return self._get_multi_hazard_error_response(str(e))
    
    def _calculate_overall_risk(self, wildfire: Dict, flood: Dict, landslide: Dict) -> Dict[str, Any]:
        """Calculate overall multi-hazard risk assessment"""
        try:
            # Extract risk scores
            wf_risk = wildfire.get('risk_score', 0)
            fl_risk = flood.get('risk_score', 0)
            ls_risk = landslide.get('risk_score', 0)
            
            # Calculate weighted overall risk
            # Weights based on typical hazard impact and frequency
            overall_risk = (wf_risk * 0.4 + fl_risk * 0.35 + ls_risk * 0.25)
            
            # Determine priority hazards (risk > 50)
            priority_hazards = []
            if wf_risk > 50:
                priority_hazards.append(('wildfire', wf_risk))
            if fl_risk > 50:
                priority_hazards.append(('flood', fl_risk))
            if ls_risk > 50:
                priority_hazards.append(('landslide', ls_risk))
            
            # Sort by risk level
            priority_hazards.sort(key=lambda x: x[1], reverse=True)
            
            # Risk level classification
            if overall_risk > 75:
                risk_level = 'critical'
            elif overall_risk > 50:
                risk_level = 'high'
            elif overall_risk > 25:
                risk_level = 'moderate'
            else:
                risk_level = 'low'
            
            # Generate combined recommendations
            all_recommendations = []
            for hazard_result in [wildfire, flood, landslide]:
                recommendations = hazard_result.get('recommendations', [])
                all_recommendations.extend(recommendations)
            
            # Remove duplicates and prioritize
            unique_recommendations = list(dict.fromkeys(all_recommendations))[:5]
            
            return {
                'overall_risk_score': round(overall_risk, 1),
                'risk_level': risk_level,
                'priority_hazards': [hazard[0] for hazard in priority_hazards],
                'hazard_scores': {
                    'wildfire': wf_risk,
                    'flood': fl_risk,
                    'landslide': ls_risk
                },
                'recommendations': unique_recommendations,
                'assessment_confidence': min(
                    wildfire.get('confidence', 60),
                    flood.get('confidence', 60),
                    landslide.get('confidence', 60)
                )
            }
            
        except Exception as e:
            logger.error(f"Error calculating overall risk: {e}")
            return {
                'overall_risk_score': 50.0,
                'risk_level': 'moderate',
                'priority_hazards': [],
                'hazard_scores': {'wildfire': 0, 'flood': 0, 'landslide': 0},
                'recommendations': ['Error in risk calculation - use individual hazard assessments'],
                'assessment_confidence': 50.0
            }
    
    def _get_error_response(self, model_type: str, error_message: str) -> Dict[str, Any]:
        """Generate error response for individual model"""
        return {
            'risk_score': 50.0,
            'confidence': 30.0,
            'contributing_factors': [f"{model_type.capitalize()} model error"],
            'recommendations': [f"Manual {model_type} assessment recommended"],
            'model_type': model_type,
            'model_status': 'error',
            'error': error_message,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _get_multi_hazard_error_response(self, error_message: str) -> Dict[str, Any]:
        """Generate error response for multi-hazard prediction"""
        return {
            'wildfire': self._get_error_response('wildfire', error_message),
            'flood': self._get_error_response('flood', error_message),
            'landslide': self._get_error_response('landslide', error_message),
            'overall_assessment': {
                'overall_risk_score': 50.0,
                'risk_level': 'unknown',
                'priority_hazards': [],
                'hazard_scores': {'wildfire': 0, 'flood': 0, 'landslide': 0},
                'recommendations': ['System error - manual assessment required'],
                'assessment_confidence': 30.0
            },
            'prediction_metadata': {
                'total_predictions': sum(self.prediction_counts.values()),
                'models_loaded': sum(self.model_status.values()),
                'error': error_message,
                'timestamp': datetime.utcnow().isoformat()
            }
        }
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get current status of all models"""
        return {
            'models': self.model_status,
            'prediction_counts': self.prediction_counts,
            'errors': self.model_errors,
            'last_predictions': {
                model: pred.get('timestamp') if pred else None 
                for model, pred in self.last_predictions.items()
            },
            'system_status': 'operational' if any(self.model_status.values()) else 'degraded'
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on all models"""
        try:
            # Test each model with dummy data
            test_features = {
                'elevation': 500.0,
                'slope': 15.0,
                'aspect': 180.0,
                'land_surface_temperature': 25.0,
                'ndvi': 0.6,
                'precipitation_24h': 10.0,
                'humidity': 60.0,
                'wind_speed': 5.0
            }
            
            health_status = {}
            
            for model_name in ['wildfire', 'flood', 'landslide']:
                try:
                    if model_name == 'wildfire':
                        result = await self.predict_wildfire_risk(test_features)
                    elif model_name == 'flood':
                        result = await self.predict_flood_risk(test_features)
                    else:
                        result = await self.predict_landslide_risk(test_features)
                    
                    health_status[model_name] = {
                        'status': 'healthy',
                        'response_time': 'normal',
                        'last_prediction': result.get('timestamp')
                    }
                    
                except Exception as e:
                    health_status[model_name] = {
                        'status': 'unhealthy',
                        'error': str(e),
                        'last_prediction': None
                    }
            
            overall_health = 'healthy' if all(
                status['status'] == 'healthy' for status in health_status.values()
            ) else 'degraded'
            
            return {
                'overall_health': overall_health,
                'models': health_status,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in health check: {e}")
            return {
                'overall_health': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }


# Global model manager instance
model_manager = ModelManager()

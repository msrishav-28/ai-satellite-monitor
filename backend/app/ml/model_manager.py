"""
ML Model Manager — auto-trains models from synthetic data if pkl files are absent.
Provides unified predict interface with real sklearn inference for all 3 hazard types.
"""

import os, logging, asyncio
from typing import Dict, Any
from datetime import datetime

from app.ml.wildfire_model import WildfireRiskModel
from app.ml.flood_model import FloodRiskModel
from app.ml.landslide_model import LandslideRiskModel
from app.core.exceptions import MLModelError

logger = logging.getLogger(__name__)


class ModelManager:
    """
    Central manager for all hazard ML models.
    On initialize_models(): loads .pkl if present, else trains from synthetic data.
    """

    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        os.makedirs(model_dir, exist_ok=True)

        self.wildfire_model  = WildfireRiskModel(f"{model_dir}/wildfire_model.pkl")
        self.flood_model     = FloodRiskModel(f"{model_dir}/flood_model.pkl")
        self.landslide_model = LandslideRiskModel(f"{model_dir}/landslide_model.pkl")

        self.model_status = {"wildfire": False, "flood": False, "landslide": False}
        self.prediction_counts = {"wildfire": 0, "flood": 0, "landslide": 0}
        self.training_metrics: Dict[str, Any] = {}
        self.initialized_at: datetime = None

    # ------------------------------------------------------------------
    async def initialize_models(self) -> Dict[str, bool]:
        """Load or train all models concurrently."""
        logger.info("Initializing ML models…")
        results = await asyncio.gather(
            asyncio.to_thread(self._load_or_train, "wildfire",  self.wildfire_model),
            asyncio.to_thread(self._load_or_train, "flood",     self.flood_model),
            asyncio.to_thread(self._load_or_train, "landslide", self.landslide_model),
            return_exceptions=True,
        )
        for name, result in zip(["wildfire", "flood", "landslide"], results):
            if isinstance(result, Exception):
                logger.error(f"{name} model init failed: {result}")
                self.model_status[name] = False
            else:
                self.model_status[name] = result

        ok = sum(self.model_status.values())
        logger.info(f"ML models ready: {ok}/3 loaded/trained successfully")
        self.initialized_at = datetime.utcnow()
        return self.model_status

    def _load_or_train(self, name: str, model) -> bool:
        """Try loading .pkl; train from synthetic data if absent."""
        if model.load_model():
            self.training_metrics[name] = {"source": "loaded", "cv_mae": getattr(model, "cv_mae", None)}
            return True
        logger.info(f"{name} model pkl not found — training from synthetic data…")
        model.train_from_synthetic(n=50_000)
        self.training_metrics[name] = {
            "source": "trained_synthetic",
            "n_samples": 50_000,
            "cv_mae": getattr(model, "cv_mae", None),
        }
        return True

    # ------------------------------------------------------------------
    async def predict_wildfire(self, features: Dict[str, Any]) -> Dict[str, Any]:
        if not self.model_status["wildfire"]:
            raise MLModelError("wildfire", "Model not initialized")
        result = await asyncio.to_thread(self.wildfire_model.predict, features)
        self.prediction_counts["wildfire"] += 1
        return result

    async def predict_flood(self, features: Dict[str, Any]) -> Dict[str, Any]:
        if not self.model_status["flood"]:
            raise MLModelError("flood", "Model not initialized")
        result = await asyncio.to_thread(self.flood_model.predict, features)
        self.prediction_counts["flood"] += 1
        return result

    async def predict_landslide(self, features: Dict[str, Any]) -> Dict[str, Any]:
        if not self.model_status["landslide"]:
            raise MLModelError("landslide", "Model not initialized")
        result = await asyncio.to_thread(self.landslide_model.predict, features)
        self.prediction_counts["landslide"] += 1
        return result

    async def predict(self, model_type: str, features: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatch prediction requests to the correct hazard model."""
        if model_type == "wildfire":
            return await self.predict_wildfire(features)
        if model_type == "flood":
            return await self.predict_flood(features)
        if model_type == "landslide":
            return await self.predict_landslide(features)
        raise MLModelError(model_type, f"Unknown model type: {model_type}")

    def get_status(self) -> Dict[str, Any]:
        return {
            "models_loaded": self.model_status,
            "prediction_counts": self.prediction_counts,
            "training_metrics": self.training_metrics,
            "initialized_at": self.initialized_at.isoformat() if self.initialized_at else None,
        }

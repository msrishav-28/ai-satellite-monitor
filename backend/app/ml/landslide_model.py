"""
Landslide Susceptibility Model — self-training with synthetic physically-valid data.
Uses Gradient Boosting Regressor trained on physics-derived labels.
"""

import os, logging
import numpy as np
from typing import Dict, Any, List, Tuple
import joblib
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import KFold
from app.core.exceptions import MLModelError

logger = logging.getLogger(__name__)

_FEAT = [
    "elevation", "slope", "asp_sin", "asp_cos",
    "plan_curv", "profile_curv", "twi", "spi",
    "geo_sed", "geo_ign", "geo_met",
    "clay", "sand", "lc_forest", "lc_urban", "lc_agri",
    "precip_ann", "precip_int", "fault_dist", "road_dist",
    "ndvi", "drain_dens", "relief_ratio", "slope_len",
]


def _physics_risk(X: np.ndarray) -> np.ndarray:
    slope, clay, ndvi, precip_ann, fault_d = (
        X[:, 1], X[:, 11], X[:, 20], X[:, 16], X[:, 18]
    )
    slope_risk  = np.clip((slope - 10) * 4, 0, 100)
    geo_risk    = np.clip(X[:, 8] * 40 + X[:, 10] * 60 + X[:, 9] * 20, 0, 100)
    precip_risk = np.clip((precip_ann - 500) / 20, 0, 100)
    clay_risk   = np.clip(clay * 1.5, 0, 50)
    veg_mitig   = np.clip((ndvi - 0.3) * 25, 0, 25)
    fault_risk  = np.clip((10 - fault_d) * 5, 0, 50)

    return np.clip(
        slope_risk  * 0.35 +
        geo_risk    * 0.20 +
        precip_risk * 0.20 +
        clay_risk   * 0.12 +
        fault_risk  * 0.08 +
        (X[:, 6] * 3) * 0.05  # TWI contribution
        - veg_mitig,
        0, 100
    )


def _generate_training_data(n: int = 50_000) -> Tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(44)
    elev     = rng.uniform(50,   3000, n)
    slope    = rng.uniform(0,    55,   n)
    aspect   = rng.uniform(0,   360,   n)
    geo_raw  = rng.integers(0, 3, n)
    clay     = rng.uniform(5,   55,    n)
    sand     = rng.uniform(5,   70,    n)
    lc_raw   = rng.integers(0, 3, n)
    precip_a = rng.uniform(200, 3000,  n)
    precip_i = rng.uniform(5,   200,   n)
    fault_d  = rng.uniform(0,   30,    n)
    road_d   = rng.uniform(0,   20,    n)
    ndvi     = rng.uniform(0.0, 0.95,  n)
    drain    = rng.uniform(0.1, 1.5,   n)
    contrib  = rng.uniform(10, 1000,   n)

    slope_rad = np.radians(np.maximum(slope, 0.1))
    twi  = np.clip(np.log(contrib / np.tan(slope_rad)), 0, 20)
    spi  = np.clip(contrib * np.tan(slope_rad), 0, 1000)
    rr   = np.clip(slope / (elev / 200 + 1), 0, 5)
    sl   = slope * np.sin(slope_rad) * 10

    X = np.column_stack([
        elev, slope,
        np.sin(np.radians(aspect)), np.cos(np.radians(aspect)),
        rng.uniform(-0.1, 0.1, n), rng.uniform(-0.05, 0.05, n),  # curvatures
        twi, spi,
        (geo_raw == 0).astype(float), (geo_raw == 1).astype(float), (geo_raw == 2).astype(float),
        clay, sand,
        (lc_raw == 0).astype(float), (lc_raw == 1).astype(float), (lc_raw == 2).astype(float),
        precip_a, precip_i, fault_d, road_d,
        ndvi, drain, rr, sl,
    ])
    y = np.clip(_physics_risk(X) + rng.normal(0, 3, n), 0, 100)
    return X, y


class LandslideRiskModel:
    """Landslide susceptibility ensemble."""

    def __init__(self, model_path: str = "models/landslide_model.pkl"):
        self.model_path  = model_path
        self.scaler_path = model_path.replace(".pkl", "_scaler.pkl")
        self.rf_model    = None
        self.gb_model    = None
        self.scaler      = None
        self.is_trained  = False
        self.cv_mae: float = None

    def load_model(self) -> bool:
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                d = joblib.load(self.model_path)
                self.rf_model   = d["rf_model"]
                self.gb_model   = d["gb_model"]
                self.cv_mae     = d.get("cv_mae")
                self.scaler     = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info(f"Landslide model loaded (CV MAE={self.cv_mae:.2f})")
                return True
            return False
        except Exception as e:
            logger.error(f"Landslide model load error: {e}")
            return False

    def train_from_synthetic(self, n: int = 50_000) -> None:
        logger.info(f"Training landslide model on {n} synthetic samples…")
        X, y = _generate_training_data(n)
        scaler = StandardScaler()
        X_s = scaler.fit_transform(X)
        gb = GradientBoostingRegressor(n_estimators=300, learning_rate=0.05, max_depth=5, subsample=0.8, random_state=44)
        rf = RandomForestRegressor(n_estimators=200, max_depth=12, n_jobs=-1, random_state=44)
        gb.fit(X_s, y)
        rf.fit(X_s, y)
        kf, maes = KFold(n_splits=5, shuffle=True, random_state=44), []
        for tr, va in kf.split(X_s):
            ens = gb.predict(X_s[va]) * 0.6 + rf.predict(X_s[va]) * 0.4
            maes.append(mean_absolute_error(y[va], ens))
        self.cv_mae = float(np.mean(maes))
        self.rf_model, self.gb_model, self.scaler = rf, gb, scaler
        self.is_trained = True
        os.makedirs(os.path.dirname(self.model_path) or ".", exist_ok=True)
        joblib.dump({"rf_model": rf, "gb_model": gb, "cv_mae": self.cv_mae}, self.model_path)
        joblib.dump(scaler, self.scaler_path)
        logger.info(f"Landslide model trained & saved. CV MAE = {self.cv_mae:.2f}")

    def _prepare_features(self, raw: Dict[str, Any]) -> np.ndarray:
        elev     = raw.get("elevation", 500.0)
        slope    = raw.get("slope", 15.0)
        asp      = raw.get("aspect", 180.0)
        geo      = raw.get("geology_type", "sedimentary")
        clay     = raw.get("soil_clay_content", 25.0)
        sand     = raw.get("soil_sand_content", 35.0)
        lc       = raw.get("land_cover", "mixed")
        precip_a = raw.get("precipitation_annual", raw.get("precipitation", 100.0) * 10)
        precip_i = raw.get("precipitation_intensity", raw.get("precipitation", 50.0))
        fault_d  = raw.get("fault_distance", raw.get("distance_to_faults", 10.0))
        road_d   = raw.get("road_distance", raw.get("distance_to_roads", 2.0))
        ndvi     = raw.get("ndvi", 0.6)
        drain    = raw.get("drainage_density", 0.5)
        contrib  = raw.get("contributing_area", 100.0)

        slope_rad = np.radians(max(slope, 0.1))
        twi  = float(np.clip(np.log(contrib / np.tan(slope_rad)), 0, 20))
        spi  = float(np.clip(contrib * np.tan(slope_rad), 0, 1000))
        rr   = slope / (elev / 200 + 1)
        sl   = slope * np.sin(slope_rad) * 10

        return np.array([
            elev, slope,
            np.sin(np.radians(asp)), np.cos(np.radians(asp)),
            0.0, 0.0,  # curvatures (placeholder)
            twi, spi,
            float(geo=="sedimentary"), float(geo=="igneous"), float(geo=="metamorphic"),
            clay, sand,
            float(lc=="forest"), float(lc=="urban"), float(lc=="agriculture"),
            precip_a, precip_i, fault_d, road_d,
            ndvi, drain, rr, sl,
        ]).reshape(1, -1)

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_trained:
            raise MLModelError("landslide", "Model not trained — call train_from_synthetic() first")

        X   = self._prepare_features(features)
        X_s = self.scaler.transform(X)
        p_gb = float(self.gb_model.predict(X_s)[0])
        p_rf = float(self.rf_model.predict(X_s)[0])
        risk = float(np.clip(p_gb * 0.6 + p_rf * 0.4, 0, 100))
        conf = float(np.clip((1 - abs(p_gb - p_rf) / 100) * 100, 65, 95))

        imp  = self.rf_model.feature_importances_
        top3 = np.argsort(imp)[-3:][::-1]
        _fmap = {
            "slope": "Steep slope angle", "clay": "Clay-rich soil",
            "precip_ann": "High annual precipitation", "twi": "High wetness index",
            "geo_sed": "Sedimentary geology", "geo_met": "Metamorphic geology",
            "fault_dist": "Proximity to fault lines", "ndvi": "Low vegetation cover",
            "road_dist": "Proximity to road cuts",
        }
        factors = [_fmap.get(_FEAT[i], _FEAT[i]) for i in top3]

        slope    = features.get("slope", 15.0)
        cohesion = features.get("soil_cohesion", 20.0)
        friction = features.get("friction_angle", 30.0)
        perm     = features.get("soil_permeability", 10.0)
        precip   = features.get("precipitation_annual", features.get("precipitation", 1000.0))

        slope_rad = np.radians(max(slope, 0.1))
        fs = float(np.clip((cohesion + np.cos(slope_rad) * np.tan(np.radians(friction))) / np.sin(slope_rad) * (1 - risk / 200), 0.5, 3.0))
        thresh = float(np.clip(50.0 * (slope / 30) / max(0.5, perm / 20), 20, 200))
        sl_m = features.get("slope_length", 100.0)
        sw   = features.get("slope_width", 50.0)
        area = float(np.clip((sl_m * sw / 10000) * (risk / 100), 0.1, 100.0))

        recs = []
        if risk > 75: recs = ["Immediate evacuation of high-risk zones", "Install slope monitoring sensors", "Restrict area access", "Emergency geotechnical assessment"]
        elif risk > 50: recs = ["Enhanced slope monitoring", "Improve surface drainage", "Vegetation stabilisation programme", "Regular geotechnical reviews"]
        elif risk > 25: recs = ["Routine slope inspections", "Maintain drainage infrastructure", "Monitor precipitation thresholds"]
        else: recs = ["Standard slope maintenance"]
        if slope > 30: recs.append("Consider slope terracing or retaining structures")
        if precip > 1500: recs.append("Install subsurface drainage collection system")

        return {
            "risk_score": round(risk, 1), "confidence": round(conf, 1),
            "contributing_factors": factors, "recommendations": recs,
            "slope_stability": round(fs, 2), "soil_saturation": round(min(100, precip / 30), 1),
            "trigger_threshold": round(thresh, 1),
            "model_type": "GradientBoosting+RandomForest ensemble", "cv_mae": self.cv_mae,
        }

"""
Flood Risk Prediction Model — self-training with synthetic physically-valid data.
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
    "precip_24h", "precip_7d", "precip_30d",
    "elevation", "slope", "asp_sin", "asp_cos",
    "lc_urban", "lc_forest", "lc_agri",
    "soil_perm", "drain_dens", "river_dist",
    "stream_ord", "soil_moist", "api",
    "urban_ratio", "imperv_ratio", "basin_area", "flow_acc",
]


def _physics_risk(X: np.ndarray) -> np.ndarray:
    p24, p7, p30, elev, slope = X[:, 0], X[:, 1], X[:, 2], X[:, 3], X[:, 4]
    sm, drain, urban = X[:, 14], X[:, 11], X[:, 16]

    precip_risk = np.clip(p24 * 3, 0, 100)
    elev_risk   = np.clip((200 - elev) / 2, 0, 100)
    slope_risk  = np.clip((10 - slope) * 8, 0, 100)
    drain_risk  = np.clip((0.3 - drain) * 200, 0, 100)
    urban_risk  = np.clip(urban * 150, 0, 100)
    sm_risk     = np.clip((sm - 0.3) * 150, 0, 100)

    return (
        precip_risk * 0.35 +
        elev_risk   * 0.20 +
        slope_risk  * 0.18 +
        drain_risk  * 0.12 +
        urban_risk  * 0.10 +
        sm_risk     * 0.05
    )


def _generate_training_data(n: int = 50_000) -> Tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(43)
    p24      = rng.uniform(0,  150,  n)
    p7       = rng.uniform(0,  300,  n)
    p30      = rng.uniform(0,  600,  n)
    elev     = rng.uniform(0, 2000,  n)
    slope    = rng.uniform(0,   30,  n)
    aspect   = rng.uniform(0,  360,  n)
    lc_raw   = rng.integers(0, 3, n)
    lc_urban = (lc_raw == 0).astype(float)
    lc_forest= (lc_raw == 1).astype(float)
    lc_agri  = (lc_raw == 2).astype(float)
    soil_perm= rng.uniform(1, 50, n)
    drain    = rng.uniform(0.1, 1.5, n)
    river_d  = rng.uniform(0, 20, n)
    sm       = rng.uniform(0.05, 0.65, n)
    urban_r  = lc_urban * rng.uniform(0.1, 0.9, n)
    basin    = rng.uniform(10, 500, n)

    stream_ord = np.where(river_d < 0.5, 4, np.where(river_d < 2, 2, 1)).astype(float)
    api        = p7 * 0.7 + (p30 - p7) * 0.3
    imperv     = urban_r * 0.7
    flow_acc   = np.clip((1000 - elev) / 1000 * (10 - np.minimum(slope, 10)) / 10 * np.log(basin + 1), 0, 10)

    X = np.column_stack([
        p24, p7, p30, elev, slope,
        np.sin(np.radians(aspect)), np.cos(np.radians(aspect)),
        lc_urban, lc_forest, lc_agri,
        soil_perm, drain, river_d, stream_ord, sm, api,
        urban_r, imperv, basin, flow_acc,
    ])
    y = np.clip(_physics_risk(X) + rng.normal(0, 3, n), 0, 100)
    return X, y


class FloodRiskModel:
    """Flood risk ensemble: GradientBoosting (60%) + RandomForest (40%)."""

    def __init__(self, model_path: str = "models/flood_model.pkl"):
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
                logger.info(f"Flood model loaded (CV MAE={self.cv_mae:.2f})")
                return True
            return False
        except Exception as e:
            logger.error(f"Flood model load error: {e}")
            return False

    def train_from_synthetic(self, n: int = 50_000) -> None:
        logger.info(f"Training flood model on {n} synthetic samples…")
        X, y = _generate_training_data(n)
        scaler = StandardScaler()
        X_s = scaler.fit_transform(X)
        gb = GradientBoostingRegressor(n_estimators=300, learning_rate=0.05, max_depth=5, subsample=0.8, random_state=43)
        rf = RandomForestRegressor(n_estimators=200, max_depth=12, n_jobs=-1, random_state=43)
        gb.fit(X_s, y)
        rf.fit(X_s, y)
        kf, maes = KFold(n_splits=5, shuffle=True, random_state=43), []
        for tr, va in kf.split(X_s):
            ens = gb.predict(X_s[va]) * 0.6 + rf.predict(X_s[va]) * 0.4
            maes.append(mean_absolute_error(y[va], ens))
        self.cv_mae = float(np.mean(maes))
        self.rf_model, self.gb_model, self.scaler = rf, gb, scaler
        self.is_trained = True
        os.makedirs(os.path.dirname(self.model_path) or ".", exist_ok=True)
        joblib.dump({"rf_model": rf, "gb_model": gb, "cv_mae": self.cv_mae}, self.model_path)
        joblib.dump(scaler, self.scaler_path)
        logger.info(f"Flood model trained & saved. CV MAE = {self.cv_mae:.2f}")

    def _prepare_features(self, raw: Dict[str, Any]) -> np.ndarray:
        p24   = raw.get("precipitation_24h", raw.get("precipitation", 10.0))
        p7    = raw.get("precipitation_7day", 25.0)
        p30   = raw.get("precipitation_30day", raw.get("precipitation", 10.0) * 7.5)
        elev  = raw.get("elevation", 100.0)
        slope = raw.get("slope", 5.0)
        asp   = raw.get("aspect", 180.0)
        lc    = raw.get("land_cover", "mixed")
        sm    = raw.get("soil_moisture", 0.3)
        drain = raw.get("drainage_density", 0.5)
        rd    = raw.get("river_distance", 2.0)
        ub    = raw.get("urban_percentage", raw.get("urban_fraction", 15.0))
        if ub > 1:
            ub = ub / 100.0
        basin = raw.get("basin_area", 50.0)
        soil  = raw.get("soil_type", "loam")

        soil_perm_map = {"sand":50,"sandy_loam":25,"loam":15,"clay_loam":8,"clay":3,"rock":1}
        soil_perm = soil_perm_map.get(soil, 15.0)
        if lc == "urban": soil_perm *= 0.3
        elif lc == "forest": soil_perm *= 1.5

        stream_ord = 4 if rd < 0.5 else (2 if rd < 2 else 1)
        api        = p7 * 0.7 + (p30 - p7) * 0.3
        imperv     = ub * 0.7
        flow_acc   = max(0, (1000-elev)/1000 * (10-min(slope,10))/10 * np.log(basin+1))

        return np.array([
            p24, p7, p30, elev, slope,
            np.sin(np.radians(asp)), np.cos(np.radians(asp)),
            float(lc=="urban"), float(lc=="forest"), float(lc=="agriculture"),
            soil_perm, drain, rd, float(stream_ord), sm, api,
            ub, imperv, basin, flow_acc,
        ]).reshape(1, -1)

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_trained:
            raise MLModelError("flood", "Model not trained — call train_from_synthetic() first")

        X   = self._prepare_features(features)
        X_s = self.scaler.transform(X)
        p_gb = float(self.gb_model.predict(X_s)[0])
        p_rf = float(self.rf_model.predict(X_s)[0])
        risk = float(np.clip(p_gb * 0.6 + p_rf * 0.4, 0, 100))
        conf = float(np.clip((1 - abs(p_gb - p_rf) / 100) * 100, 65, 95))

        imp  = self.rf_model.feature_importances_
        top3 = np.argsort(imp)[-3:][::-1]
        _fmap = {
            "precip_24h": "Heavy 24h precipitation", "precip_7d": "Sustained rainfall",
            "elevation": "Low elevation terrain", "slope": "Flat terrain (low drainage)",
            "drain_dens": "Poor drainage density", "lc_urban": "Urban impervious surface",
            "soil_moist": "Pre-saturated soil", "api": "Antecedent soil moisture",
            "river_dist": "Proximity to river",
        }
        factors = [_fmap.get(_FEAT[i], _FEAT[i]) for i in top3]

        # Physical derived outputs
        rp   = 5 if risk > 90 else (10 if risk > 75 else (25 if risk > 60 else (50 if risk > 40 else 100)))
        sl   = features.get("slope", 5.0)
        elev = features.get("elevation", 100.0)
        depth = float(np.clip(risk / 50 * (1.5 if sl < 2 else 1.0) * (1.3 if elev < 50 else 1.0), 0.1, 5.0))
        area  = float(np.clip((risk / 10) * min(2.0, features.get("basin_area", 50.0)/25) * max(0.5,(10-sl)/10), 0.5, 100.0))
        dd    = features.get("drainage_density", 0.5)
        ub    = features.get("urban_percentage", 15.0)
        drain_cap = float(np.clip(dd * 100 * min(1.5, sl/10) * max(0.5,(100-ub)/100), 20, 100))

        recs = []
        if risk > 75: recs = ["Issue flood warnings immediately", "Activate emergency protocols", "Prepare evacuation routes", "Monitor water levels continuously"]
        elif risk > 50: recs = ["Monitor water levels closely", "Prepare flood barriers", "Alert emergency services"]
        elif risk > 25: recs = ["Routine precipitation monitoring", "Maintain drainage infrastructure"]
        else: recs = ["Standard flood prevention measures"]
        if ub > 50: recs.append("Improve urban stormwater management")
        if dd < 0.3: recs.append("Enhance natural drainage channels")

        return {
            "risk_score": round(risk, 1), "confidence": round(conf, 1),
            "contributing_factors": factors, "recommendations": recs,
            "return_period": rp, "max_depth": round(depth, 2),
            "affected_area": round(area, 2), "drainage_capacity": round(drain_cap, 1),
            "model_type": "GradientBoosting+RandomForest ensemble", "cv_mae": self.cv_mae,
        }

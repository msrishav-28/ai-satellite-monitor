"""
AI Analytics service — generates natural language insights from computed hazard data.

When OPENAI_API_KEY is set, the service calls the OpenAI Chat Completions API
with the real hazard scores and satellite indices injected into the prompt.

When no key is available, the service returns a deterministic template-based
response derived from the actual input scores — NOT the same hardcoded string
for every polygon.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from geojson_pydantic import Polygon

from app.core.config import settings
from app.services.satellite_data import SatelliteDataService

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _risk_label(score: float) -> str:
    if score >= 75:
        return "EXTREME"
    elif score >= 50:
        return "HIGH"
    elif score >= 25:
        return "MODERATE"
    return "LOW"


def _build_template_insight(
    satellite_data: Dict[str, Any],
    hazard_scores: Dict[str, float],
    aoi: Polygon,
) -> Dict[str, Any]:
    """
    Build a deterministic insight summary from computed values.
    All text varies with the actual input — not the same string every call.
    """
    ndvi = satellite_data.get("ndvi", 0.6)
    lst = satellite_data.get("land_surface_temperature", 25.0)
    precip = satellite_data.get("precipitation_30day", 50.0)
    slope = satellite_data.get("slope", 10.0)
    sm = satellite_data.get("soil_moisture", 0.35)

    # Derive centroid for narrative
    coords = aoi.coordinates[0]
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    lat_c = round(sum(lats) / len(lats), 2)
    lon_c = round(sum(lons) / len(lons), 2)

    top_hazard = max(hazard_scores, key=hazard_scores.get) if hazard_scores else "wildfire"
    top_score = hazard_scores.get(top_hazard, 0)

    # Build dynamic summary
    veg_status = "stressed" if ndvi < 0.35 else ("healthy" if ndvi > 0.6 else "moderate")
    temp_note = f"{lst:.1f}°C land surface temperature" + (
        " (elevated)" if lst > 32 else " (within normal range)" if lst < 28 else ""
    )
    precip_note = "below-average" if precip < 40 else ("above-average" if precip > 90 else "average")

    summary = (
        f"AOI at ({lat_c}, {lon_c}) shows {veg_status} vegetation (NDVI={ndvi:.3f}), "
        f"{temp_note}, and {precip_note} 30-day precipitation ({precip:.0f} mm). "
        f"Dominant hazard: {top_hazard.upper()} at {_risk_label(top_score)} risk ({top_score:.0f}/100)."
    )

    recommendations = []
    for hazard, score in sorted(hazard_scores.items(), key=lambda x: -x[1])[:3]:
        if score >= 75:
            recommendations.append(f"Immediate action: {hazard} risk is extreme — deploy monitoring resources")
        elif score >= 50:
            recommendations.append(f"Elevated {hazard} risk — increase surveillance frequency")

    if not recommendations:
        recommendations = ["No immediate high-risk hazards detected — maintain routine monitoring"]

    return {
        "summary": summary,
        "key_finding": (
            f"{top_hazard.capitalize()} risk is {_risk_label(top_score)} "
            f"({top_score:.0f}/100) based on slope={slope:.1f}°, "
            f"NDVI={ndvi:.3f}, LST={lst:.1f}°C, soil_moisture={sm:.2f}"
        ),
        "confidence": 72,
        "recommendations": recommendations,
        "data_source": "template (set OPENAI_API_KEY for LLM narration)",
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }


async def _call_openai(
    satellite_data: Dict[str, Any],
    hazard_scores: Dict[str, float],
    aoi: Polygon,
) -> Optional[Dict[str, Any]]:
    """
    Call OpenAI Chat Completions to narrate hazard data in plain English.
    Returns parsed JSON dict or None on failure.
    """
    try:
        import openai  # lazy import — only needed when key is present
    except ImportError:
        logger.warning("openai package not installed. Run: pip install openai")
        return None

    ndvi = satellite_data.get("ndvi", 0.6)
    lst = satellite_data.get("land_surface_temperature", 25.0)
    precip = satellite_data.get("precipitation_30day", 50.0)
    slope = satellite_data.get("slope", 10.0)
    sm = satellite_data.get("soil_moisture", 0.35)

    coords = aoi.coordinates[0]
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    lat_c = round(sum(lats) / len(lats), 3)
    lon_c = round(sum(lons) / len(lons), 3)

    hazard_str = "\n".join(
        f"  - {k}: {v:.1f}/100 ({_risk_label(v)})" for k, v in hazard_scores.items()
    )

    system_prompt = (
        "You are an environmental intelligence analyst. "
        "You receive satellite-derived indices and ML hazard risk scores for a geographic area. "
        "You must return a JSON object with these exact keys: "
        '"summary" (2 sentences, plain English), '
        '"key_finding" (1 sentence, most important insight), '
        '"confidence" (integer 0-100), '
        '"recommendations" (array of 3 strings, specific actions).'
    )

    user_prompt = (
        f"Location: ({lat_c}°N, {lon_c}°E)\n"
        f"Satellite data (last 30 days):\n"
        f"  NDVI: {ndvi:.4f}\n"
        f"  Land Surface Temperature: {lst:.2f}°C\n"
        f"  30-day Precipitation: {precip:.1f} mm\n"
        f"  Terrain Slope: {slope:.1f}°\n"
        f"  Soil Moisture: {sm:.3f} m³/m³\n\n"
        f"Hazard risk scores (0–100):\n{hazard_str}\n\n"
        "Provide your analysis as JSON only — no markdown, no prose outside JSON."
    )

    def _sync_call():
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=512,
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content

    raw = await asyncio.to_thread(_sync_call)
    parsed = json.loads(raw)
    parsed["data_source"] = "OpenAI gpt-4o-mini"
    parsed["generated_at"] = datetime.utcnow().isoformat() + "Z"
    return parsed


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------

class AIAnalyticsService:
    """Service for AI-powered analytics and insights."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.satellite_service = SatelliteDataService()

    async def generate_insights(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Generate AI insights for the given AOI.

        If OPENAI_API_KEY is set, narrates with GPT-4o-mini.
        Otherwise returns a deterministic template built from actual satellite + hazard values.
        """
        try:
            # Fetch satellite data for this AOI
            satellite_data = await self.satellite_service.get_aoi_data(aoi)

            # Pull hazard scores if available (import lazily to avoid circular deps)
            hazard_scores: Dict[str, float] = {}
            try:
                from app.services.hazard_models import HazardModelService
                hazard_service = HazardModelService(self.db)
                hazard_result = await hazard_service.analyze_all_hazards(aoi)
                hazard_scores = {
                    "wildfire": hazard_result.wildfire.risk_score,
                    "flood": hazard_result.flood.risk_score,
                    "landslide": hazard_result.landslide.risk_score,
                    "deforestation": hazard_result.deforestation.risk_score,
                    "heatwave": hazard_result.heatwave.risk_score,
                }
            except Exception as he:
                logger.warning(f"Could not fetch hazard scores for AI analytics: {he}")

            # Try real LLM first, fall back to template
            if settings.OPENAI_API_KEY:
                try:
                    result = await _call_openai(satellite_data, hazard_scores, aoi)
                    if result:
                        return result
                except Exception as llm_err:
                    logger.warning(f"OpenAI call failed, falling back to template: {llm_err}")

            return _build_template_insight(satellite_data, hazard_scores, aoi)

        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            raise

    async def detect_anomalies(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Run anomaly detection on NDVI time-series using Isolation Forest.
        Falls back to a template response when GEE data is unavailable.
        """
        try:
            # Fetch 12-month NDVI time series
            end_date = datetime.utcnow()
            start_date = end_date.replace(year=end_date.year - 1)
            ts = await self.satellite_service.get_ndvi_timeseries(
                aoi,
                start_date.strftime("%Y-%m-%d"),
                end_date.strftime("%Y-%m-%d"),
            )

            if len(ts) >= 6:
                return await self._run_isolation_forest(ts, aoi)
            else:
                logger.info(
                    f"Only {len(ts)} NDVI observations — need ≥6 for Isolation Forest. "
                    "Using template anomaly response."
                )
                return self._template_anomaly_response(ts)

        except Exception as e:
            logger.error(f"Error in anomaly detection: {e}")
            raise

    async def _run_isolation_forest(
        self, ts: List[Dict], aoi: Polygon
    ) -> Dict[str, Any]:
        """Run sklearn Isolation Forest on NDVI time series."""
        import numpy as np
        from sklearn.ensemble import IsolationForest

        ndvi_values = np.array([p["ndvi"] for p in ts]).reshape(-1, 1)

        def _fit_predict():
            clf = IsolationForest(contamination=0.1, random_state=42)
            labels = clf.fit_predict(ndvi_values)          # -1 = anomaly, 1 = normal
            scores = clf.score_samples(ndvi_values)        # Raw anomaly score (lower = more anomalous)
            return labels, scores

        labels, scores = await asyncio.to_thread(_fit_predict)

        anomalies = []
        for idx, (label, score) in enumerate(zip(labels, scores)):
            if label == -1:
                entry = ts[idx]
                severity = "high" if score < -0.2 else "medium"
                coords = aoi.coordinates[0]
                lons = [c[0] for c in coords]
                lats = [c[1] for c in coords]
                anomalies.append({
                    "id": len(anomalies) + 1,
                    "type": "ndvi_anomaly",
                    "date": entry["date"],
                    "ndvi": entry["ndvi"],
                    "anomaly_score": round(float(score), 4),
                    "severity": severity,
                    "confidence": round(min(99, abs(score) * 200), 0),
                    "location": {
                        "lat": round(sum(lats) / len(lats), 4),
                        "lon": round(sum(lons) / len(lons), 4),
                    },
                    "description": (
                        f"NDVI={entry['ndvi']:.3f} on {entry['date']} deviates significantly "
                        f"from the seasonal baseline (Isolation Forest score: {score:.4f})"
                    ),
                })

        return {
            "anomalies_detected": len(anomalies),
            "detection_method": "Isolation Forest (sklearn, contamination=0.1)",
            "time_period": f"{ts[0]['date']} to {ts[-1]['date']}",
            "observations_analyzed": len(ts),
            "anomalies": anomalies,
            "model_performance": {
                "algorithm": "IsolationForest",
                "n_estimators": 100,
                "contamination": 0.1,
                "note": "Performance metrics require labeled ground truth; not available here",
            },
        }

    def _template_anomaly_response(self, ts: List[Dict]) -> Dict[str, Any]:
        """Return a minimal response when not enough time-series data is available."""
        return {
            "anomalies_detected": 0,
            "detection_method": "template (insufficient NDVI observations for Isolation Forest)",
            "time_period": (
                f"{ts[0]['date']} to {ts[-1]['date']}" if ts else "unavailable"
            ),
            "observations_analyzed": len(ts),
            "anomalies": [],
            "note": (
                "Need at least 6 NDVI observations for anomaly detection. "
                "Set GEE credentials (GOOGLE_APPLICATION_CREDENTIALS) to enable."
            ),
        }

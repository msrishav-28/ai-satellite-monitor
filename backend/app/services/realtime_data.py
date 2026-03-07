"""
Real-time data service for WebSocket streaming.
All data comes from the database or real GEE/API sources — no random/simulated generation.
"""

import logging
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.environmental import EnvironmentalData
from app.models.hazards import HazardAlert
from app.services.environmental import EnvironmentalService

logger = logging.getLogger(__name__)


class RealtimeDataService:
    """Service for providing real-time data updates via WebSocket."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.environmental_service = EnvironmentalService(db)

        # Representative global monitoring locations
        self.monitored_locations = [
            {"name": "New York",       "lat": 40.7128,  "lon": -74.0060},
            {"name": "London",         "lat": 51.5074,  "lon":  -0.1278},
            {"name": "Tokyo",          "lat": 35.6762,  "lon": 139.6503},
            {"name": "Sydney",         "lat": -33.8688, "lon": 151.2093},
            {"name": "Mumbai",         "lat": 19.0760,  "lon":  72.8777},
            {"name": "São Paulo",      "lat": -23.5505, "lon": -46.6333},
            {"name": "Cairo",          "lat": 30.0444,  "lon":  31.2357},
            {"name": "Mexico City",    "lat": 19.4326,  "lon": -99.1332},
        ]

    async def get_environmental_updates(self) -> List[Dict[str, Any]]:
        """Fetch latest environmental data for all monitored locations from real APIs."""
        updates = []
        for location in self.monitored_locations:
            try:
                env_data = await self.environmental_service.get_environmental_data(
                    location["lat"], location["lon"]
                )
                updates.append({
                    "location": location,
                    "environmental_data": (
                        env_data.__dict__ if hasattr(env_data, "__dict__") else env_data
                    ),
                    "update_type": "realtime",
                    "timestamp": datetime.utcnow().isoformat(),
                })
                # Small rate-limit buffer between API calls
                await asyncio.sleep(0.3)
            except Exception as e:
                logger.warning(f"Environmental update failed for {location['name']}: {e}")
                continue
        return updates

    async def get_hazard_updates(self) -> List[Dict[str, Any]]:
        """
        Return recent hazard analyses from the database.
        Only DB records are returned — never fabricated events.
        """
        try:
            cutoff = datetime.utcnow() - timedelta(hours=24)
            stmt = (
                select(HazardAlert)
                .where(HazardAlert.issued_at >= cutoff)
                .order_by(HazardAlert.issued_at.desc())
                .limit(10)
            )
            result = await self.db.execute(stmt)
            alerts  = result.scalars().all()

            updates = []
            for alert in alerts:
                updates.append({
                    "location": {
                        "name": alert.location_name,
                        "lat":  alert.aoi_geometry.get("lat") if alert.aoi_geometry else None,
                        "lon":  alert.aoi_geometry.get("lon") if alert.aoi_geometry else None,
                    },
                    "hazard_type": alert.hazard_type.value,
                    "risk_level":  alert.risk_level.value,
                    "risk_score":  alert.severity,
                    "trend":       "increasing" if alert.severity and alert.severity > 60 else "stable",
                    "update_type": "db_alert",
                    "timestamp":   alert.issued_at.isoformat(),
                })
            return updates

        except Exception as e:
            logger.error(f"Error in get_hazard_updates: {e}")
            return []

    async def get_active_alerts(self) -> List[Dict[str, Any]]:
        """Return active alerts from the database. Returns [] if none exist — never fabricates."""
        try:
            current_time = datetime.utcnow()
            stmt = select(HazardAlert).where(
                and_(
                    HazardAlert.is_active == True,
                    HazardAlert.valid_until > current_time,
                )
            )
            result = await self.db.execute(stmt)
            db_alerts = result.scalars().all()

            alerts = []
            for alert in db_alerts:
                alerts.append({
                    "id":            str(alert.id),
                    "hazard_type":   alert.hazard_type.value,
                    "risk_level":    alert.risk_level.value,
                    "title":         alert.title,
                    "description":   alert.description,
                    "location_name": alert.location_name,
                    "severity":      alert.severity,
                    "urgency":       alert.urgency,
                    "issued_at":     alert.issued_at.isoformat(),
                    "valid_until":   alert.valid_until.isoformat() if alert.valid_until else None,
                    "aoi_geometry":  alert.aoi_geometry,
                    "alert_type":    "official",
                    "timestamp":     datetime.utcnow().isoformat(),
                })
            return alerts

        except Exception as e:
            logger.error(f"Error in get_active_alerts: {e}")
            return []

    async def get_satellite_updates(self) -> List[Dict[str, Any]]:
        """
        Query GEE for latest Sentinel-2 acquisition metadata for the first monitored location.
        Returns [] on GEE failure — never fabricates satellite names.
        """
        try:
            # Use GEE to check latest S2 image date — lazy import to avoid startup hang
            try:
                import ee
                from app.core.config import settings
            except ImportError:
                return []

            # Only attempt if GEE is already initialised (checked via the satellite service)
            from app.services.satellite_data import SatelliteDataService
            svc = SatelliteDataService()
            if not svc.gee_initialized:
                return []

            # Sample: check New York bbox for latest S2 scene
            loc = self.monitored_locations[0]
            point = ee.Geometry.Point([loc["lon"], loc["lat"]])

            def _fetch():
                s2 = (ee.ImageCollection("COPERNICUS/S2_SR")
                      .filterBounds(point)
                      .sort("system:time_start", False)
                      .limit(1))
                info = s2.getInfo()
                features = info.get("features", [])
                if not features:
                    return None
                props = features[0].get("properties", {})
                return props

            props = await asyncio.to_thread(_fetch)
            if not props:
                return []

            timestamp_ms = props.get("system:time_start", 0)
            acq_time = datetime.utcfromtimestamp(timestamp_ms / 1000).isoformat() if timestamp_ms else "unknown"
            cloud_pct = props.get("CLOUDY_PIXEL_PERCENTAGE", None)

            return [{
                "satellite":         "Sentinel-2 MSI",
                "data_type":         "optical_msi",
                "acquisition_time":  acq_time,
                "coverage_area":     loc["name"],
                "cloud_coverage":    round(cloud_pct, 1) if cloud_pct is not None else None,
                "data_quality":      "excellent" if cloud_pct is not None and cloud_pct < 5 else "good",
                "processing_level":  "L2A",
                "availability":      "immediate",
                "update_type":       "new_data_available",
                "timestamp":         datetime.utcnow().isoformat(),
            }]

        except Exception as e:
            logger.warning(f"Satellite update check failed: {e}")
            return []

    async def send_timelapse_progress_update(self, request_id: str, stage: str, progress: int):
        """Broadcast time-lapse generation progress to WebSocket subscribers."""
        try:
            from app.websocket.manager import connection_manager
            await connection_manager.broadcast_to_subscribers({
                "type":       "timelapse_progress",
                "request_id": request_id,
                "stage":      stage,
                "progress":   progress,
                "timestamp":  datetime.utcnow().isoformat(),
            }, "timelapse_progress")
        except Exception as e:
            logger.error(f"Error sending timelapse progress update: {e}")

    async def send_custom_alert(self, alert_data: Dict[str, Any]):
        """Broadcast a custom alert to all alert subscribers."""
        try:
            from app.websocket.manager import connection_manager
            alert_data.update({
                "alert_type": "custom",
                "timestamp":  datetime.utcnow().isoformat(),
            })
            await connection_manager.broadcast_to_subscribers(
                {"type": "alert", "data": alert_data}, "alerts"
            )
        except Exception as e:
            logger.error(f"Error sending custom alert: {e}")

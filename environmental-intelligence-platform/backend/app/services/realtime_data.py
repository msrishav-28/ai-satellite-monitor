"""
Real-time data service for WebSocket streaming
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
    """Service for providing real-time data updates via WebSocket"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.environmental_service = EnvironmentalService(db)
        
        # Popular locations for global monitoring
        self.monitored_locations = [
            {"name": "New York", "lat": 40.7128, "lon": -74.0060},
            {"name": "London", "lat": 51.5074, "lon": -0.1278},
            {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503},
            {"name": "Sydney", "lat": -33.8688, "lon": 151.2093},
            {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
            {"name": "São Paulo", "lat": -23.5505, "lon": -46.6333},
            {"name": "Cairo", "lat": 30.0444, "lon": 31.2357},
            {"name": "Mexico City", "lat": 19.4326, "lon": -99.1332}
        ]
    
    async def get_environmental_updates(self) -> List[Dict[str, Any]]:
        """Get latest environmental data updates for monitored locations"""
        updates = []
        
        try:
            for location in self.monitored_locations:
                try:
                    # Get latest environmental data
                    env_data = await self.environmental_service.get_environmental_data(
                        location["lat"], location["lon"]
                    )
                    
                    # Add location info
                    update = {
                        "location": location,
                        "environmental_data": env_data.__dict__ if hasattr(env_data, '__dict__') else env_data,
                        "update_type": "routine",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    updates.append(update)
                    
                    # Small delay to avoid overwhelming APIs
                    await asyncio.sleep(0.5)
                    
                except Exception as e:
                    logger.error(f"Error getting data for {location['name']}: {e}")
                    continue
            
            return updates
            
        except Exception as e:
            logger.error(f"Error in get_environmental_updates: {e}")
            return []
    
    async def get_hazard_updates(self) -> List[Dict[str, Any]]:
        """Get latest hazard analysis updates"""
        updates = []
        
        try:
            # Query recent hazard analyses from database
            cutoff_time = datetime.utcnow() - timedelta(hours=1)
            
            # This would query actual hazard analysis results
            # For now, return simulated updates
            
            # Simulate some hazard updates
            simulated_updates = [
                {
                    "location": {"name": "California", "lat": 36.7783, "lon": -119.4179},
                    "hazard_type": "wildfire",
                    "risk_level": "high",
                    "risk_score": 78,
                    "trend": "increasing",
                    "factors": ["High temperature", "Low humidity", "Strong winds"],
                    "update_type": "risk_increase",
                    "timestamp": datetime.utcnow().isoformat()
                },
                {
                    "location": {"name": "Bangladesh", "lat": 23.6850, "lon": 90.3563},
                    "hazard_type": "flood",
                    "risk_level": "moderate",
                    "risk_score": 65,
                    "trend": "stable",
                    "factors": ["Monsoon season", "River levels"],
                    "update_type": "routine_monitoring",
                    "timestamp": datetime.utcnow().isoformat()
                }
            ]
            
            # Only return updates if there are actual changes
            import random
            if random.random() < 0.3:  # 30% chance of having updates
                updates.extend(simulated_updates[:random.randint(1, 2)])
            
            return updates
            
        except Exception as e:
            logger.error(f"Error in get_hazard_updates: {e}")
            return []
    
    async def get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get active emergency alerts and warnings"""
        alerts = []
        
        try:
            # Query active alerts from database
            current_time = datetime.utcnow()
            
            stmt = select(HazardAlert).where(
                and_(
                    HazardAlert.is_active == True,
                    HazardAlert.valid_until > current_time
                )
            )
            
            result = await self.db.execute(stmt)
            db_alerts = result.scalars().all()
            
            for alert in db_alerts:
                alert_data = {
                    "id": str(alert.id),
                    "hazard_type": alert.hazard_type.value,
                    "risk_level": alert.risk_level.value,
                    "title": alert.title,
                    "description": alert.description,
                    "location_name": alert.location_name,
                    "severity": alert.severity,
                    "urgency": alert.urgency,
                    "issued_at": alert.issued_at.isoformat(),
                    "valid_until": alert.valid_until.isoformat() if alert.valid_until else None,
                    "aoi_geometry": alert.aoi_geometry,
                    "alert_type": "official",
                    "timestamp": datetime.utcnow().isoformat()
                }
                alerts.append(alert_data)
            
            # Add simulated global alerts if no real alerts
            if not alerts:
                simulated_alerts = await self._get_simulated_alerts()
                alerts.extend(simulated_alerts)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error in get_active_alerts: {e}")
            return []
    
    async def _get_simulated_alerts(self) -> List[Dict[str, Any]]:
        """Generate simulated alerts for demonstration"""
        import random
        
        # Only occasionally generate alerts
        if random.random() > 0.1:  # 10% chance
            return []
        
        alert_templates = [
            {
                "hazard_type": "wildfire",
                "risk_level": "high",
                "title": "Red Flag Warning - Extreme Fire Danger",
                "description": "Critical fire weather conditions with high winds and low humidity. Avoid all outdoor burning.",
                "location_name": "Southern California",
                "severity": "severe",
                "urgency": "immediate"
            },
            {
                "hazard_type": "flood",
                "risk_level": "moderate",
                "title": "Flood Watch - Heavy Rainfall Expected",
                "description": "Heavy rainfall may cause flooding in low-lying areas. Monitor local conditions.",
                "location_name": "Mississippi River Basin",
                "severity": "moderate",
                "urgency": "expected"
            },
            {
                "hazard_type": "heatwave",
                "risk_level": "high",
                "title": "Excessive Heat Warning",
                "description": "Dangerous heat with temperatures exceeding 40°C. Take precautions to avoid heat illness.",
                "location_name": "Phoenix, Arizona",
                "severity": "severe",
                "urgency": "immediate"
            }
        ]
        
        # Select random alert
        template = random.choice(alert_templates)
        
        alert = {
            "id": f"sim_{random.randint(1000, 9999)}",
            "hazard_type": template["hazard_type"],
            "risk_level": template["risk_level"],
            "title": template["title"],
            "description": template["description"],
            "location_name": template["location_name"],
            "severity": template["severity"],
            "urgency": template["urgency"],
            "issued_at": datetime.utcnow().isoformat(),
            "valid_until": (datetime.utcnow() + timedelta(hours=12)).isoformat(),
            "aoi_geometry": None,
            "alert_type": "simulated",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return [alert]
    
    async def get_satellite_updates(self) -> List[Dict[str, Any]]:
        """Get updates about new satellite data availability"""
        updates = []
        
        try:
            # Simulate satellite data availability updates
            import random
            
            if random.random() < 0.2:  # 20% chance of new data
                satellites = ["Sentinel-2A", "Sentinel-2B", "Landsat-8", "Landsat-9"]
                satellite = random.choice(satellites)
                
                update = {
                    "satellite": satellite,
                    "data_type": "optical",
                    "acquisition_time": datetime.utcnow().isoformat(),
                    "coverage_area": "Global",
                    "cloud_coverage": random.randint(5, 30),
                    "data_quality": random.choice(["excellent", "good", "fair"]),
                    "processing_level": "L2A",
                    "availability": "immediate",
                    "update_type": "new_data_available",
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                updates.append(update)
            
            return updates
            
        except Exception as e:
            logger.error(f"Error in get_satellite_updates: {e}")
            return []
    
    async def send_timelapse_progress_update(self, request_id: str, stage: str, progress: int):
        """Send time-lapse generation progress update"""
        try:
            from app.websocket.manager import connection_manager
            
            await connection_manager.broadcast_to_subscribers({
                'type': 'timelapse_progress',
                'request_id': request_id,
                'stage': stage,
                'progress': progress,
                'timestamp': datetime.utcnow().isoformat()
            }, 'timelapse_progress')
            
        except Exception as e:
            logger.error(f"Error sending time-lapse progress update: {e}")
    
    async def send_custom_alert(self, alert_data: Dict[str, Any]):
        """Send a custom alert to all alert subscribers"""
        try:
            from app.websocket.manager import connection_manager
            
            alert_data.update({
                'alert_type': 'custom',
                'timestamp': datetime.utcnow().isoformat()
            })
            
            await connection_manager.broadcast_to_subscribers({
                'type': 'alert',
                'data': alert_data
            }, 'alerts')
            
        except Exception as e:
            logger.error(f"Error sending custom alert: {e}")

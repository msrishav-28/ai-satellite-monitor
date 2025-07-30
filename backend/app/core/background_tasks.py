"""
Simple background task manager to replace Celery
"""

import asyncio
import logging
from typing import Dict, List, Callable, Any
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)


class BackgroundTaskManager:
    """Simple background task manager for periodic tasks"""
    
    def __init__(self):
        self.tasks: Dict[str, asyncio.Task] = {}
        self.running = False
    
    async def start(self):
        """Start background task manager"""
        if not settings.ENABLE_BACKGROUND_TASKS:
            logger.info("Background tasks disabled")
            return
            
        self.running = True
        logger.info("Background task manager started")
    
    async def stop(self):
        """Stop all background tasks"""
        self.running = False
        
        # Cancel all running tasks
        for task_name, task in self.tasks.items():
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    logger.info(f"Background task '{task_name}' cancelled")
        
        self.tasks.clear()
        logger.info("Background task manager stopped")
    
    def add_periodic_task(
        self, 
        name: str, 
        func: Callable, 
        interval: int, 
        *args, 
        **kwargs
    ):
        """Add a periodic task"""
        if not settings.ENABLE_BACKGROUND_TASKS:
            return
            
        if name in self.tasks:
            logger.warning(f"Task '{name}' already exists, skipping")
            return
        
        task = asyncio.create_task(
            self._run_periodic_task(name, func, interval, *args, **kwargs)
        )
        self.tasks[name] = task
        logger.info(f"Added periodic task '{name}' with {interval}s interval")
    
    async def _run_periodic_task(
        self, 
        name: str, 
        func: Callable, 
        interval: int, 
        *args, 
        **kwargs
    ):
        """Run a periodic task"""
        while self.running:
            try:
                start_time = datetime.utcnow()
                
                # Run the task function
                if asyncio.iscoroutinefunction(func):
                    await func(*args, **kwargs)
                else:
                    func(*args, **kwargs)
                
                execution_time = (datetime.utcnow() - start_time).total_seconds()
                logger.debug(f"Task '{name}' completed in {execution_time:.2f}s")
                
                # Wait for the next execution
                await asyncio.sleep(interval)
                
            except asyncio.CancelledError:
                logger.info(f"Periodic task '{name}' cancelled")
                break
            except Exception as e:
                logger.error(f"Error in periodic task '{name}': {e}")
                # Wait before retrying
                await asyncio.sleep(min(interval, 60))
    
    def get_task_status(self) -> Dict[str, Any]:
        """Get status of all background tasks"""
        status = {}
        for name, task in self.tasks.items():
            status[name] = {
                'running': not task.done(),
                'cancelled': task.cancelled(),
                'exception': str(task.exception()) if task.done() and task.exception() else None
            }
        return status


# Global task manager instance
task_manager = BackgroundTaskManager()


# Convenience functions for common background tasks
async def schedule_data_refresh():
    """Schedule periodic data refresh tasks"""
    if not settings.ENABLE_BACKGROUND_TASKS:
        return
    
    # Add common background tasks
    task_manager.add_periodic_task(
        "environmental_data_refresh",
        refresh_environmental_data,
        300  # 5 minutes
    )
    
    task_manager.add_periodic_task(
        "model_health_check",
        check_model_health,
        600  # 10 minutes
    )
    
    task_manager.add_periodic_task(
        "cleanup_old_data",
        cleanup_old_data,
        3600  # 1 hour
    )


async def refresh_environmental_data():
    """Refresh cached environmental data for popular locations"""
    try:
        from app.services.environmental import EnvironmentalService
        from app.core.database import AsyncSessionLocal
        from app.core.cache import cache
        
        # Popular locations to keep fresh
        locations = [
            {"lat": 37.7749, "lon": -122.4194, "name": "San Francisco"},
            {"lat": 40.7128, "lon": -74.0060, "name": "New York"},
            {"lat": 51.5074, "lon": -0.1278, "name": "London"},
            {"lat": 35.6762, "lon": 139.6503, "name": "Tokyo"},
        ]
        
        async with AsyncSessionLocal() as db:
            service = EnvironmentalService(db)
            
            for location in locations:
                try:
                    # Refresh weather data
                    weather_key = f"weather:{location['lat']}:{location['lon']}"
                    weather_data = await service.get_weather_data(
                        location['lat'], location['lon']
                    )
                    await cache.set(weather_key, weather_data, 300)
                    
                    # Refresh AQI data
                    aqi_key = f"aqi:{location['lat']}:{location['lon']}"
                    aqi_data = await service.get_aqi_data(
                        location['lat'], location['lon']
                    )
                    await cache.set(aqi_key, aqi_data, 300)
                    
                except Exception as e:
                    logger.error(f"Error refreshing data for {location['name']}: {e}")
        
        logger.debug("Environmental data refresh completed")
        
    except Exception as e:
        logger.error(f"Error in environmental data refresh: {e}")


async def check_model_health():
    """Check health of ML models"""
    try:
        from app.ml.model_manager import model_manager
        
        health_status = await model_manager.health_check()
        
        # Log any unhealthy models
        for model_name, status in health_status.items():
            if isinstance(status, dict) and not status.get('healthy', True):
                logger.warning(f"Model '{model_name}' is unhealthy: {status}")
        
        logger.debug("Model health check completed")
        
    except Exception as e:
        logger.error(f"Error in model health check: {e}")


async def cleanup_old_data():
    """Clean up old data and temporary files"""
    try:
        import os
        import time
        
        # Clean up old temporary files (older than 24 hours)
        temp_dirs = ["uploads", "temp", "cache"]
        current_time = time.time()
        
        for temp_dir in temp_dirs:
            if os.path.exists(temp_dir):
                for filename in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, filename)
                    if os.path.isfile(file_path):
                        file_age = current_time - os.path.getmtime(file_path)
                        if file_age > 86400:  # 24 hours
                            try:
                                os.remove(file_path)
                                logger.debug(f"Removed old file: {file_path}")
                            except Exception as e:
                                logger.error(f"Error removing file {file_path}: {e}")
        
        logger.debug("Data cleanup completed")
        
    except Exception as e:
        logger.error(f"Error in data cleanup: {e}")


# Export the task manager
__all__ = ['task_manager', 'schedule_data_refresh']

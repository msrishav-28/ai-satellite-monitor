"""
Environmental Intelligence Platform - Backend API
FastAPI backend for real-time environmental analysis and hazard prediction
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.core.cache import cache
from app.core.background_tasks import task_manager, schedule_data_refresh
from app.api.v1.api import api_router
from app.core.logging import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Environmental Intelligence Platform Backend")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database tables created successfully")

    # Start cache
    await cache.start()
    logger.info("Cache system initialized")

    # Start background tasks
    await task_manager.start()
    await schedule_data_refresh()
    logger.info("Background task manager initialized")
    
    yield
    
    # Shutdown
    await task_manager.stop()
    await cache.stop()
    logger.info("Shutting down Environmental Intelligence Platform Backend")


# Create FastAPI application
app = FastAPI(
    title="Environmental Intelligence Platform API",
    description="AI-powered platform for real-time environmental analysis and multi-hazard prediction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Environmental Intelligence Platform API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        from datetime import datetime

        # Check database connection
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")

        # Check ML models status
        from app.ml.model_manager import model_manager
        model_health = await model_manager.health_check()

        # Check WebSocket status
        from app.websocket.manager import connection_manager
        ws_status = {
            'active_connections': connection_manager.get_connection_count(),
            'status': 'operational'
        }

        # Check cache status
        cache_status = cache.get_stats()

        # Check background tasks status
        bg_tasks_status = task_manager.get_task_status()

        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": "1.0.0",
            "components": {
                "database": "healthy",
                "ml_models": model_health.get('overall_health', 'unknown'),
                "websockets": ws_status['status'],
                "cache": "healthy" if cache_status['cache_enabled'] else "disabled",
                "background_tasks": "healthy" if task_manager.running else "stopped"
            },
            "details": {
                "ml_models": model_health,
                "websockets": ws_status,
                "cache": cache_status,
                "background_tasks": bg_tasks_status
            }
        }

    except Exception as e:
        from datetime import datetime
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "error": str(e),
            "components": {
                "database": "unknown",
                "ml_models": "unknown",
                "websockets": "unknown"
            }
        }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )

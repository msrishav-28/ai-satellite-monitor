"""
Environmental Intelligence Platform - Backend API
FastAPI backend for real-time environmental analysis and hazard prediction
"""

from fastapi import FastAPI, Request
from sqlalchemy import text
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
from app.core.exceptions import GEEDataUnavailableError, ExternalAPIError, MLModelError

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting Environmental Intelligence Platform Backend")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully")

    # Start cache
    await cache.start()
    logger.info("Cache system initialized")

    # Initialize ML models (auto-trains from synthetic data if .pkl absent)
    try:
        from app.ml.model_manager import ModelManager
        _mm = ModelManager(model_dir=settings.MODEL_DIR)
        await _mm.initialize_models()
        app.state.model_manager = _mm
        logger.info("ML models initialized")
    except Exception as e:
        logger.error(f"ML model initialization failed: {e}")

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


# ------------------------------------------------------------------
# Global exception handlers — typed errors map to proper HTTP codes
# ------------------------------------------------------------------

@app.exception_handler(GEEDataUnavailableError)
async def gee_unavailable_handler(request: Request, exc: GEEDataUnavailableError):
    return JSONResponse(
        status_code=503,
        content={"detail": exc.message, "error_type": "GEEDataUnavailableError"},
    )


@app.exception_handler(ExternalAPIError)
async def external_api_error_handler(request: Request, exc: ExternalAPIError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": str(exc),
            "service": exc.service,
            "error_type": "ExternalAPIError",
        },
    )


@app.exception_handler(MLModelError)
async def ml_model_error_handler(request: Request, exc: MLModelError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": str(exc),
            "model": exc.model_name,
            "error_type": "MLModelError",
        },
    )


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
            await conn.execute(text("SELECT 1"))

        # Check ML models status
        # ML model status
        mm = getattr(app.state, "model_manager", None)
        model_status = mm.get_status() if mm else {"models_loaded": {}, "note": "not yet initialized"}

        # Check WebSocket status
        from app.websocket.manager import connection_manager
        ws_status = {
            'active_connections': connection_manager.get_connection_count(),
            'status': 'operational'
        }

        # Check cache status
        cache_status = cache.get_stats()

        # Check background tasks
        bg_tasks_status = task_manager.get_task_status()

        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": "1.0.0",
            "components": {
                "database": "healthy",
                "ml_models": "ready" if mm and all(model_status["models_loaded"].values()) else "initializing",
                "websockets": ws_status["status"],
                "cache": "healthy" if cache_status.get("cache_enabled") else "disabled",
                "background_tasks": "healthy" if task_manager.running else "stopped",
            },
            "details": {
                "ml_models": model_status,
                "websockets": ws_status,
                "cache": cache_status,
                "background_tasks": bg_tasks_status,
            },
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

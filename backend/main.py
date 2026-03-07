"""
Environmental Intelligence Platform - Backend API
FastAPI backend for real-time environmental analysis and hazard prediction
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.bootstrap import shutdown_runtime, startup_runtime
from app.core.logging import setup_logging
from app.core.exceptions import GEEDataUnavailableError, ExternalAPIError, MLModelError
from app.core.health import build_dependencies_health, build_live_health, build_ready_health

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    await startup_runtime(app)
    yield
    await shutdown_runtime()


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
    """Backward-compatible readiness health endpoint."""
    return await build_ready_health(app)


@app.get("/health/live")
async def health_live():
    """Liveness health endpoint."""
    return await build_live_health()


@app.get("/health/ready")
async def health_ready():
    """Readiness health endpoint."""
    return await build_ready_health(app)


@app.get("/health/dependencies")
async def health_dependencies():
    """Dependency health endpoint."""
    return await build_dependencies_health(app)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )

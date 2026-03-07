"""Health check helpers for liveness, readiness, and dependencies."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from fastapi import FastAPI
from sqlalchemy import text

from app.core.background_tasks import task_manager
from app.core.cache import cache
from app.core.config import settings
from app.core.database import engine
from app.core.runtime import build_provider_status
from app.websocket.manager import connection_manager


def _timestamp() -> str:
    return datetime.utcnow().isoformat() + "Z"


async def build_live_health() -> Dict[str, Any]:
    return {
        "status": "alive",
        "timestamp": _timestamp(),
        "environment": settings.RUNTIME_ENV,
        "version": settings.VERSION,
    }


async def build_dependencies_health(app: FastAPI) -> Dict[str, Any]:
    dependencies: Dict[str, Any] = {
        "database": {"status": "unhealthy"},
        "redis": {
            "status": "ready" if settings.REDIS_URL else ("local_in_memory" if settings.RUNTIME_ENV == "local" else "missing"),
            "url": settings.REDIS_URL,
        },
        "celery_broker": {"status": "ready" if settings.CELERY_BROKER_URL else "missing"},
        "celery_workers": {
            "status": "local_in_process" if settings.RUNTIME_ENV == "local" else "external_required"
        },
        "model_manager": {"status": "ready" if getattr(app.state, "model_manager", None) else "initializing"},
        "websocket_manager": {
            "status": "ready",
            "active_connections": connection_manager.get_connection_count(),
        },
        "providers": build_provider_status(),
    }

    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        dependencies["database"] = {"status": "ready"}
    except Exception as exc:
        dependencies["database"] = {"status": "unhealthy", "detail": str(exc)}

    return {
        "status": "ready" if dependencies["database"]["status"] == "ready" else "degraded",
        "timestamp": _timestamp(),
        "dependencies": dependencies,
    }


async def build_ready_health(app: FastAPI) -> Dict[str, Any]:
    dependency_status = await build_dependencies_health(app)
    model_manager = getattr(app.state, "model_manager", None)
    model_status = model_manager.get_status() if model_manager else {"models_loaded": {}, "note": "not yet initialized"}

    return {
        "status": "ready" if dependency_status["status"] == "ready" else "degraded",
        "timestamp": _timestamp(),
        "version": settings.VERSION,
        "components": {
            "database": dependency_status["dependencies"]["database"]["status"],
            "ml_models": "ready" if model_manager else "initializing",
            "websockets": "ready",
            "cache": "healthy" if cache.get_stats().get("cache_enabled") else "disabled",
            "background_tasks": "healthy" if task_manager.running else "stopped",
        },
        "details": {
            "ml_models": model_status,
            "cache": cache.get_stats(),
            "background_tasks": task_manager.get_task_status(),
            "dependencies": dependency_status["dependencies"],
        },
    }

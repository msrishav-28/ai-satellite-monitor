"""Application bootstrap helpers."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI

from app.core.background_tasks import schedule_data_refresh, task_manager
from app.core.cache import cache
from app.core.config import settings
from app.core.runtime import validate_runtime_environment

logger = logging.getLogger(__name__)


def _alembic_config() -> Config:
    backend_dir = Path(__file__).resolve().parents[2]
    config = Config(str(backend_dir / "alembic.ini"))
    config.set_main_option("script_location", str(backend_dir / "migrations"))
    return config


async def run_database_migrations() -> None:
    """Apply Alembic migrations before the app starts serving traffic."""
    await asyncio.to_thread(command.upgrade, _alembic_config(), "head")


async def startup_runtime(app: FastAPI) -> None:
    """Initialize runtime dependencies."""
    logger.info("Starting Environmental Intelligence Platform Backend")
    validate_runtime_environment()
    await run_database_migrations()
    logger.info("Database migrations applied successfully")

    await cache.start()
    logger.info("Cache system initialized")

    try:
        from app.ml.model_manager import ModelManager

        model_manager = ModelManager(model_dir=settings.MODEL_DIR)
        await model_manager.initialize_models()
        app.state.model_manager = model_manager
        logger.info("ML models initialized")
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.error("ML model initialization failed: %s", exc)

    if settings.RUNTIME_ENV == "local":
        await task_manager.start()
        await schedule_data_refresh()
        logger.info("Local background task manager initialized")
    else:
        logger.info("Skipping in-process background tasks outside local runtime; use Celery workers instead")


async def shutdown_runtime() -> None:
    """Shutdown runtime dependencies."""
    await task_manager.stop()
    await cache.stop()
    logger.info("Shutting down Environmental Intelligence Platform Backend")

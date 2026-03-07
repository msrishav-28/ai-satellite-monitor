"""Celery application wiring for worker-based background tasks."""

from __future__ import annotations

from celery import Celery
from kombu import Queue

from app.core.config import settings
from app.tasks.queues import ALL_QUEUES

celery_app = Celery(
    "ai_satellite_monitor",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)
celery_app.conf.task_default_queue = ALL_QUEUES[0]
celery_app.conf.task_queues = tuple(Queue(queue_name) for queue_name in ALL_QUEUES)

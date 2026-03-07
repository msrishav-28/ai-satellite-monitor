# Backend Architecture

## Request flow
1. FastAPI routes accept HTTP requests and validate input.
2. Route handlers delegate to service-layer orchestration.
3. Services call provider adapters for external requests and repositories / database for persistence.
4. Health endpoints expose liveness, readiness, and dependency state separately.

## Runtime flow
- `app/core/bootstrap.py` validates the runtime tier before startup.
- Alembic migrations are applied during startup instead of calling `Base.metadata.create_all()`.
- Cache starts in-process for local development.
- In-process background tasks run only in `local`; staging and production are expected to use Celery workers.

## Dependency graph
- `main.py` -> `bootstrap.py` / `health.py`
- `services/weather.py` -> `providers/openweather/client.py`
- `services/environmental.py` -> `providers/openweather/client.py` and `providers/aqicn/client.py`
- `data_sources` endpoint -> `runtime.py` provider status matrix

## Data lifecycle
- Provider request builders normalize auth wiring.
- Services transform provider payloads into internal response structures.
- Database schema changes flow through Alembic migrations under `backend/migrations/`.

## Event lifecycle
- WebSocket state remains operational metadata only.
- Long-running job execution is expected to move to Celery queues: `analysis`, `imagery`, `ingestion`, `narrative`, and `maintenance`.

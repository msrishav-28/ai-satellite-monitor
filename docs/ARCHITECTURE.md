## Architecture Overview

The platform is structured as a modular, mock-first, progressively live geospatial intelligence system.

### High-Level Diagram (Conceptual)

Frontend (Next.js) ⇄ REST / WebSocket API (FastAPI) → Services Layer → (Mocks | External APIs | Future ML Models)
												  ↘ Background Tasks / Cache

### Frontend Layer
* Next.js + TypeScript, Mapbox GL for map/globe.
* Hooks per data domain (`useEnvironmentalData`, `useHazardPrediction`, `useSatelliteData`).
* WebSocket subscription manager for real-time pushes.
* Zustand stores for state (map state, hazard data, environmental metrics).

### API Layer (`backend/app/api/v1/`)
* Versioned routers group endpoints: environmental, hazards, satellite, impact, ai-insights, air-quality, data-sources.
* Consistent response schemas via Pydantic.

### Services Layer (`backend/app/services/`)
| Service | Responsibility | Live Inputs | Mock Fallback |
|---------|----------------|------------|---------------|
| environmental.py | Weather & AQI aggregation | OpenWeatherMap, WAQI | Deterministic sample data |
| satellite_data.py | AOI metrics (NDVI, LST, precip, DEM) | Google Earth Engine collections | Synthetic dataset |
| hazard_models.py | Orchestrates multi-hazard risk assembly | (Future) real model outputs | Heuristic synthetic scores |
| realtime_data.py | Periodic updates for streaming | Same APIs as above | Simulated updates & alerts |
| ml_models.py | Model inference abstraction | Future model manager | Default / fallback inference |

Feature flags (`FORCE_MOCK_*`) short-circuit calls to guarantee schema-stable results even if external services are down.

### Core Layer (`backend/app/core/`)
* `config.py` – Centralized settings + flags.
* `cache.py` – In-memory caching interface (swap to Redis later).
* `background_tasks.py` – Scheduler for periodic refresh hooks.
* `logging.py` – Structured logging setup.
* `database.py` – Async SQLAlchemy + SQLite default (upgrade path to Postgres).

### ML Layer (`backend/app/ml/`)
* Placeholder model wrappers & manager pattern for future real model loading & versioning.
* All predictions marked mock unless `FORCE_MOCK_MODELS=false` and real models implemented.

### WebSocket System (`backend/app/websocket/`)
* Connection manager tracks channels (alerts, timelapse progress, environmental stream).
* Services broadcast structured event payloads; frontend updates stores.

### Data Flow (Example: Hazard Analysis)
1. Frontend posts AOI polygon.
2. `hazard_models` requests satellite metrics (live or mock).
3. Extracts features → calls ML model service (mock or real).
4. Aggregates risk objects, computes overall risk & priority list.
5. Returns JSON; optionally broadcasts summary via WebSocket.

### Mock-First Guardrails
* Every external integration has: (a) availability check, (b) structured fallback.
* Health endpoint `/api/v1/data-sources/health` exposes mode (live/mocked/forced).
* Enables rapid UI development & demo reliability.

### Scaling Path
| Layer | Current | Scale Upgrade |
|-------|---------|---------------|
| DB | SQLite | Postgres + read replicas |
| Cache | In-memory | Redis cluster |
| Background Tasks | In-process | Celery / Dramatiq workers |
| Model Inference | Sync CPU | Async GPU workers / microservice |
| Satellite Processing | On-demand reduceRegion | Precomputed tiles / STAC indexing |
| WebSocket | Single instance | Pub/Sub (Redis / NATS) broadcast |

### Observability Roadmap
* Add metrics: request latency, external API error count, cache hit rate.
* Structured JSON logs with correlation IDs.
* Tracing (OpenTelemetry) for multi-service spans when external APIs added.

### Security Considerations
* Secrets only via environment variables.
* CORS restricted via `settings.ALLOWED_HOSTS` (tighten for prod).
* Input validation through Pydantic schemas.
* Future: auth (JWT), rate limiting, role-based access for sensitive hazard analytics.

### Future Extensions
* Real ML model registry with version tags + metrics.
* Exposure analytics (population, infrastructure intersections).
* Change detection & burn severity indices.
* Streaming ingestion pipelines (Kafka / PubSub) for near-real-time feeds.

---
For operational deployment specifics see `docs/DEPLOYMENT.md` and production hardening in `docs/PRODUCTION_CHECKLIST.md`.

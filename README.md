# Environmental Intelligence Platform

AI‑assisted geospatial monitoring and multi‑hazard risk assessment platform with a **mock‑first, live‑upgrade** design. Ships working dashboards immediately (using deterministic mock data) and progressively unlocks real data sources (weather, air quality, satellite, models) as you add API keys.

> Goal: Fast demo & development experience today; smooth path to production‑grade, live geospatial intelligence tomorrow.

## 🌍 Key User Value
| Capability | What Users See | Utility |
|------------|----------------|---------|
| Live / Mock Weather & AQI | Current conditions & air quality index | Situational awareness & health risk context |
| Multi‑Hazard Risk Scores | Wildfire / Flood / Landslide metrics + factors | Prioritize monitoring & mitigation |
| Vegetation & Environmental Metrics | NDVI, LST, precipitation, moisture (mock or GEE) | Assess stress, fuel conditions, terrain risk |
| Timelapse Imagery (scaffold) | Chronological scene list for AOI | Detect change (burn, deforestation, flood extent) |
| Real‑Time Feed (WebSocket) | Streaming environmental & hazard updates | Live dashboard / alerting |
| Priority Hazards Summary | Top risks + overall composite | Rapid command briefing |
| Source Health Panel | Live vs mock status per data source | Trust & diagnostics |

## 🧱 Architecture Snapshot

Frontend (Next.js + TypeScript)
* Mapbox globe / map (AOI selection, overlays)
* Zustand for state stores (data + map)
* Hooks per domain (`useHazardPrediction`, `useEnvironmentalData`, etc.)
* WebSocket client for push updates

Backend (FastAPI)
* Layered modules: API routers → services → core (config/cache/background) → ML & satellite helpers
* SQLite (default) + in‑memory cache for zero‑setup dev; can swap to Postgres / Redis later
* Background task manager for scheduled refresh / future ingestion
* Feature flags to force mocks even when credentials exist

Data Source Modes (see `docs/DATA_SOURCES.md`)
* Weather: OpenWeatherMap (live) or structured mock
* Air Quality: WAQI (live) or mock
* Satellite: Google Earth Engine (Sentinel‑2, MODIS, GPM, SRTM) OR synthetic dataset
* Models: Currently heuristic / synthetic; real models pluggable via `model_manager`

## 🔁 Mock‑First Philosophy
The platform **never breaks** if external APIs fail or keys are missing:
* Each service returns schema‑stable mock objects
* Flags: `FORCE_MOCK_WEATHER`, `FORCE_MOCK_AQI`, `FORCE_MOCK_SATELLITE`, `FORCE_MOCK_MODELS`
* Health endpoint: `/api/v1/data-sources/health` reports configured vs live vs forced mock

## 🚀 Quick Start (Dev)
Prerequisites: Node.js 18+, Python 3.11+, (optional) earthengine-api

```bash
git clone <repo-url>
cd ai-satellite-monitor
./scripts/setup-dev.sh         # installs frontend & backend deps
./scripts/start-dev.sh         # starts backend:8000 + frontend:3000
```
Open http://localhost:3000 (frontend) and http://localhost:8000/docs (API docs).

Add API keys later by editing `backend/.env` & `frontend/.env.local` (see below / DATA_SOURCES doc).

## 🔑 Enable Live Data
Set these (at minimum) and restart backend:
```env
OPENWEATHER_API_KEY=...
WAQI_API_KEY=...
FORCE_MOCK_WEATHER=false
FORCE_MOCK_AQI=false
```
Optional satellite (service account):
```env
GEE_SERVICE_ACCOUNT_KEY=/abs/path/key.json
GEE_PROJECT_ID=your-project
FORCE_MOCK_SATELLITE=false
```
Models (later): `FORCE_MOCK_MODELS=false`

Verify: `GET /api/v1/data-sources/health` → fields show `live: true` where enabled.

Full details: `docs/DATA_SOURCES.md` & `docs/API_KEYS_SETUP.md`.

## 📂 Important Directories
| Path | Purpose |
|------|---------|
| `backend/app/services/` | Weather, AQI, satellite, hazard model orchestration |
| `backend/app/ml/` | Model wrappers / (future) real inference |
| `backend/app/core/` | Config, cache, logging, background tasks |
| `backend/app/api/v1/` | Versioned API routers |
| `frontend/src/hooks/` | Domain‑specific data hooks |
| `frontend/src/store/` | Zustand state stores |
| `docs/` | Architecture, data sources, deployment guides |

## 🧪 Testing (Planned)
Baseline tests for services & mock/live parity are a priority roadmap item (not yet included). Suggested structure: `backend/tests/` with fixtures for forcing mock flags.

## 🛣️ Roadmap Highlights
Short Term:
* Land cover histogram (ESA WorldCover) live
* SMAP soil moisture integration
* Fire hotspots (VIIRS) counts
* Exposure analytics (population intersect)
* Auth & user roles

Medium Term:
* Real ML model deployment (versioned)
* Persistent risk time series
* Change detection / burn severity indices
* Improved timelapse rendering pipeline

## 🩺 Health & Ops
* App health: `GET /health`
* Data source status: `GET /api/v1/data-sources/health`
* Logs: `backend/logs/app.log`

## ⚖️ License / Attribution
See `LICENSE`. External data sources governed by their respective terms (OpenWeatherMap, WAQI, Google Earth Engine dataset licenses, etc.).

## 🤝 Contributing
See `docs/CONTRIBUTING.md` for branching, commit style, and adding new data sources.

## ❓ FAQ (Quick)
**Why am I seeing stable numbers?** You’re in mock mode—add keys & disable FORCE_MOCK flags.
**Do I need Postgres/Redis?** Not for dev; upgrade for production scale.
**Can I enable only weather live?** Yes—set weather key & leave others mocked.

---
For detailed system design see `docs/ARCHITECTURE.md`.
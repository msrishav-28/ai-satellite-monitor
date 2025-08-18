# Data Sources & Live Integration Guide

This project supports live geospatial & environmental data while preserving mock fallbacks so the app always runs (demo-friendly, offline tolerant). This guide explains each current / planned data source, required environment variables, how to obtain credentials, and how the backend decides between **live** vs **mock** data.

---
## Quick TL;DR
1. Copy `.env.example` (if present) or create `.env` in repo root.
2. Add the keys you have (unset ones automatically trigger mock data):
```
OPENWEATHER_API_KEY=your_openweather_key
WAQI_API_KEY=your_waqi_token
GEE_SERVICE_ACCOUNT_KEY=/absolute/path/to/gee-service-account.json
GEE_PROJECT_ID=your-gcp-project-id
# (Optional / future)
SENTINEL_HUB_CLIENT_ID=...
SENTINEL_HUB_CLIENT_SECRET=...
PC_SUBSCRIPTION_KEY=...
# Force mocks (even if keys exist) for testing failover:
FORCE_MOCK_WEATHER=false
FORCE_MOCK_AQI=false
FORCE_MOCK_SATELLITE=false
FORCE_MOCK_MODELS=true
ALLOW_GEE_USER_AUTH=false
```
3. Start backend (Docker or local). Watch logs for which sources are live vs mock.
4. Call API endpoints (e.g. `/api/v1/environmental?lat=...&lon=...`) to verify live responses.

If a key is missing or auth fails, the service logs a warning and returns structured mock data so the UI remains functional.

---
## Current Implemented Sources
| Domain | Source | Backend Module | Live Status | Fallback | Key Env Vars |
|--------|--------|----------------|------------|----------|--------------|
| Weather | OpenWeatherMap (Current Weather API) | `app/services/environmental.py` | Implemented | Mock weather block | `OPENWEATHER_API_KEY` |
| Air Quality | World Air Quality Index (WAQI) | `app/services/environmental.py` | Implemented | Mock AQI block | `WAQI_API_KEY` |
| Satellite / Imagery & Indices | Google Earth Engine (Sentinel‑2, MODIS LST, GPM, SRTM) | `app/services/satellite_data.py` | Implemented (conditional init) | Comprehensive mock feature set | `GEE_SERVICE_ACCOUNT_KEY`, `GEE_PROJECT_ID` (optional for user auth) |
| Hazard Features (soil, fuel load, distances, etc.) | (Derived / external datasets planned) | `satellite_data.py` & `hazard_models.py` | Not yet wired (placeholder) | Mock values | — |
| Timelapse Imagery | Sentinel‑2 via GEE | `satellite_data.py` | Conditional | Mock imagery list | GEE vars |
| Realtime Monitoring | Same as above + periodic fetch cycle | `realtime_data.py` | Partial (weather/AQI live; hazards simulated) | Simulated hazard & alert events | Keys as above |

---
## Planned / Scaffolded Sources
| Planned Source | Purpose | Notes |
|----------------|---------|-------|
| Sentinel Hub API | Higher control over Sentinel acquisitions & cloud masks | Env vars already in settings; client not yet implemented. |
| Microsoft Planetary Computer | Catalog search (STAC) & additional datasets | Subscription key placeholder only. |
| SMAP / SMOS (Soil Moisture) | Soil moisture realism | Currently mocked; can be proxied via GEE or NASA APIs. |
| ESA WorldCover | Detailed land cover classes | Currently returned as static/mock percentages. |
| Population / Exposure (e.g. WorldPop) | Impact analytics | Would power population-at-risk metrics. |
| Lightning Data (e.g. GLD360) | Wildfire ignition factors | Currently absent; placeholder comment in wildfire docstring. |

---
## Live vs Mock Decision Logic
| Service | Decision Condition (now with flags) |
|---------|------------------------------------|
| Weather | Live only if key present AND `FORCE_MOCK_WEATHER` = false. |
| AQI | Live only if key present AND `FORCE_MOCK_AQI` = false. |
| GEE Satellite | Live only if not `FORCE_MOCK_SATELLITE`, GEE lib installed, and service account creds valid (or user auth allowed + succeeds). |
| Hazard Models | Mock unless `FORCE_MOCK_MODELS` = false (then real model manager used). |
| Alerts / Hazard Updates | Simulated unless real pipeline populates DB. |

All fallbacks maintain the same response schema so the frontend doesn’t branch.

---
## Google Earth Engine Setup
Two paths:
### 1. Service Account (recommended for server / Docker)
1. Create a Google Cloud project & enable Earth Engine.
2. Create a service account, generate a JSON key.
3. Add the service account email to the Earth Engine Users list (https://code.earthengine.google.com -> Account).
4. Download the JSON key to a secure path (not committed). Example path: `/workspace/secrets/gee-key.json`.
5. Set in `.env`:
```
GEE_SERVICE_ACCOUNT_KEY=/workspace/secrets/gee-key.json
GEE_PROJECT_ID=your-gcp-project-id
```
6. Ensure the container/user running the backend can read the file.

### 2. User Credentials (dev quick start) (disabled by default)
1. Install `earthengine-api` locally: `pip install earthengine-api`.
2. Run `earthengine authenticate` and follow browser flow.
3. Set `ALLOW_GEE_USER_AUTH=true` in `.env`.
4. Omit `GEE_SERVICE_ACCOUNT_KEY`; code attempts `ee.Initialize()` with existing cached credentials.

### Verifying
Start backend, look for log: `Google Earth Engine initialized...` or a warning: `Google Earth Engine authentication failed. Using mock data.`

---
## OpenWeatherMap Setup
1. Sign up: https://openweathermap.org/api
2. Obtain an API key (Current Weather endpoint is sufficient for now).
3. Add to `.env`:
```
OPENWEATHER_API_KEY=your_key
```
4. Restart backend. Logs will no longer show: `OpenWeatherMap API key not configured, using mock data`.
5. Test endpoint (example): `GET /api/v1/environmental?lat=40.7128&lon=-74.0060` (actual route may depend on your API routers; adjust if needed).

### Rate Limits
Respect OWM free tier limits. The realtime service staggers requests (0.5s delay) for monitored cities—tune list if you approach limits.

---
## WAQI (World Air Quality Index) Setup
1. Register at https://aqicn.org/data-platform/token/
2. Copy token.
3. Add to `.env`:
```
WAQI_API_KEY=your_token
```
4. Restart backend and hit the same environmental endpoint.

### Troubleshooting
If API returns non-`ok` status, code falls back to mock and logs: `WAQI API error: ...`.

---
## Sentinel Hub (Planned)
Prepare ahead:
```
SENTINEL_HUB_CLIENT_ID=...
SENTINEL_HUB_CLIENT_SECRET=...
```
Future integration will likely:
- Request OAuth token
- Query Process API for custom band composites
- Provide cloud mask & harmonized Level-2A reflectance

---
## Microsoft Planetary Computer (Planned)
Set (once acquired):
```
PC_SUBSCRIPTION_KEY=...
```
Usage plan:
- STAC search for relevant collections (e.g. `sentinel-2-l2a`, `landsat-c2-l2`) via `pystac-client`
- Signed asset URL generation via requests with subscription key

---
## Local Development Workflow
| Goal | Steps |
|------|-------|
| Run everything with mocks | Leave all keys unset. Start backend; UI works with synthetic data. |
| Enable weather only | Set `OPENWEATHER_API_KEY` only. |
| Enable weather + AQI | Set both weather & AQI keys. |
| Enable satellite analytics | Add GEE credentials (plus install `earthengine-api`). |

---
## Security & Key Management
- Do **not** commit secret keys. `.env` should be in `.gitignore` (verify!).
- Prefer Docker secrets / cloud secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault) in production.
- Ensure GEE service account has minimum permissions.
- Rotate credentials periodically.

---
## Observability Recommendations (Next Steps)
| Enhancement | Benefit |
|-------------|---------|
| `/api/v1/data-sources/health` endpoint | Quick probe of live vs mock status. |
| Metrics: request latency, error counts | Alerting & scaling signals. |
| Circuit breaker on failing APIs | Prevent cascading slowdowns. |
| Cache layer for stable external responses | Rate limit protection & speed. |

---
## Sample Future Health Endpoint Sketch
```python
# Pseudocode idea
@router.get("/health/data-sources")
async def data_sources_health():
    return {
        "openweather": {"live": bool(settings.OPENWEATHER_API_KEY)},
        "waqi": {"live": bool(settings.WAQI_API_KEY)},
        "gee": {"live": satellite_service.gee_initialized},
        "sentinel_hub": {"configured": bool(settings.SENTINEL_HUB_CLIENT_ID)},
        "planetary_computer": {"configured": bool(settings.PC_SUBSCRIPTION_KEY)}
    }
```

---
## Troubleshooting Cheat Sheet
| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| Always seeing mock weather | Missing or invalid `OPENWEATHER_API_KEY` | Verify key & restart. |
| GEE warning about auth failure | Key path wrong OR user creds absent | Check path exists & readable; run `earthengine authenticate`. |
| Slow environmental endpoint | External API latency | Add caching layer or increase timeout; inspect logs. |
| Random hazard scores seem unrealistic | Models are placeholders | Replace with real ML model inference pipeline. |

---
## Contributing to Data Integration
1. Pick a planned source (open an issue to coordinate).
2. Create a new service module under `app/services/` or extend existing ones.
3. Add env vars to `Settings` in `app/core/config.py` (if new keys needed).
4. Provide fallback mock in same shape as live output.
5. Update this document with the new source.

---
## Summary
The platform is intentionally resilient: **missing creds never break the UI**. Add keys incrementally to unlock richer, live intelligence as you go. This document centralizes the how & why so new contributors (and ops) can move fast.

> Need help integrating the next source? Open an issue or extend the checklist above.

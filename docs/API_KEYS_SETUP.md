# API Keys & Environment Setup (Simplified / Mock-First)

The platform runs out-of-the-box using **mock data** (no keys required). Add keys incrementally to unlock live sources. This document lists only what you truly need now, plus optional upgrades.

## 🔑 Essentials (Enable Visual + Basic Live Data)
| Priority | What | Why | Required Where |
|----------|------|-----|----------------|
| 1 | Mapbox Access Token | Map / globe tiles | `frontend/.env.local` (public) |
| 2 | OpenWeatherMap API Key | Live weather metrics | `backend/.env` |
| 3 | WAQI API Token | Live air quality (AQI) | `backend/.env` |

Without these, the UI still loads; weather & AQI use structured mock values.

## 🌐 Optional (Satellite & Advanced)
| Option | Purpose | When to Add | Env Vars |
|--------|---------|------------|----------|
| Google Earth Engine (Service Account) | Real NDVI / LST / precipitation / DEM | When you want real satellite stats | `GEE_SERVICE_ACCOUNT_KEY`, `GEE_PROJECT_ID` |
| Sentinel Hub | High-control Sentinel-2 processing | Later (not implemented yet) | `SENTINEL_HUB_CLIENT_ID`, `SENTINEL_HUB_CLIENT_SECRET` |
| Planetary Computer | Additional catalog / STAC | Later | `PC_SUBSCRIPTION_KEY` |

## ⚙️ Backend Environment (Default SQLite, No Redis Needed)
Create `backend/.env` (or copy example) with at minimum:
```env
DEBUG=True
SECRET_KEY=change-me

# SQLite zero-config database (auto-created)
DATABASE_URL=sqlite:///./env_intel.db

# API Keys (add as you go; omit to stay in mock mode)
OPENWEATHER_API_KEY=
WAQI_API_KEY=
GEE_SERVICE_ACCOUNT_KEY=
GEE_PROJECT_ID=

# Feature flags (force mocks even if keys present)
FORCE_MOCK_WEATHER=false
FORCE_MOCK_AQI=false
FORCE_MOCK_SATELLITE=true    # keep true until you set GEE keys
FORCE_MOCK_MODELS=true
ALLOW_GEE_USER_AUTH=false    # set true only if using user auth instead of service account
```

## 🖥️ Frontend Environment (`frontend/.env.local`)
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 🚀 Enabling Each Live Source
Weather:
```env
OPENWEATHER_API_KEY=your_key
FORCE_MOCK_WEATHER=false
```
Air Quality:
```env
WAQI_API_KEY=your_token
FORCE_MOCK_AQI=false
```
Satellite (GEE service account):
```env
GEE_SERVICE_ACCOUNT_KEY=/abs/path/service-account.json
GEE_PROJECT_ID=your_project
FORCE_MOCK_SATELLITE=false
```
Models (when real models added):
```env
FORCE_MOCK_MODELS=false
```

Restart backend after changes. Check status:
`GET /api/v1/data-sources/health` – shows `live` vs `forced_mock` per source.

## 🔐 Security Basics
1. Do NOT commit `.env` files.
2. Use separate keys for dev/prod.
3. Rotate credentials periodically.
4. For production, move secrets to a manager (AWS/GCP/Azure secret services).

## 🧪 Quick Verification Steps
| Step | Check |
|------|-------|
| 1 | Start backend: it should not crash with empty keys. |
| 2 | Frontend loads globe (Mapbox token working). |
| 3 | `/api/v1/data-sources/health` shows weather/aqi `live: false` until keys added. |
| 4 | Add weather key → health shows `live: true` for weather. |
| 5 | Add AQI key → air quality panel updates with new values. |

## 🆘 Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Map tiles blank | Missing/invalid Mapbox token | Verify token starts with `pk.` |
| Weather still mock | Flag still true OR key not reloaded | Set `FORCE_MOCK_WEATHER=false`, restart backend |
| Satellite always mock | GEE keys missing OR `FORCE_MOCK_SATELLITE=true` | Provide key + set flag false |
| GEE init failure | Service account not added to EE | Share service account email in Earth Engine UI |

## 🗃️ Optional Upgrade Path
| Component | Default | Production Upgrade |
|----------|---------|--------------------|
| Database | SQLite | PostgreSQL (update `DATABASE_URL`) |
| Cache | In-memory | Redis (introduce new settings & client) |
| Secrets | Flat `.env` | Cloud secret manager |

These are **not required** to evaluate or extend the platform initially.

## 📊 Monitoring API Usage (When Live Enabled)
Check provider dashboards periodically (Mapbox, OpenWeatherMap, WAQI, Google Cloud). Add alert thresholds before scaling traffic.

---
Need deeper satellite setup? See `docs/DATA_SOURCES.md` for Earth Engine workflow.

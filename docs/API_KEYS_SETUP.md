# API Keys Setup

## Environment tiers

| Tier | Database | Cache | Jobs | Mock flags |
| --- | --- | --- | --- | --- |
| local | SQLite allowed | in-memory allowed | in-process allowed for development | allowed for isolated development |
| staging | PostgreSQL + PostGIS required | Redis required | Celery required | forbidden unless explicitly testing degraded behavior |
| production | PostgreSQL + PostGIS required | Redis required | Celery required | forbidden |

## Required environment variables

### Core runtime
- `RUNTIME_ENV`: `local`, `staging`, or `production`
- `DATABASE_URL`: `sqlite:///...` for local, `postgresql://...` for staging/production
- `REDIS_URL`: Redis connection string for shared cache
- `CELERY_BROKER_URL`: Redis broker URL for Celery
- `CELERY_RESULT_BACKEND`: Redis result backend URL for Celery

### Google Earth Engine
- `GEE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `FORCE_MOCK_SATELLITE=false` before staging/production

Use a service-account JSON file for unattended environments. The backend validates that the credentials path exists in production and initializes Earth Engine with the explicit project ID.

### OpenWeather
- `OPENWEATHER_API_KEY`
- `FORCE_MOCK_WEATHER=false` before staging/production

The backend keeps `OPENWEATHER_API_KEY` as the internal env name and sends it to OpenWeather as the `appid` query parameter.

### AQICN
- `WAQI_API_KEY`
- `FORCE_MOCK_AQI=false` before staging/production

The backend keeps `WAQI_API_KEY` as the internal env name and sends it to AQICN as the `token` query parameter.

### Sentinel Hub
- `SENTINEL_HUB_CLIENT_ID`
- `SENTINEL_HUB_CLIENT_SECRET`

Sentinel Hub uses OAuth client credentials. Do not treat these values as a static API key.

## Optional / blocked providers
- `IQAIR_API_KEY`
- `BREEZOMETER_API_KEY`
- `ARCGIS_API_KEY`
- `FIRMS_API_KEY`
- `MAPBOX_ACCESS_TOKEN`

These integrations remain `blocked_pending_docs` for production wiring unless the auth contract is verified in code and documentation.

## Local setup
1. Copy `backend/.env.example` to `backend/.env`.
2. Set `RUNTIME_ENV=local`.
3. Keep mock flags enabled only for the domains you are actively isolating.
4. If you want live satellite data, point `GOOGLE_APPLICATION_CREDENTIALS` at an absolute service-account JSON path.

## Staging / production setup
1. Set `RUNTIME_ENV=staging` or `production`.
2. Disable every `FORCE_MOCK_*` flag.
3. Use PostgreSQL + PostGIS via `DATABASE_URL`.
4. Configure Redis and Celery URLs.
5. Rotate provider keys through your secret manager, not through committed files.

## Rotation and handling notes
- Never log raw secrets or service-account JSON contents.
- Rotate OpenWeather, AQICN, Sentinel Hub, and Earth Engine service-account credentials on a documented schedule.
- Replace compromised credentials immediately and redeploy after verifying `/health/dependencies`.

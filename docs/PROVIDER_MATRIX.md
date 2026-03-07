# Provider Matrix

| Provider | Purpose | Auth method | Env vars | Request params | Response shape status | Implementation status | Last verified date | Test coverage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Google Earth Engine | Baseline satellite analysis | Application Default Credentials + `ee.Initialize(project=...)` | `GEE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS` | SDK initialization, no raw HTTP params | partial | partial | 2026-03-07 | unit validation only | Production startup now validates required config |
| OpenWeather | Weather snapshots and forecasts | Query parameter `appid` | `OPENWEATHER_API_KEY` | `lat`, `lon`, `appid`, `units`, optional `cnt` | normalized in services | partial | 2026-03-07 | request-builder tests | Default weather TTL must stay >= 10 minutes |
| AQICN | AQI snapshots | Query parameter `token` | `WAQI_API_KEY` | geo feed path + `token` | normalized in services | partial | 2026-03-07 | request-builder tests | Provider response objects should not leak directly |
| Sentinel Hub | Imagery acceleration | OAuth client credentials | `SENTINEL_HUB_CLIENT_ID`, `SENTINEL_HUB_CLIENT_SECRET` | `grant_type=client_credentials` | auth scaffold only | partial | 2026-03-07 | request-builder tests | Token acquisition is scaffolded; imagery flow still pending |
| IQAir | Premium AQI fallback | blocked_pending_docs | `IQAIR_API_KEY` | blocked_pending_docs | blocked | blocked_pending_docs | 2026-03-07 | none | Do not guess auth or URLs |
| BreezoMeter | Hyperlocal AQI fallback | blocked_pending_docs | `BREEZOMETER_API_KEY` | blocked_pending_docs | blocked | blocked_pending_docs | 2026-03-07 | none | Do not guess auth or URLs |
| ArcGIS | Mapping / enrichment | blocked_pending_docs | `ARCGIS_API_KEY` | blocked_pending_docs | blocked | blocked_pending_docs | 2026-03-07 | none | Exact backend auth flow still unverified |
| FIRMS | Fire hotspots | blocked_pending_docs | `FIRMS_API_KEY` | blocked_pending_docs | blocked | blocked_pending_docs | 2026-03-07 | none | Exact API contract still unverified |
| BigQuery | Future ingestion | blocked_pending_docs | n/a | blocked_pending_docs | blocked | blocked_pending_docs | 2026-03-07 | none | Production ingestion details still unverified |

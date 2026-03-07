# Data Sources

| Provider / dataset | Contribution | Resolution / cadence | Status | Provenance / license note |
| --- | --- | --- | --- | --- |
| Google Earth Engine | NDVI, LST, precipitation, DEM, landcover, imagery collections | Depends on source dataset; analysis-window driven | partial | Google Earth Engine access plus underlying dataset terms apply |
| OpenWeather | Current weather and forecast data | Point-based; cache at least 10 minutes per location | partial | OpenWeather API terms apply |
| AQICN / WAQI | Air quality index and pollutant snapshots | Station / geo feed; short-lived snapshots | partial | AQICN API terms apply |
| Sentinel Hub | Faster imagery path and timelapse acceleration | Imagery API dependent | partial | OAuth auth implemented, broader production flow still incomplete |
| IQAir | Premium AQI fallback | Provider-defined | blocked_pending_docs | Auth and contract not verified in the offline plan |
| BreezoMeter | Hyperlocal AQI fallback | Provider-defined | blocked_pending_docs | Auth and contract not verified in the offline plan |
| ArcGIS | Mapping and enrichment | Provider-defined | blocked_pending_docs | Exact backend auth flow not verified |
| FIRMS | Fire hotspot enrichment | Provider-defined | blocked_pending_docs | Exact API contract not verified |
| JRC Global Surface Water | Surface-water analytics | Dataset-defined | blocked_pending_docs | Access method not verified |
| Mapbox backend usage | Backend map behavior | N/A | blocked_pending_docs | Backend contract not verified |
| BigQuery ingestion | Future ingestion and warehousing | N/A | blocked_pending_docs | Production ingestion details not verified |

## Current backend notes
- Weather and AQI requests are normalized behind provider request builders.
- Earth Engine is treated as the baseline satellite provider and requires explicit project-aware initialization.
- Unverified providers must stay marked as `blocked_pending_docs` until their auth and request contracts are documented.

## API Overview

Base URL (dev): `http://localhost:8000/api/v1`

All responses JSON. Authentication not yet implemented (public dev mode). Future: token-based auth + role scopes.

### Core Endpoints
| Path | Method | Purpose | Notes |
|------|--------|---------|-------|
| `/environmental` | GET | Weather + AQI bundle for lat/lon | Query params: `lat`, `lon` |
| `/air-quality` | GET | Standalone air quality data | Same lat/lon pattern |
| `/hazards/analyze` | POST | Multi-hazard risk for AOI polygon | Body: GeoJSON polygon |
| `/satellite/aoi` | POST | AOI environmental metrics (NDVI, LST, precip) | Live (GEE) or mock |
| `/satellite/ndvi-timeseries` | POST | NDVI time series | Requires date range |
| `/satellite/timelapse` | POST | Imagery metadata list for timelapse | Mock list if GEE disabled |
| `/impact/analyze` | POST | (Scaffold) Impact / exposure analysis | Placeholder implementation |
| `/ai-insights/generate` | POST | (Scaffold) Narrative / AI summary | Placeholder |
| `/data-sources/health` | GET | Live vs mock status | Feature flags & config reflection |

### Health & Ops
| Path | Purpose |
|------|---------|
| `/health` (root) | Application + subsystems health (db, cache, ws, background tasks, models). |
| `/api/v1/data-sources/health` | Per data source (weather, aqi, satellite, models) live/mocked status. |

### Request / Response Patterns
* All coordinate / AOI inputs use GeoJSON polygons or lat/lon floats.
* Hazard responses return scores (0–100), risk level enum, contributing factors, recommendations.
* Satellite endpoints return scalar summaries (means) rather than raw rasters (optimization).

### Error Handling
* Validation errors: 422 Unprocessable Entity.
* Internal exceptions: 500 with error message (future improvement: structured error codes).
* External API failures auto-fallback to mock responses (still 200 OK) to preserve UX.

### WebSocket Channels (High-Level)
* `/ws/environmental` – streaming environmental updates.
* `/ws/hazards` – simulated hazard changes / alerts.
* `/ws/timelapse` – progress events for timelapse processing (mock stages).

### Versioning
* Current: `v1` namespace.
* Backward-incompatible changes will introduce `v2` while keeping `v1` until deprecation.

### Future Additions
| Category | Planned |
|----------|--------|
| Auth | JWT bearer tokens, API keys, role claims |
| Pagination | For historical datasets & logs |
| Filtering | Date/time / hazard type / severity filters |
| Export | CSV/GeoJSON export endpoints |
| Async Jobs | Submission + status endpoints for heavy processing |

### Example Hazard Analysis Request
```json
POST /api/v1/hazards/analyze
{
	"aoi": {
		"type": "Polygon",
		"coordinates": [[[ -122.5, 37.7], [-122.3, 37.7], [-122.3, 37.8], [-122.5, 37.8], [-122.5, 37.7] ]]
	}
}
```

### Example Hazard Analysis Response (Simplified)
```json
{
	"wildfire": {"risk_score": 72.5, "risk_level": "HIGH", "factors": ["High temperature"], "recommendations": ["Fire watch"]},
	"flood": {"risk_score": 45.0, "risk_level": "MODERATE"},
	"landslide": {"risk_score": 60.0, "risk_level": "HIGH"},
	"overall_risk_score": 55.0,
	"priority_hazards": ["WILDFIRE", "LANDSLIDE"]
}
```

### Notes
* Values may be mock until API keys/flags enable live mode.
* Schema stability prioritized—additive changes preferred over breaking renames.

For dataset & key setup see `docs/DATA_SOURCES.md` and `docs/API_KEYS_SETUP.md`.

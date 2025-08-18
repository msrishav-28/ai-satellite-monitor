## Deployment (Overview)

This document summarizes environment prep and deployment paths. For an extended guide see root `DEPLOYMENT.md` and production hardening in `PRODUCTION_CHECKLIST.md`.

### Modes
| Mode | DB | Cache | External Sources | Flags |
|------|----|-------|------------------|-------|
| Dev (default) | SQLite | In-memory | All mocked | FORCE_MOCK_* = true/keys missing |
| Staging | Postgres | Redis | Some live (weather/AQI) | Selective |
| Production | Postgres HA | Redis cluster | Live all | FORCE_MOCK_* = false |

### Minimal Env Vars (Dev)
None required. App will run with deterministic mock data.

### Enabling Live Sources
Set keys + disable force flags (see `docs/DATA_SOURCES.md`). Restart backend each change.

### Container Build
```bash
docker compose build
docker compose up -d
```

### Health Verification
* App: `GET /health`
* Data sources: `GET /api/v1/data-sources/health`

### Scaling Considerations
| Concern | Initial | Scale Step |
|---------|---------|-----------|
| CPU-bound model inference | In-process | Worker pool / GPU service |
| Satellite processing | On-demand GEE | Precomputed tiles / async jobs |
| WebSocket fan-out | Single process | Redis pub/sub or NATS |
| Caching | In-memory | Redis with TTL strategy |

### Secrets Management
* Local: `.env` files (gitignored)
* Cloud: Secret Manager / Parameter Store / Vault

### Logging & Metrics
Add structured logging driver (JSON) and aggregate (e.g., Loki, ELK). Export metrics via Prometheus (future addition) for: latency, cache hit, external API errors.

### Deployment Checklist Delta (vs root guide)
* Root guide includes optional heavy setup (Postgres/Redis) not required for mock mode.
* This document emphasizes progressive activation of live sources for lean rollout.

---
Refer back to `PRODUCTION_CHECKLIST.md` before go-live.

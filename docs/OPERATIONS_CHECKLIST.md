# Operations Checklist

- [ ] `RUNTIME_ENV` is set correctly for the target deployment.
- [ ] Staging/production uses PostgreSQL + PostGIS via `DATABASE_URL`.
- [ ] Redis is configured through `REDIS_URL`.
- [ ] Celery broker and result backend are configured.
- [ ] All `FORCE_MOCK_*` flags are disabled outside local development.
- [ ] Earth Engine credentials use an absolute service-account JSON path.
- [ ] OpenWeather and AQICN keys are present for live deployments.
- [ ] `/health/live`, `/health/ready`, and `/health/dependencies` all respond as expected.
- [ ] `/api/v1/data-sources/health` matches the intended provider rollout state.

# Runbook

## Startup
1. Configure `backend/.env` or secret-managed environment variables.
2. Verify the runtime tier (`RUNTIME_ENV`).
3. Start the backend; startup validation will reject staging/production deployments that still enable mock flags or omit PostgreSQL/Redis/Celery wiring.
4. Check `/health/live`, `/health/ready`, and `/health/dependencies`.

## Migrations
- Alembic configuration lives under `backend/alembic.ini` and `backend/migrations/`.
- Apply migrations with `cd backend && alembic upgrade head`.
- Roll back with `cd backend && alembic downgrade -1` or a specific revision.

## Provider outage playbook
- If OpenWeather or AQICN fail, inspect `/api/v1/data-sources/health` and `/health/dependencies`.
- If Earth Engine fails in production, verify `GEE_PROJECT_ID` and the service-account path first.
- Keep blocked providers disabled until their contracts are documented.

## Rollback
1. Roll back to the previous deployment artifact.
2. Downgrade the database only if the release included a schema change and the downgrade path is confirmed.
3. Re-check readiness and provider status endpoints before reopening traffic.

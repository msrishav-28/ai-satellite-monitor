# Runbook

## Startup
1. Configure `backend/.env` or secret-managed environment variables.
2. For the canonical frontend, configure `space/.env.local` when running outside Docker.
3. Verify the runtime tier (`RUNTIME_ENV`).
4. Start the backend and frontend directly with `npm run dev:full`, or start the container stack with `./scripts/deploy.sh up`.
5. Startup validation will reject staging/production deployments that still enable mock flags or omit PostgreSQL/Redis/Celery wiring.
6. Check `/health/live`, `/health/ready`, `/health/dependencies`, and `/api/v1/data-sources/health`.

## Container operations
- Build only: `./scripts/deploy.sh build`
- Start or refresh the stack: `./scripts/deploy.sh up`
- Tail logs: `./scripts/deploy.sh logs`
- Stop the stack: `./scripts/deploy.sh down`

## Direct local startup
1. Install root dependencies with `npm install`.
2. Install frontend dependencies with `npm run install:frontend`.
3. Create a backend virtual environment and install `backend/requirements.txt`.
4. Start both services with `npm run dev:full`.

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

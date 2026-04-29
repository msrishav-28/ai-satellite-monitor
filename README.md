# AI Satellite Monitor

AI Satellite Monitor is an environmental intelligence platform for area-of-interest monitoring. Operators can draw an AOI on a globe, retrieve satellite and environmental data, assess wildfire/flood/landslide risk, generate impact analysis and AI summaries, and review operational status through a mission-control dashboard built from the canonical `/space` design system.

## Architecture

- `backend/`: FastAPI API, runtime validation, provider integrations, data services, tests, and database migrations
- `space/`: canonical Next.js 15 frontend, shared design system, dashboard routes, and monitor experience
- `docker/`: container definitions for backend, frontend, and Redis-backed local deployment
- `scripts/`: setup, validation, startup, and deployment helpers
- `docs/`: provider, runtime, and operational reference material

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Zustand, Framer Motion
- Mapping and geospatial UI: Mapbox GL, `react-map-gl`, Mapbox Draw, Turf
- Backend: FastAPI, Pydantic v2, SQLAlchemy async, Alembic
- Data and ML: pandas, geopandas, rasterio, xarray, scikit-learn, TensorFlow, PyTorch
- Infrastructure: Docker Compose, Redis, GitHub Actions

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- `pip`
- Optional: Docker Desktop for containerized runs

### Fast setup

Linux or macOS:

```bash
./scripts/setup-dev.sh
```

Windows:

```bat
copy backend\.env.example backend\.env
copy space\.env.example space\.env.local
npm install
npm run install:frontend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Manual setup

1. Create environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp space/.env.example space/.env.local
   ```

2. Install root tooling:

   ```bash
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   npm run install:frontend
   ```

4. Install backend dependencies:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

5. Start both apps:

   ```bash
   npm run dev:full
   ```

### Local URLs

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- OpenAPI docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Validation

Run the full local validation suite:

```bash
./scripts/build.sh
```

Or run individual checks:

```bash
npm run lint
npm run typecheck
npm run build
python -m pytest backend/tests
python -m compileall backend
```

## Container Deployment

The repo includes a Compose stack for single-host deployment and local ops rehearsal.

1. Create `backend/.env` from `backend/.env.example`.
2. Review provider keys and runtime flags.
3. Start the stack:

   ```bash
   ./scripts/deploy.sh up
   ```

4. Tail logs if needed:

   ```bash
   ./scripts/deploy.sh logs
   ```

5. Stop the stack:

   ```bash
   ./scripts/deploy.sh down
   ```

Compose services:

- `frontend`: Next.js standalone server on port `3000`
- `backend`: FastAPI API on port `8000`
- `redis`: Redis on port `6379`

## Environment Variables

### Backend core

- `RUNTIME_ENV`: `local`, `staging`, or `production`
- `DATABASE_URL`: SQLite for local or PostgreSQL/PostGIS for shared environments
- `REDIS_URL`: Redis connection string
- `CELERY_BROKER_URL`: Celery broker
- `CELERY_RESULT_BACKEND`: Celery result backend
- `ALLOWED_HOSTS`: frontend origins allowed by CORS

### Providers and analysis

- `GEE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `OPENAI_API_KEY`
- `OPENWEATHER_API_KEY`
- `WAQI_API_KEY`
- `SENTINEL_HUB_CLIENT_ID`
- `SENTINEL_HUB_CLIENT_SECRET`
- `MAPBOX_ACCESS_TOKEN`

### Frontend

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

Full examples live in [backend/.env.example](/C:/Users/user/Documents/GitHub/ai-satellite-monitor/backend/.env.example) and [space/.env.example](/C:/Users/user/Documents/GitHub/ai-satellite-monitor/space/.env.example).

## Canonical Frontend Rule

All frontend work must use the design assets, tokens, and components in `/space`. Do not introduce a second design system. Extend the existing token layer in `space/src/app/globals.css` and compose from the shared panel, shell, and UI primitives already present in `space/src/components`.

## Route Overview

- `/`: product landing page
- `/dashboard`: operational status dashboard
- `/monitor`: AOI drawing, live panels, and timelapse flow
- `/analysis`: deeper product analysis view
- `/analytics`: runtime and provider telemetry
- `/alerts`: active alerts and recent hazard updates
- `/settings`: runtime configuration and deployment posture

## Additional Docs

- [docs/API_KEYS_SETUP.md](/C:/Users/user/Documents/GitHub/ai-satellite-monitor/docs/API_KEYS_SETUP.md)
- [docs/RUNBOOK.md](/C:/Users/user/Documents/GitHub/ai-satellite-monitor/docs/RUNBOOK.md)
- [docs/PROVIDER_MATRIX.md](/C:/Users/user/Documents/GitHub/ai-satellite-monitor/docs/PROVIDER_MATRIX.md)
- [docs/DATA_SOURCES.md](/C:/Users/user/Documents/GitHub/ai-satellite-monitor/docs/DATA_SOURCES.md)

# Frontend (Next.js) Overview

The frontend provides the interactive geospatial dashboard: map/globe, hazard panels, environmental metrics, time series, and real‑time updates.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS + custom design tokens
- Zustand state management
- Mapbox GL JS for map / globe
- WebSockets for streaming updates

## Key Directories
| Path | Purpose |
|------|---------|
| `src/app/` | App Router entry, layout, top-level pages |
| `src/components/` | Reusable UI & domain components |
| `src/hooks/` | Data & interaction hooks (API + WebSocket) |
| `src/store/` | Zustand stores (map state, data caches) |
| `src/lib/` | Utilities (API client wrappers, formatting, map helpers) |
| `src/types/` | Shared TypeScript type declarations |

## Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```
Mapbox token required for tiles & globe. Other vars point to backend endpoints.

## Data Flow (Example: Hazard Panel)
1. User defines Area of Interest (AOI) on map.
2. Hook posts AOI to backend hazard endpoint.
3. Response populates store; components render risk scores & factors.
4. WebSocket pushes environmental / alert updates asynchronously.

## Mock vs Live Indicators
Frontend can display source mode using `/api/v1/data-sources/health` (e.g., badges: Live / Mock).

## Adding a New Panel
1. Create hook (`src/hooks/useNewThing.ts`) — fetch or subscribe.
2. Add store slice if stateful.
3. Build component in `src/components/panels/`.
4. Wire into layout or dashboard section.

## Styling
Tailwind + custom classes. Prefer composable utility classes; extract shared patterns into `src/components/ui/`.

## Map Practices
- Debounce AOI submissions.
- Limit layer redraws by memoizing GeoJSON sources.
- Gracefully handle mock data (placeholder color ramps).

## Roadmap (Frontend)
- Layer toggles menu (hazards / NDVI / precipitation).
- Timelapse frame scrubber UI.
- Data freshness & confidence badges.
- User authentication & role-based feature gating.

## Development
Run locally:
```bash
npm install
npm run dev
```

Backend must be running (even in mock mode) for API calls. Use `scripts/start-dev.sh` to start both.

## Testing (Planned)
Introduce Vitest / React Testing Library for component + store testing. Mock API responses using MSW.

## Performance Tips
- Dynamic import large, rarely used components.
- Use React Suspense boundaries around data-heavy panels.
- Avoid unnecessary global state—keep ephemeral UI state local.

---
For full platform architecture see `../docs/ARCHITECTURE.md`.

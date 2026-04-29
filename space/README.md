# `/space` Frontend

`/space` is the canonical frontend for AI Satellite Monitor. It contains the production Next.js app, the active design tokens, and the reusable UI primitives that define the project’s visual language.

## What lives here

- `src/app/`: App Router routes such as `/dashboard`, `/monitor`, `/analytics`, `/alerts`, and `/settings`
- `src/components/`: navigation, shell, globe, panel, and shared UI primitives
- `src/hooks/`: API and websocket hooks for backend-backed state
- `src/app/globals.css`: token definitions and project-level utility classes

## Design System Rules

- Use `/space` as the only source of truth for frontend styling.
- Reuse existing primitives such as `AppShell`, `GlassPanel`, `PerspectiveCard`, `TextReveal`, and the shadcn-style `ui/` components.
- Extend existing tokens instead of inventing parallel CSS variables or utility systems.
- Keep the black/red mission-control aesthetic, glass surfaces, uppercase telemetry labels, and motion patterns already used across the app.

## Core Tokens

- Background: `#0E0E0E`
- Card surface: `#161616`
- Accent: `#FF0000`
- Typography: `Plus Jakarta Sans` for body, `Space Grotesk` for headings
- Radius: `0.625rem` base with larger glass-card radii in panels

## Commands

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Run development:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Run typecheck:

```bash
npm run typecheck
```

Build production output:

```bash
npm run build
```

## Extending the UI

1. Start with existing tokens in `src/app/globals.css`.
2. Compose from existing panels and shell primitives before adding new wrappers.
3. Match existing loading, error, and empty-state patterns.
4. Keep API access inside hooks under `src/hooks/` and helpers in `src/lib/api.ts`.
5. If a new screen needs navigation, route it through `AppShell` so it feels native to the rest of the product.

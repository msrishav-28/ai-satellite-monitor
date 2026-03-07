# AI Satellite Monitor — Cinematic Frontend Architecture (2026)

## I. Design Philosophy: "Atmospheric Intelligence"

**Core Principle**: Transform environmental monitoring from data-heavy dashboards into an **immersive command center experience** — where users feel like they're piloting a satellite network.

**Visual DNA**:
- **Hero Metaphor**: Mission Control meets IMAX nature documentary
- **Motion Language**: Physics-based, weighted — everything has mass
- **Information Hierarchy**: Data emerges from depth, not flat grids
- **Atmosphere**: Living 3D Earth sphere as the anchor, not decoration

***

## II. Tech Stack (2026 Elite Tier)

```typescript
// Core Framework
- Next.js 15 (App Router + Server Components)
- TypeScript 5.4 (Strict mode)
- React 19 (with Concurrent Features)

// 3D & WebGL
- React Three Fiber (R3F) + Drei
- Three.js (r163+)
- @react-three/postprocessing (bloom, film grain)
- GSAP (scroll-triggered 3D transformations)

// Motion & Interaction
- Framer Motion 11 (layout animations, physics springs)
- Lenis (smooth scroll with precision control)
- Cursor.js (custom magnetic cursor)

// Styling & UI
- Tailwind CSS 4.0 (with CSS variables)
- Radix UI (accessible primitives)
- Lucide Icons (consistent weight)

// Data Visualization
- D3.js (custom SVG data viz)
- Mapbox GL JS 3.0 (not Leaflet — satellite-grade maps)
- Chart.js with custom shaders (WebGL-accelerated)

// State & Data
- Zustand (lightweight, no Provider hell)
- TanStack Query (server state)
- WebSocket (Socket.io for real-time satellite feeds)
```

***

## III. Project Structure

```
ai-satellite-monitor/
├── frontend/
│   ├── src/
│   │   ├── app/                          # Next.js App Router
│   │   │   ├── (root)/                   # Public routes
│   │   │   │   ├── page.tsx              # Homepage (Cinematic Landing)
│   │   │   │   ├── layout.tsx            # Root layout with 3D scene
│   │   │   │   └── loading.tsx           # Skeleton with breathing animation
│   │   │   │
│   │   │   ├── platform/                 # Main application
│   │   │   │   ├── layout.tsx            # App shell (sidebar, globe, nav)
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx          # Mission overview
│   │   │   │   ├── monitor/
│   │   │   │   │   ├── page.tsx          # Live monitoring (draw polygon here)
│   │   │   │   │   └── [aoi_id]/page.tsx # Individual AOI analysis
│   │   │   │   ├── insights/
│   │   │   │   │   └── page.tsx          # AI-generated insights
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx          # Historical trends & predictions
│   │   │   │   ├── alerts/
│   │   │   │   │   └── page.tsx          # Alert management
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx          # API keys, preferences
│   │   │   │
│   │   │   └── api/                      # API routes (proxy to FastAPI)
│   │   │       └── [...path]/route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── 3d/                       # Three.js components
│   │   │   │   ├── EarthScene.tsx        # Main 3D Earth (hero)
│   │   │   │   ├── AtmosphericGlow.tsx   # Volumetric atmosphere shader
│   │   │   │   ├── SatelliteOrbit.tsx    # Animated satellite paths
│   │   │   │   ├── DataStream.tsx        # Particle system for data flow
│   │   │   │   ├── CloudLayer.tsx        # Procedural clouds (noise-based)
│   │   │   │   ├── NightLights.tsx       # City lights texture overlay
│   │   │   │   └── WeatherSystem.tsx     # Dynamic weather viz (hurricanes, etc)
│   │   │   │
│   │   │   ├── ui/                       # Radix-based primitives
│   │   │   │   ├── Button.tsx            # Magnetic + perspective tilt
│   │   │   │   ├── Card.tsx              # Glassmorphic depth cards
│   │   │   │   ├── Dialog.tsx            # Modal with backdrop blur
│   │   │   │   ├── Tabs.tsx              # Animated underline
│   │   │   │   ├── Tooltip.tsx           # Delayed reveal
│   │   │   │   ├── Badge.tsx             # Status indicators (pulsing)
│   │   │   │   ├── Input.tsx             # Glowing focus state
│   │   │   │   ├── Select.tsx            # Dropdown with spring physics
│   │   │   │   └── Slider.tsx            # Range control with thumb glow
│   │   │   │
│   │   │   ├── motion/                   # Framer Motion abstractions
│   │   │   │   ├── MagneticWrapper.tsx   # Mouse-pull physics
│   │   │   │   ├── PerspectiveCard.tsx   # 3D tilt on hover
│   │   │   │   ├── TextReveal.tsx        # Staggered word animation
│   │   │   │   ├── NumberCounter.tsx     # Odometer-style count-up
│   │   │   │   ├── ParallaxSection.tsx   # Scroll-based offset
│   │   │   │   ├── ScaleOnView.tsx       # Entrance with scale spring
│   │   │   │   └── PathDraw.tsx          # SVG line drawing animation
│   │   │   │
│   │   │   ├── data-viz/                 # Custom visualizations
│   │   │   │   ├── HazardRadar.tsx       # Circular risk radar chart
│   │   │   │   ├── NDVITimeline.tsx      # Vegetation health over time
│   │   │   │   ├── RiskHeatmap.tsx       # 2D grid with color gradient
│   │   │   │   ├── SatelliteOrbitPath.tsx # 3D orbit visualization
│   │   │   │   ├── EmissionsGraph.tsx    # Area chart with glow effect
│   │   │   │   └── ComparisonSplit.tsx   # Before/after slider
│   │   │   │
│   │   │   ├── map/                      # Mapbox components
│   │   │   │   ├── InteractiveMap.tsx    # Base map with custom style
│   │   │   │   ├── PolygonDrawer.tsx     # Draw tool with physics snap
│   │   │   │   ├── HazardLayer.tsx       # Overlay for fire/flood/etc
│   │   │   │   ├── SatelliteLayer.tsx    # Real-time satellite imagery
│   │   │   │   ├── MarkerCluster.tsx     # Animated pin clustering
│   │   │   │   └── FlyToLocation.tsx     # Smooth camera transition
│   │   │   │
│   │   │   ├── layouts/                  # Page layouts
│   │   │   │   ├── AppShell.tsx          # Sidebar + main + floating globe
│   │   │   │   ├── SplitView.tsx         # Map left, panel right
│   │   │   │   ├── FullscreenCanvas.tsx  # Immersive mode (ESC to exit)
│   │   │   │   └── GridMasonry.tsx       # Pinterest-style card grid
│   │   │   │
│   │   │   ├── modules/                  # Feature-specific composites
│   │   │   │   ├── HeroSection.tsx       # Landing page hero
│   │   │   │   ├── AOIAnalysisPanel.tsx  # Result display after polygon draw
│   │   │   │   ├── LiveFeedCard.tsx      # Real-time data stream card
│   │   │   │   ├── AlertNotification.tsx # Toast with severity color
│   │   │   │   ├── SatelliteStatus.tsx   # Orbit health indicators
│   │   │   │   ├── HistoricalComparison.tsx # Before/after with slider
│   │   │   │   └── PredictionTimeline.tsx # Future scenario viz
│   │   │   │
│   │   │   └── shared/                   # Cross-cutting concerns
│   │   │       ├── Navigation.tsx        # Sidebar with active state
│   │   │       ├── Header.tsx            # Top bar (translucent on scroll)
│   │   │       ├── Footer.tsx            # Credits, links
│   │   │       ├── LoadingScreen.tsx     # Satellite loading animation
│   │   │       ├── ErrorBoundary.tsx     # Graceful failure with contact
│   │   │       ├── ThemeToggle.tsx       # Dark/light (prefer dark)
│   │   │       └── CursorFollower.tsx    # Custom magnetic cursor
│   │   │
│   │   ├── lib/                          # Utilities & config
│   │   │   ├── hooks/
│   │   │   │   ├── useMousePosition.ts   # Smooth tracked mouse
│   │   │   │   ├── useScrollProgress.ts  # 0-1 scroll position
│   │   │   │   ├── useMediaQuery.ts      # Responsive breakpoints
│   │   │   │   ├── useDebounce.ts        # Input debouncing
│   │   │   │   ├── useWebSocket.ts       # Real-time data hook
│   │   │   │   └── use3DPosition.ts      # Convert lat/lon to 3D coords
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── appStore.ts           # Global UI state (Zustand)
│   │   │   │   ├── mapStore.ts           # Map state, polygons
│   │   │   │   └── alertStore.ts         # Alert queue
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── client.ts             # Axios/fetch wrapper
│   │   │   │   └── endpoints.ts          # Type-safe API calls
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── animations.ts         # Shared Framer variants
│   │   │   │   ├── colors.ts             # Palette with alpha helpers
│   │   │   │   ├── formatters.ts         # Date, number formatting
│   │   │   │   └── geoUtils.ts           # Polygon calculations
│   │   │   │
│   │   │   └── constants/
│   │   │       ├── animations.ts         # Timing constants
│   │   │       ├── hazards.ts            # Hazard type definitions
│   │   │       └── mapStyles.ts          # Mapbox style URLs
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css               # Base styles, fonts
│   │   │   ├── animations.css            # Keyframes (shimmer, pulse)
│   │   │   └── film-grain.css            # Noise overlay
│   │   │
│   │   └── public/
│   │       ├── fonts/                    # Self-hosted fonts
│   │       ├── textures/                 # Earth, clouds, stars
│   │       ├── models/                   # 3D assets (GLTF/GLB)
│   │       └── shaders/                  # Custom GLSL shaders
│   │
│   └── package.json
```

***

## IV. Page-by-Page Breakdown

### **1. Homepage (`/`) — The Cinematic Gateway**

**Purpose**: Establish awe, explain purpose, guide users to action.

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│  [Fullscreen 3D Earth (Hero)]          │
│  - Rotating Earth with glowing          │
│    atmosphere                            │
│  - Floating data streams (particles)    │
│  - Overlay text: "Monitor Earth.        │
│    Predict Risk. Take Action."          │
│  - CTA: "Launch Platform" (magnetic     │
│    button)                               │
└─────────────────────────────────────────┘
        ↓ Scroll Indicator (animated)
┌─────────────────────────────────────────┐
│  Section 1: "What We Do"                │
│  - 3-column grid                         │
│  - Each card: icon + title + short      │
│    description                           │
│  - On hover: card tilts (perspective)   │
│  - Icons: Wildfire, Flood, Deforest.    │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Section 2: "How It Works"              │
│  - Horizontal timeline (scroll-driven)  │
│  - Steps: Draw → Analyze → Insights     │
│  - Each step has animated number +      │
│    description                           │
│  - Background: parallax satellite       │
│    imagery                               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Section 3: "Live Data Preview"         │
│  - 2x2 grid of live cards               │
│  - Each card: mini viz (sparkline) +    │
│    current value                         │
│  - Updating in real-time (WebSocket)    │
│  - Cards pulse with data updates        │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Section 4: "Get Started"               │
│  - Large CTA button (center)            │
│  - Secondary CTA: "Watch Demo Video"    │
│  - Footer navigation                     │
└─────────────────────────────────────────┘
```

**Key Components**:
- `<EarthScene />` — Main hero with camera following mouse
- `<TextReveal>Monitor Earth.</TextReveal>` — Staggered word animation
- `<MagneticWrapper><Button>Launch Platform</Button></MagneticWrapper>`
- `<PerspectiveCard>` for feature cards
- `<LiveFeedCard />` with real-time updates

**Interactions**:
- **Scroll**: Earth rotates faster on scroll, parallax sections shift
- **Hover**: Cards tilt towards cursor, buttons pull magnetically
- **Click CTA**: Smooth transition to `/platform/monitor` with page wipe effect

***

### **2. Platform Dashboard (`/platform/dashboard`) — Mission Control**

**Purpose**: High-level overview of all monitored areas, alerts, system health.

**Layout Structure**:
```
┌──────────────────────────────────────────────────┐
│ [Top Bar - Translucent]                          │
│  Logo | Active Alerts (4) | User Avatar          │
└──────────────────────────────────────────────────┘
┌───┬──────────────────────────────────────────────┐
│ S │  [Main Content Area]                         │
│ i │                                               │
│ d │  Hero Stats (4 cards, side-by-side):        │
│ e │  ┌──────┬──────┬──────┬──────┐              │
│ b │  │ AOIs │Alerts│Sat. │ Risk │              │
│ a │  │  12  │  4   │ ✓✓  │ Med  │              │
│ r │  └──────┴──────┴──────┴──────┘              │
│   │                                               │
│ [N│  [Miniature Globe - Floating, right side]   │
│ a │   - All AOIs pinned                          │
│ v │   - Rotatable                                │
│   │                                               │
│ F │  Recent Activity Timeline:                   │
│ l │  ┌─────────────────────────────────┐        │
│ o │  │ • Wildfire detected (3h ago)    │        │
│ a │  │ • AOI_08 analysis complete (5h) │        │
│ t │  │ • New deforestation alert (1d)  │        │
│ ] │  └─────────────────────────────────┘        │
│   │                                               │
│   │  Active AOIs Grid (3 cols):                 │
│   │  ┌────────┬────────┬────────┐              │
│   │  │ AOI_01 │ AOI_02 │ AOI_03 │              │
│   │  │ Amazon │ Alaska │ Sahel  │              │
│   │  │ Status │ Status │ Status │              │
│   │  └────────┴────────┴────────┘              │
└───┴──────────────────────────────────────────────┘
```

**Key Components**:
- `<AppShell>` — Sidebar + main + floating globe
- `<StatCard>` — Animated number counter with icon
- `<EarthScene mode="mini" />` — Small interactive globe
- `<ActivityTimeline />` — Real-time updates with smooth insertion
- `<AOICard />` — Thumbnail + name + quick status

**Interactions**:
- **Globe Click**: Fly to selected AOI on map
- **AOI Card Hover**: Highlights region on mini globe
- **Sidebar Active State**: Smooth indicator slide

***

### **3. Monitor (`/platform/monitor`) — The Core Experience**

**Purpose**: Draw polygons, trigger analysis, see results.

**Layout Structure**:
```
┌──────────────────────────────────────────────────┐
│ [Top Bar with Tools]                             │
│  Draw Tool | Select | Clear | Analyze Button    │
└──────────────────────────────────────────────────┘
┌───────────────────────────┬──────────────────────┐
│                           │ [Right Panel]        │
│                           │                      │
│  [Mapbox Fullscreen]      │ Instructions:        │
│                           │ "Draw a polygon on   │
│  - Custom dark style      │  the map to analyze  │
│  - Polygon drawing tool   │  environmental       │
│  - Hazard layers toggle   │  risks."             │
│  - Satellite imagery      │                      │
│    overlay option         │ OR                   │
│                           │                      │
│  [User draws polygon]     │ After drawing:       │
│  [Polygon snaps to        │ ┌──────────────────┐│
│   precise edges]          │ │ Polygon Area:    ││
│                           │ │ 2,450 km²        ││
│                           │ │                  ││
│                           │ │ [Analyze Button] ││
│                           │ │ (Magnetic, glows)││
│                           │ └──────────────────┘│
│                           │                      │
│                           │ Analysis Results:    │
│                           │ (After API call)     │
│                           │ ┌──────────────────┐│
│                           │ │ Wildfire: HIGH   ││
│                           │ │ Flood: MODERATE  ││
│                           │ │ Deforest: LOW    ││
│                           │ │                  ││
│                           │ │ [View Details] ───┤│
│                           │ └──────────────────┘│
└───────────────────────────┴──────────────────────┘
```

**Key Components**:
- `<InteractiveMap />` — Mapbox with custom dark theme
- `<PolygonDrawer />` — Draw tool with physics-based snapping
- `<HazardLayer />` — Toggle-able overlays for fires, floods
- `<AOIAnalysisPanel />` — Slides in from right with results
- `<HazardRadar />` — Circular radar chart for risk levels

**Interactions**:
1. **Draw Mode**: Cursor changes to crosshair, points snap to grid
2. **During Draw**: Live area calculation updates
3. **Complete Polygon**: Smooth fill animation, "Analyze" button pulses
4. **Click Analyze**: 
   - Button morphs into loading spinner
   - Map dims (backdrop-blur-lg)
   - API call to `/api/analyze-aoi`
   - Results panel slides in from right (spring animation)
5. **View Results**: Each hazard card scales in with stagger delay
6. **Hover Hazard**: Map highlights affected areas

**Data Flow**:
```typescript
User draws polygon
  → polygonCoords saved to mapStore
  → Click "Analyze"
  → POST to /api/satellite/aoi
  → FastAPI processes (GEE integration)
  → Returns { wildfire, flood, deforestation, ... }
  → Results animate into panel
  → Map layers update with hazard zones
```

***

### **4. Individual AOI Analysis (`/platform/monitor/[aoi_id]`) — Deep Dive**

**Purpose**: Full report for a specific monitored area.

**Layout Structure**:
```
┌──────────────────────────────────────────────────┐
│ [Hero Banner]                                    │
│  - Satellite image of AOI (background)           │
│  - Overlay: AOI name + coordinates               │
│  - Breadcrumb: Dashboard > Monitor > AOI_ID     │
└──────────────────────────────────────────────────┘
        ↓ Scroll
┌──────────────────────────────────────────────────┐
│ Section: Overview                                │
│ ┌──────────────────────────────────────────────┐│
│ │ Map (left 60%) | Summary Cards (right 40%)  ││
│ │                                              ││
│ │ - Polygon outline     │ ┌─────────────────┐││
│ │ - Hazard zones        │ │ Risk Level: HIGH│││
│ │                        │ │ Area: 2,450 km² │││
│ │                        │ │ Last Updated:   │││
│ │                        │ │ 2 hours ago     │││
│ │                        │ └─────────────────┘││
│ └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ Section: Hazard Breakdown (Tabbed)              │
│ ┌────┬────┬────┬────┬────┐                     │
│ │Fire│Flood│Def.│Drght│Slide│ ← Tabs         │
│ └────┴────┴────┴────┴────┘                     │
│                                                  │
│ [Active Tab Content]                            │
│ - Risk score (animated progress bar)            │
│ - Key factors (bullet list with icons)          │
│ - Mini visualization (chart/heatmap)            │
│ - Recommendations (action items)                │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ Section: Time Series Analysis                   │
│ - NDVI over time (line chart)                   │
│ - Temperature trends (area chart)               │
│ - Precipitation history (bar chart)             │
│ - Interactive date range selector               │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ Section: Satellite Imagery Comparison           │
│ - Before/After slider                           │
│ - Time-lapse player (if available)              │
│ - Download raw data button                      │
└──────────────────────────────────────────────────┘
```

**Key Components**:
- `<SplitView>` — Map left, panel right
- `<Tabs>` — Animated underline follows active tab
- `<NDVITimeline />` — D3-based line chart with zoom
- `<ComparisonSplit />` — Before/after with draggable divider
- `<DownloadButton />` — Exports data as GeoJSON/CSV

***

### **5. Insights (`/platform/insights`) — AI-Powered Analysis**

**Purpose**: Surface patterns, predictions, and actionable intelligence.

**Layout Structure**:
```
┌──────────────────────────────────────────────────┐
│ [Hero Text]                                      │
│ "AI-Detected Patterns Across All Monitored     │
│  Regions"                                        │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ Section: Key Insights (Masonry Grid)            │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│ │ Insight 1 │  │ Insight 2 │  │ Insight 3 │   │
│ │           │  │           │  │           │   │
│ │ "Wildfire │  │ "Amazonian│  │ "Coastal  │   │
│ │  risk     │  │  deforest │  │  flooding │   │
│ │  rising   │  │  slowing" │  │  increase"│   │
│ │  in West" │  │           │  │           │   │
│ └───────────┘  └───────────┘  └───────────┘   │
│                                                  │
│ - Each card: title + brief + "Learn More" CTA  │
│ - On hover: card glows, lifts (translateZ)      │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ Section: Predictive Models                      │
│ - Toggle: 3-month / 6-month / 1-year           │
│ - Visualization: globe with color-coded         │
│   probability zones                             │
│ - Bottom panel: "Confidence intervals and       │
│   methodology"                                  │
└──────────────────────────────────────────────────┘
```

**Key Components**:
- `<GridMasonry>` — Pinterest-style card layout
- `<InsightCard />` — Glassmorphic card with glow effect
- `<PredictionTimeline />` — Future scenario visualization
- `<EarthScene mode="heatmap" />` — 3D globe with data overlay

***

### **6. Analytics (`/platform/analytics`) — Historical Trends**

**Purpose**: Deep data exploration, export, custom reports.

**Layout Structure**:
```
┌──────────────────────────────────────────────────┐
│ [Filter Bar]                                     │
│  Date Range | Hazard Type | Region | Export     │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ [Main Chart Area - 70% height]                  │
│  - Large line/area chart (D3)                   │
│  - Multiple series toggle (Wildfire, Flood, etc)│
│  - Zoom/pan controls                            │
│  - Tooltip on hover shows exact values          │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ [Data Table - 30% height]                       │
│  - Sortable columns                             │
│  - Pagination                                   │
│  - Row click → opens detail modal               │
└──────────────────────────────────────────────────┘
```

**Key Components**:
- `<AnalyticsChart />` — D3-based with WebGL acceleration
- `<DataTable />` — Virtualized for performance
- `<ExportButton />` — Generates PDF/CSV reports

***

## V. Component Library Details

### **A. 3D Components (`components/3d/`)**

#### **1. `<EarthScene />`** — The Hero
```typescript
interface EarthSceneProps {
  mode?: 'hero' | 'mini' | 'heatmap';
  interactive?: boolean;
  pins?: Array<{ lat: number; lon: number; color: string }>;
}

// Features:
- Physically-accurate Earth sphere (8K texture)
- Atmospheric glow (shader-based Fresnel effect)
- Dynamic cloud layer (animated noise)
- Day/night cycle (optional)
- City lights on dark side
- Mouse parallax (camera follows cursor)
- Scroll-based rotation
- Pin markers that scale with camera distance
```

**Visual Treatment**:
- **Base Sphere**: Uses NASA Blue Marble texture (8K)
- **Atmosphere**: `ShaderMaterial` with blue-to-transparent gradient (Fresnel)
- **Clouds**: Separate sphere, slightly larger, with alpha noise texture
- **Glow**: `<Bloom>` postprocessing for luminance
- **Rotation**: Auto-rotate on idle, manual with drag

#### **2. `<SatelliteOrbit />`** — Orbital Paths
```typescript
interface SatelliteOrbitProps {
  satellites: Array<{
    name: string;
    altitude: number;
    inclination: number;
    speed: number;
  }>;
}

// Visual:
- Thin orbital rings (THREE.Line with dashed effect)
- Small 3D satellite models (GLTF)
- Trail particles behind satellites
- Labels that face camera (THREE.Sprite)
```

#### **3. `<DataStream />`** — Particle Data Flow
```typescript
// Purpose: Show "live" data flowing from Earth to user
// Implementation:
- BufferGeometry with 2000 points
- Each point: position, velocity, color, life
- Curves from surface to camera
- Fades in/out with opacity animation
- Colors match hazard types (red = fire, blue = water)
```

***

### **B. Motion Components (`components/motion/`)**

#### **1. `<MagneticWrapper />`** — Cursor Pull
```typescript
interface MagneticWrapperProps {
  strength?: number; // 0-1, default 0.5
  range?: number;    // pixels, default 100
  children: React.ReactNode;
}

// Logic:
const distance = Math.hypot(mouseX - centerX, mouseY - centerY);
if (distance < range) {
  const pull = (1 - distance / range) * strength;
  elementX += (mouseX - centerX) * pull;
  elementY += (mouseY - centerY) * pull;
}

// Spring config:
{ stiffness: 150, damping: 15, mass: 0.1 }
```

#### **2. `<PerspectiveCard />`** — 3D Tilt
```typescript
// On mouse move inside card:
const rotateX = (mouseY - centerY) / height * 15; // max ±15deg
const rotateY = (mouseX - centerX) / width * 15;

// Apply transform:
transform: `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(50px)`

// Children with data-depth attribute:
<div data-depth="2"> // moves 2x the parent
```

#### **3. `<TextReveal />`** — Staggered Words
```typescript
// Split text into words:
const words = text.split(' ');

// Animate each word:
{words.map((word, i) => (
  <motion.span
    key={i}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: i * 0.05,
      type: 'spring',
      stiffness: 100
    }}
  >
    {word}{' '}
  </motion.span>
))}
```

***

### **C. Data Visualization (`components/data-viz/`)**

#### **1. `<HazardRadar />`** — Risk Radar Chart
```typescript
// Circular chart with 5 axes (Wildfire, Flood, etc.)
// Each axis: 0-100 scale
// Renders as SVG polygon with glow filter

<svg viewBox="0 0 500 500">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  {/* Grid circles */}
  <circle r="100" fill="none" stroke="white/10" />
  <circle r="150" fill="none" stroke="white/10" />
  
  {/* Data polygon */}
  <polygon
    points={calculatePoints(data)}
    fill="red/20"
    stroke="red"
    strokeWidth="2"
    filter="url(#glow)"
  />
</svg>
```

**Interaction**:
- Hover axis label → highlights that hazard
- Click hazard → navigate to detail page
- Animated entrance (polygon draws from center)

#### **2. `<NDVITimeline />`** — Vegetation Health Chart
```typescript
// D3-based line chart
// X-axis: Time (months)
// Y-axis: NDVI value (-1 to 1)
// Features:
- Gradient fill under line (green = healthy)
- Draggable date range selector
- Tooltip with satellite image thumbnail
- "Anomaly detection" markers (red dots)
- Zoom with mouse wheel
```

***

### **D. Map Components (`components/map/`)**

#### **1. `<PolygonDrawer />`** — Draw Tool with Physics
```typescript
// Built on Mapbox Draw
// Enhancements:
- Point snapping to lat/lon grid (0.001° precision)
- Magnetic snap to existing polygons/roads
- Live area calculation (updates on each point)
- Undo/redo stack
- Vertex editing with spring animation

// Visual feedback:
- Drawing line: dashed white with glow
- Completed polygon: solid fill with 50% opacity
- Hover vertex: scale up + glow ring
```

**Interactions**:
1. Click to add point
2. Double-click or press Enter to complete
3. Click existing polygon to edit
4. Delete key to remove selected

***

## VI. Design System

### **Color Palette**

```typescript
// colors.ts
export const palette = {
  // Base
  void: '#0A0A0A',        // Almost-black background
  space: '#0E0E0E',       // Slightly lighter black
  coal: '#1A1A1A',        // UI element backgrounds
  
  // Accent (primary action)
  signal: '#3B82F6',      // Electric blue (satellites)
  signalGlow: '#60A5FA',  // Lighter blue
  
  // Hazard-specific
  fire: '#EF4444',        // Red (wildfire)
  water: '#3B82F6',       // Blue (flood)
  earth: '#F59E0B',       // Amber (drought)
  growth: '#10B981',      // Emerald (vegetation)
  alert: '#DC2626',       // Bright red (critical)
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Neutrals (with alpha)
  glass: 'rgba(255, 255, 255, 0.05)',  // Glassmorphic surfaces
  border: 'rgba(255, 255, 255, 0.1)',  // Subtle borders
  text: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.70)',
    tertiary: 'rgba(255, 255, 255, 0.45)',
  }
}
```

### **Typography**

```typescript
// fonts.ts
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

// Usage:
// Headings: var(--font-display) - Space Grotesk
// Body: var(--font-body) - Plus Jakarta Sans
// Code/Data: var(--font-mono) - JetBrains Mono
```

**Type Scale**:
```css
/* globals.css */
:root {
  --text-xs: 0.75rem;    /* 12px - metadata */
  --text-sm: 0.875rem;   /* 14px - labels */
  --text-base: 1rem;     /* 16px - body */
  --text-lg: 1.125rem;   /* 18px - emphasis */
  --text-xl: 1.25rem;    /* 20px - subheadings */
  --text-2xl: 1.5rem;    /* 24px - card titles */
  --text-3xl: 1.875rem;  /* 30px - section headers */
  --text-4xl: 2.25rem;   /* 36px - page titles */
  --text-5xl: 3rem;      /* 48px - hero primary */
  --text-6xl: 3.75rem;   /* 60px - homepage hero */
  --text-7xl: 4.5rem;    /* 72px - ultra hero */
}
```

### **Spacing System**

```typescript
// Based on 4px grid (8px for comfort)
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
};
```

### **Animation Timing**

```typescript
// constants/animations.ts
export const timing = {
  // Durations
  instant: 0,
  fast: 150,      // Quick feedback
  normal: 300,    // Standard transitions
  slow: 500,      // Emphasized movements
  slower: 800,    // Page transitions
  
  // Easing (Framer Motion)
  easeOut: [0.22, 1, 0.36, 1],      // Smooth deceleration
  easeInOut: [0.45, 0, 0.55, 1],    // Balanced
  spring: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 0.5
  },
  
  // Stagger delays
  stagger: {
    fast: 0.03,
    normal: 0.05,
    slow: 0.1,
  }
};
```

### **Glassmorphism Utility**

```css
/* globals.css */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(40px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
    0 20px 40px -10px rgba(0, 0, 0, 0.5);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
    0 30px 60px -15px rgba(0, 0, 0, 0.6);
}
```

### **Film Grain Overlay**

```css
/* film-grain.css */
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  20% { transform: translate(-15%, 5%); }
  30% { transform: translate(7%, -25%); }
  40% { transform: translate(-5%, 25%); }
  50% { transform: translate(-15%, 10%); }
  60% { transform: translate(15%, 0); }
  70% { transform: translate(0, 15%); }
  80% { transform: translate(3%, 35%); }
  90% { transform: translate(-10%, 10%); }
}

.film-grain::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: url('/textures/grain.png');
  opacity: 0.03;
  animation: grain 8s steps(10) infinite;
  pointer-events: none;
  z-index: 9999;
}
```

***

## VII. Advanced Interaction Patterns

### **1. Magnetic Cursor**

```typescript
// components/shared/CursorFollower.tsx
// Features:
- Default: 20px circle, white/20 fill
- On hover <button>: scales to 40px, blue fill
- On hover <a>: scales to 30px, ring only
- On dragging: scales to 15px, changes to crosshair
- Smooth lerp (linear interpolation) for position
- Blend mode: difference (inverts colors underneath)
```

### **2. Scroll-Linked Animations**

```typescript
// Using Framer Motion + useScroll
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ['start end', 'end start']
});

// Scale Earth as you scroll past hero
const earthScale = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

// Parallax sections at different speeds
<ParallaxSection speed={0.5}>Content</ParallaxSection>
<ParallaxSection speed={0.8}>Content</ParallaxSection>
```

### **3. Data Update Animations**

```typescript
// When WebSocket pushes new data:
<AnimatePresence mode="popLayout">
  {alerts.map(alert => (
    <motion.div
      key={alert.id}
      layout
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <AlertCard {...alert} />
    </motion.div>
  ))}
</AnimatePresence>
```

***

## VIII. Responsive Strategy (Mobile-First)

### **Breakpoints**
```typescript
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / small laptop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
};
```

### **Mobile Adaptations**

**Homepage**:
- 3D Earth: reduced particle count (1000 → 100)
- Magnetic effects: disabled (performance)
- Type scale: reduced 40% (e.g., 72px → 43px for hero)

**Monitor Page**:
- Layout: Stack map above panel (no split view)
- Draw tool: touch-optimized (larger hit areas)
- Right panel: Becomes bottom sheet (slide up)

**Navigation**:
- Desktop: Sidebar (always visible)
- Mobile: Bottom tab bar (5 icons max)

***

## IX. Performance Optimizations

### **1. Code Splitting**
```typescript
// Lazy load heavy 3D components
const EarthScene = dynamic(() => import('@/components/3d/EarthScene'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

### **2. Image Optimization**
```typescript
// Use Next.js Image with blur placeholders
<Image
  src="/earth-texture.jpg"
  width={4096}
  height={2048}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority // For hero images
/>
```

### **3. 3D Performance**
- Use `<Instances>` for repeated geometry (satellites, particles)
- Enable frustum culling (Three.js default)
- Level of Detail (LOD): lower poly count for distant objects
- Reduce shadow map resolution on mobile

### **4. WebSocket Connection**
```typescript
// Only connect when platform pages are active
// Disconnect on idle (5 min timeout)
// Batch updates (max 10 per second)
```

***

## X. Accessibility (WCAG 2.1 AA)

### **Color Contrast**
- All text: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1
- Interactive elements: 3:1 against background

### **Keyboard Navigation**
- Tab order: logical flow
- Focus indicators: 2px blue outline
- Skip to main content link (hidden, appears on focus)
- All interactive 3D elements have keyboard alternatives

### **Screen Reader Support**
```typescript
<div
  role="img"
  aria-label="3D visualization of Earth showing current wildfire locations"
>
  <EarthScene />
</div>

<button
  aria-label="Analyze selected area for environmental risks"
  aria-pressed={isAnalyzing}
>
  Analyze
</button>
```

### **Motion Preferences**
```typescript
// Respect prefers-reduced-motion
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
/>
```

***

## XI. Implementation Roadmap

### **Phase 1: Foundation (Week 1-2)**
- [ ] Set up Next.js 15 + TypeScript
- [ ] Configure Tailwind with custom theme
- [ ] Install and test R3F + Three.js
- [ ] Create design system (tokens, utilities)
- [ ] Build `<AppShell>` layout

### **Phase 2: Core Pages (Week 3-4)**
- [ ] Homepage with 3D Earth hero
- [ ] Dashboard (static content first)
- [ ] Monitor page with Mapbox integration
- [ ] Polygon drawing tool (MVP)

### **Phase 3: Motion & Interaction (Week 5)**
- [ ] `<MagneticWrapper>` component
- [ ] `<PerspectiveCard>` component
- [ ] Scroll-linked animations
- [ ] Custom cursor

### **Phase 4: Data Integration (Week 6-7)**
- [ ] Connect to FastAPI backend
- [ ] WebSocket for real-time updates
- [ ] AOI analysis flow (draw → analyze → results)
- [ ] Error handling and loading states

### **Phase 5: Visualization (Week 8)**
- [ ] Hazard radar chart
- [ ] NDVI timeline
- [ ] Historical comparison tools
- [ ] Export functionality

### **Phase 6: Polish (Week 9-10)**
- [ ] Film grain overlay
- [ ] Glassmorphism refinements
- [ ] Mobile responsive adjustments
- [ ] Performance optimization
- [ ] Accessibility audit

***

## XII. File Size Budget

To maintain 60fps and fast load times:

| Asset Type | Budget | Notes |
|-----------|--------|-------|
| Initial JS bundle | < 200 KB | Gzipped |
| Hero 3D scene | < 500 KB | Textures + geometry |
| Per-page JS | < 100 KB | Code-split routes |
| Font files | < 80 KB | WOFF2, subsets only |
| Earth texture | < 2 MB | Progressive JPEG/WebP |
| Film grain | < 5 KB | Tiled 128x128 PNG |

***

## XIII. Final Notes

**Why This Works**:
1. **Emotional Hook**: The 3D Earth immediately communicates scale and importance
2. **Clear Hierarchy**: Users always know where they are (breadcrumbs, active states)
3. **Progressive Disclosure**: Information appears as needed, not all at once
4. **Tactile Feedback**: Every interaction feels physical (springs, magnets)
5. **Performance**: Heavy assets load after initial render (code splitting)

**Differentiation from "Generic Dashboards"**:
- Most dashboards = flat panels + static charts
- This platform = living 3D space + physics-based UI
- Data isn't just shown — it's experienced through motion and depth

**The "10k Finish" Secret**:
> It's not one big thing — it's 100 small details done perfectly. Film grain, magnetic buttons, staggered text reveals, breathing 3D elements, perfect timing on springs. Each adds 1% more "feel", compounding into an experience that feels premium.

This architecture gives you a **production-ready blueprint** for a cinematic, high-performance satellite monitoring platform that stands out in 2026. Every component, every interaction, every pixel is intentional.

Ready to start building? 🚀
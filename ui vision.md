This is purely from everything we've designed and documented in this chat — no need to check the repo. Here is the complete visual and experiential description, the way a senior product design team would present it to stakeholders.

***

# The Complete Visual Identity & Experience

## The Design Premise

Before describing a single pixel, understand the **emotional contract** this product makes with its user the moment it loads:

> *"You are not using a dashboard. You are looking at Earth from space. You have instruments. You have intelligence. You have control."*

Everything — every color choice, every animation timing, every typographic decision — serves that single emotional premise. The user should feel the weight of what they're monitoring. Environmental data is not abstract numbers. It's forests disappearing, coastlines flooding, land burning. The design must carry that gravity while remaining completely usable.

***

## The Atmosphere: What You See Before You See Anything

### The Loading Experience

The site never shows a blank white screen or a spinner. Before the first frame renders, there is darkness — pure `#0A0A0A`. Out of this darkness, a single point of light appears at center screen. It pulses once, twice. Then it expands — not as a circle, but as if a camera aperture is opening, revealing the 3D Earth behind it. This takes 1.8 seconds. The Earth is already rotating when it becomes visible. There is no "loading..." text. The progress is communicated entirely through the scene coming into focus, a subtle depth-of-field blur resolving into sharpness.

The loading animation is bespoke: a custom SVG of a satellite orbit path — a thin ellipse — with a small dot traveling along it. The dot completes one orbit. The orbit fades. The Earth is revealed. This is the only time in the entire product that the user feels they are waiting. After this, every subsequent transition feels instant because data is preloaded and cached.

### The Film Grain

Every single screen — landing page, dashboard, monitor, analytics — has a fixed 3% opacity noise texture overlaid at `z-index: 9999`. This grain texture is a 128×128px tiled PNG that animates with `steps(10)` at 8 seconds, randomly translating position to simulate organic film noise. It never loops visually. You can't consciously see it unless you look for it. But remove it and the entire interface suddenly looks like every other SaaS product. It's the texture that breaks the "perfect digital" flatness and gives the UI a physical, filmic quality — like you're watching a very expensive documentary rather than using a web app.

### The Cursor

There is no default OS cursor anywhere on the platform. A custom cursor consists of two elements:

**Outer ring**: A 24px circle, `border: 1px solid rgba(255,255,255,0.4)`, no fill. Follows the mouse with a lerp delay of `0.08` — meaning it trails slightly behind the actual mouse position, like a lens floating in liquid.

**Inner dot**: A 4px solid white dot that follows the exact mouse position with no delay. The contrast between the snappy dot and the lagging ring creates a sense of physics and weight.

**State changes**:
- Hovering a button → outer ring scales to 48px, fills with `rgba(59, 130, 246, 0.15)`, border turns blue
- Hovering a link → outer ring scales to 36px, morphs from circle to a rounded square
- On the map in draw mode → both elements disappear, replaced with a precision crosshair (thin `+` with 16px arms, no center gap)
- Dragging a polygon vertex → cursor becomes a 12px filled dot, electric blue, pulsing gently
- Hovering an image → outer ring scales to 64px, text "EXPLORE" appears inside it in 9px uppercase tracking-widest

***

## The Homepage: Scale, Gravity, Invitation

### The Hero — Full Viewport 3D Earth

The homepage is a single fullscreen WebGL canvas. There is no scroll initially — the entire viewport is the scene. The Earth occupies roughly 60% of the viewport height, positioned slightly left of center (not centered — the asymmetry creates dynamism and leaves compositional space for the text overlay on the right).

**The Earth itself:**

The base sphere uses NASA's Blue Marble 8K texture with accurate ocean color gradation — deep navy in the Pacific, lighter cerulean near coastlines, brown-green for landmasses. Over this sits a second sphere, slightly larger, with a cloud texture that has its own independent slower rotation — about 0.7× the Earth's rotation speed — creating the visual layering of actual cloud systems drifting over continents.

The atmosphere is not a solid layer. It's a custom GLSL shader using the Fresnel equation — the further a surface point is from the camera's viewing angle, the more blue-glow opacity is applied. This creates a thin luminous halo around the entire globe, strongest at the edges, fading to nothing at the pole facing you. It looks exactly like Earth photographed from the ISS.

On the dark side of the Earth (the hemisphere facing away from the simulated sun), city lights are visible — warm amber clusters of civilization, fading to darkness in uninhabited regions. This day/night terminator line moves slowly as the Earth rotates.

Orbiting at two different altitudes are thin white orbital lines — `THREE.Line` objects with dashed segments. Along these lines, two small satellite models (simple low-poly GLTF, matte silver, catching the sun's specular highlight) trace their paths with small blue particle trails fading behind them.

From the surface of the Earth, thin particle streams rise — 500 points each, following cubic Bezier curves toward the camera. These represent data telemetry. They're semi-transparent blue-white, fading in near the surface and fading out as they reach the camera. The overall effect is that Earth is constantly "breathing" data outward.

**The lighting:**

A single directional light simulates the sun, positioned upper-left. The Earth's night side receives only ambient fill at 0.1 intensity. There is a subtle `<Bloom>` postprocessing pass: luminance threshold at 0.8, so only the atmosphere glow and city lights bloom — the rest of the scene remains crisp.

**The parallax:**

The camera subtly shifts based on mouse position. Moving the mouse right moves the camera 2% right. Moving it up moves the camera 1.5% up. The camera position is smoothed with a `0.05` lerp factor — extremely gentle, creating the sensation of a window rather than a rotating object. The Earth doesn't move. The *camera* moves around it. This is the crucial distinction that makes it feel like you're physically present in space looking at Earth.

### The Text Overlay

Over the 3D scene, on the right-center area of the viewport, sits the headline treatment. The background behind it has zero fill — the Earth and space are fully visible through it. The only visual separation is the film grain.

**Line 1:** `MONITOR EARTH.`
Typography: Space Grotesk, 88px, weight 700, letter-spacing `-0.04em`, line-height `0.9`. Pure white. This line animates in first — each word slides up from `y: 60` to `y: 0` with a spring (`stiffness: 80, damping: 12`). The period is the same white but at 60% opacity, suggesting the sentence is unfinished.

**Line 2:** `PREDICT RISK.`
Same treatment, stagger delay `+0.12s` after Line 1 completes.

**Line 3:** `TAKE ACTION.`
Same, stagger delay `+0.12s`.

The three lines together form a vertical rhythm. They're not centered — they're left-aligned to an invisible grid column. The rightmost letter of the longest line (`PREDICT RISK.`) creates a clean vertical edge. This asymmetric grid placement, with the Earth filling the left, creates a visual tension that holds your eye.

**Below the headline:**

After the three lines animate in, a subtext fades in at 600ms delay:
`AI-powered environmental intelligence for any location on Earth.`
Typography: Plus Jakarta Sans, 18px, weight 400, `rgba(255,255,255,0.65)`. Maximum width 420px, allowing natural line breaking after "intelligence".

**The CTA button:**

Below the subtext, 32px gap, sits the primary call to action. It reads: `LAUNCH PLATFORM →`

The button has no background fill. It's outlined: `border: 1.5px solid rgba(255,255,255,0.5)`. Text is Plus Jakarta Sans, 13px, weight 600, letter-spacing `0.12em`, uppercase. Inside, there's a very subtle background of `rgba(255,255,255,0.03)`.

This button has **magnetic behavior**: when the cursor enters a 100px radius around it, the button begins moving toward the cursor — pulled as if by magnetic attraction. The pull follows a physics spring (`stiffness: 150, damping: 15`). At maximum pull (cursor directly on button), the button has displaced 12px. When the cursor leaves the radius, it snaps back with a satisfying spring overshoot. Every press sends a ripple outward from the click point.

On hover, the button fill transitions to `rgba(59, 130, 246, 0.15)`, border color to `rgba(59, 130, 246, 0.8)`, and the arrow `→` slides 4px to the right.

**Scroll indicator:**

At the very bottom center of the viewport, a thin downward-pointing chevron pulses with a `y: 0 → y: 8 → y: 0` loop at 2s. Text above it: `SCROLL TO EXPLORE` in 10px uppercase Inter, `rgba(255,255,255,0.35)`. This disappears entirely once scroll begins.

### Below the Fold: The Sections

**Scroll behavior:** The entire site uses Lenis smooth scroll. The inertia factor is `0.08` — lower than default, meaning the scroll feels heavier, more deliberate. Scrolling through the homepage feels like moving through a physical space rather than flicking content.

As scroll begins, the 3D Earth doesn't disappear — it scales down from `scale: 1` to `scale: 0.4` and shifts upward, becoming a smaller persistent element in the upper-left corner. This transition takes 400ms and uses a spring easing. The hero text simultaneously fades to zero opacity.

**Section 1: "What We Monitor"**

Background transitions to `#0E0E0E` from the deep space black. A three-column grid appears — each column is a feature card.

Each card:
- Background: `rgba(255,255,255,0.04)` (barely visible)
- Border: `1px solid rgba(255,255,255,0.08)`
- `backdrop-filter: blur(20px)`
- Border-radius: `16px`
- Padding: `40px`
- Top: A large icon — not a flat SVG, but a glowing 3D-rendered icon: a flame for wildfire, a wave for flood, a withered leaf for drought. These are small Three.js canvas elements embedded in each card, roughly 60×60px, rotating slowly.

Card title: Space Grotesk, 24px, weight 600, white.
Card body: Plus Jakarta Sans, 15px, weight 400, `rgba(255,255,255,0.65)`, line-height `1.7`.

**Each card has perspective tilt**: on mouse enter, the card rotates toward the cursor — `rotateX` and `rotateY` up to ±12 degrees, with a `perspective(1000px)` transform. The card's inner content also has a `translateZ(20px)` — it "pops" slightly toward you as if the content has depth. On mouse leave, the tilt springs back.

The three cards animate in with a stagger: card 1 at 0ms, card 2 at 80ms, card 3 at 160ms. Each enters from `y: 40, opacity: 0` to `y: 0, opacity: 1` as they enter the viewport.

**Section 2: "How It Works"**

A horizontal three-step process, separated by thin dashed connector lines between the steps. The dashes draw themselves progressively — an SVG `stroke-dashoffset` animation triggered by scroll position. As you scroll, the line draws from Step 1 toward Step 2, then toward Step 3, keeping pace with your scroll position exactly.

Each step:
- Large number: Space Grotesk, 120px, weight 700, color `rgba(255,255,255,0.06)` — enormous, barely visible, purely textural
- Step title overlaid on top of the number: Space Grotesk, 22px, weight 600, white
- Description: Plus Jakarta Sans, 15px, `rgba(255,255,255,0.60)`

Step labels: `01 DRAW`, `02 ANALYZE`, `03 ACT`

**Section 3: "Live Pulse"**

Four cards arranged 2×2, each showing a live data metric. These cards have a distinct treatment — they're **alive**. Every 8-10 seconds, a value updates and the number performs an odometer animation (digits roll up or down individually). A thin border on each card pulses with a bioluminescent glow on the update cycle.

Cards: Active Fires (count + map thumbnail), Global AQI (number + color gradient), Deforestation Rate (hectares/day), Temperature Anomaly (°C above baseline).

**Section 4: The CTA Closer**

A full-width section with a very large centered headline:
`START MONITORING.`
Space Grotesk, 120px on desktop. The words fill nearly the full column width. Below it, the same magnetic button from the hero, larger this time — 56px height, 200px width. And a secondary ghost link: `WATCH HOW IT WORKS →` in smaller, dimmer text.

***

## The Platform Shell: The Container Everything Lives In

Once the user clicks "Launch Platform", a page transition occurs: the content doesn't fade or slide — the entire viewport becomes a rectangle that contracts inward from all four edges simultaneously, like a camera iris closing. Then the platform opens with the reverse — the iris expands outward to reveal the app shell.

### The Navigation Sidebar

The left edge of every platform page is occupied by a narrow sidebar — 72px wide in collapsed state, 240px when expanded. The sidebar background is `rgba(0,0,0,0.6)` with `backdrop-filter: blur(40px)` — it is glass over whatever is behind it (the map, the content, the 3D globe).

**Logo at top**: A custom mark — a simple geometric satellite icon, two panels extending from a central dot. White. 32px. Below it in the expanded state: `SATELLITE MONITOR` in Space Grotesk 12px, weight 600, letter-spacing `0.15em`.

**Navigation items**: Five icons in the collapsed state. On hover, each icon reveals its label with a slide-in from the left — the sidebar doesn't expand on hover; only the label extends as a floating chip to the right of the icon.

Items:
- Dashboard (grid icon)
- Monitor (polygon/draw icon)
- Insights (sparkle/neural icon)
- Analytics (chart line icon)
- Alerts (bell icon — with a red dot badge if alerts exist)

**Active state**: The active nav item has a thin `2px` vertical bar on the left edge of the icon container, in electric blue `#3B82F6`. The icon itself is white at full opacity vs 45% for inactive. The active indicator bar slides between items with a spring animation when you navigate — it doesn't jump, it physically moves.

**Bottom of sidebar**: User avatar (circular), a settings gear icon. Both at 45% opacity until hovered.

### The Top Bar

A 56px bar at the top of every platform page. Background: `rgba(0,0,0,0.4)` with `backdrop-filter: blur(24px)`. Fully transparent-feeling but creating clear separation.

**Left**: Current page title — Space Grotesk, 18px, weight 600, white. With breadcrumb underneath in 12px, `rgba(255,255,255,0.45)`.

**Right**: A cluster of persistent elements:
- A small live status indicator: green pulsing dot + `LIVE` in 11px uppercase green — indicating the WebSocket connection is active
- A bell icon (alerts) with numeric badge if unread alerts exist
- A search icon that expands into a full search field inline (not a modal)
- User avatar with click-to-expand dropdown

**Scroll behavior**: On the AOI deep dive page only, the top bar becomes sticky and increases its blur to `backdrop-filter: blur(60px)` as you scroll, becoming more opaque the further down the page you are.

***

## The Monitor Page: The Core Experience

This is the most important screen in the entire product. A user could spend 90% of their time here.

### The Map

The Mapbox map occupies the left 65% of the viewport. The style is a custom dark satellite style — base imagery is Mapbox Satellite Streets in night mode with extreme modifications:

- All road labels and POI labels turned off (too much noise)
- Water bodies deepened to `#0D1B2A` (very dark navy, almost black)
- Land at night treatment: all urban areas darkened, natural areas near-black
- Country borders reduced to `rgba(255,255,255,0.08)` — barely visible ghost lines
- The overall map reads as near-black with the satellite imagery providing the only texture

At every zoom level, the experience is different: at global zoom you see continental outlines and the deep darkness of oceans; zoom into a forest and the individual tree canopy texture becomes visible in the satellite layer.

**The toolbar**: A floating pill at the top-center of the map — `backdrop-filter: blur(30px)`, `rgba(0,0,0,0.7)` background, border `1px solid rgba(255,255,255,0.1)`. Contains four icon buttons spaced 12px apart:

- ✏️ Draw Polygon (activates draw mode)
- ↩️ Undo last point
- 🗑️ Delete polygon
- 👁 Toggle hazard layer visibility

Each button is circular, 36px. The active draw button glows with a blue ring: `box-shadow: 0 0 0 2px #3B82F6`.

**The layer switcher**: A small floating card at the bottom-left of the map. Three toggle pills: `SATELLITE` / `NDVI` / `TEMPERATURE`. Switching between them triggers a smooth crossfade of the map layer — the satellite imagery fades into a false-color NDVI visualization (deep reds for bare soil, bright greens for dense vegetation), or a thermal heatmap for LST.

### Drawing a Polygon

When draw mode activates:
- The cursor transforms into the precision crosshair
- A subtle vignette appears at the map edges (dark gradient inward 60px) — focusing attention on the drawing area
- A small floating tooltip near the crosshair: `Click to add points` in 11px, `rgba(255,255,255,0.5)`, with a fade-out after 3 seconds

First click places a glowing dot — white fill, 6px radius, blue `box-shadow` glow. The dot has a permanent subtle pulse.

Second click places a second dot. A line connects them — white, 1.5px, with a dashed pattern (`dasharray: 6 4`). The line itself glows softly.

Each subsequent click builds the polygon. As points accumulate, the polygon interior fills with `rgba(59, 130, 246, 0.08)` — barely visible blue tint.

The final point (when you click near the first point, within 20px): a snap animation occurs — the cursor jumps to the first point, a satisfying elastic snap, and the polygon closes. The dashed outline becomes solid, the fill becomes `rgba(59, 130, 246, 0.15)`, and the glow intensifies briefly.

**Live area calculation**: Throughout the drawing process, a floating chip follows the centroid of the current polygon: `2,450 km²` in JetBrains Mono 13px, white, on a `rgba(0,0,0,0.7)` pill. This updates on every point placement.

**Vertex editing**: After completion, each vertex shows as a small handle. Dragging a vertex snaps it to 0.001° grid increments. The polygon redraws in real-time during drag with no perceptible lag.

### The Right Analysis Panel

By default, the right panel (35% width) shows empty state: dark background `#0A0A0A`, subtle vertical divider line between it and the map (`rgba(255,255,255,0.06)`).

The empty state shows centered, vertically:
- A subtle wireframe globe icon — thin white strokes, slowly rotating, 64px
- Headline: `Select an area to analyze` — Space Grotesk, 20px, `rgba(255,255,255,0.5)`
- Subtext: `Draw a polygon on the map` — Plus Jakarta Sans, 14px, `rgba(255,255,255,0.3)`

Once a polygon is drawn, the empty state fades out and is replaced by:

**Polygon summary card**: A glassmorphic card showing the polygon metadata. Area in km², perimeter in km, center coordinates in decimal degrees, and the polygon name (auto-generated: "AOI — Amazon Basin" using reverse geocoding).

**The Analyze button**: Full-width, 52px height. Background: linear gradient from `#1D4ED8` to `#2563EB`. Border: `1px solid rgba(255,255,255,0.2)`. Text: `ANALYZE THIS AREA` in Plus Jakarta Sans, 14px, weight 600, letter-spacing `0.08em`, white.

On hover: the gradient brightens, a subtle inner glow appears, the button lifts `translateY(-1px)`. The magnetic pull is active — it moves toward the cursor within 80px.

On click:
1. The button text fades and is replaced by a minimal spinner (thin circle, 20px, white, rotating)
2. The map dims slightly — `rgba(0,0,0,0.3)` overlay fades in
3. A progress bar appears at the very top of the panel — thin, 2px, electric blue, indeterminate animation

After 6-12 seconds (real GEE processing time, cached on repeat calls):

**Results animation sequence**:
1. Progress bar completes and fades
2. Map overlay fades out
3. The "Analyze" button morphs into a green "ANALYSIS COMPLETE" confirmation, then fades

**Results Panel** slides into view from below, not a page refresh — a scroll container reveals itself:

### The Results: Hazard Risk Overview

**The Hazard Radar Chart** renders first — it's the visual centrepiece of the results. A 280×280px SVG radar chart with 5 axes: Wildfire, Flood, Drought, Landslide, Deforestation. The chart draws itself from the center outward — the polygon path animates from a point at center, expanding outward to its final shape over 800ms with an ease-out spring.

Grid circles at 25, 50, 75, 100 are rendered as thin white circles at 8% opacity. Axis lines extend to the edge at 12% opacity. Axis labels at each tip: Space Grotesk, 11px, weight 500, `rgba(255,255,255,0.7)`.

The data polygon: filled with `rgba(239,68,68,0.15)` (red tint for danger), stroked with `#EF4444` at 2px with SVG glow filter. The glow is a `feGaussianBlur stdDeviation="4"` filtered version merged back, creating a soft red halo.

**Risk score cards**: Five cards below the radar, in a 2+2+1 arrangement. Each card:
- Hazard name: Plus Jakarta Sans, 12px, uppercase, `rgba(255,255,255,0.5)`
- Score: Space Grotesk, 32px, weight 700, colored by severity (green → yellow → orange → red)
- Label: `HIGH` / `MODERATE` / `LOW` in a small badge with matching color tint background
- A thin horizontal progress bar under the score, filling from left to right as the card enters view, with the exact hazard color

The five cards don't appear simultaneously — they stagger in at 60ms intervals, each scaling from `scale: 0.92, opacity: 0` to `scale: 1, opacity: 1`.

**Below the risk cards**: A divider line, then key satellite metrics:

```
NDVI              0.42 (-0.18 vs baseline)  ↓
LST               31.2°C (+3.1° anomaly)    ↑
PRECIPITATION     12mm / 30-day             —
SOIL MOISTURE     0.28 m³/m³ (Dry)          ↓
ELEVATION         248m avg
```

Each metric is a row: label in JetBrains Mono 12px `rgba(255,255,255,0.45)`, value in JetBrains Mono 13px white, change indicator in small colored badge (red arrow down, green arrow up, gray dash for neutral).

**"View Full Report"** button at the bottom: outlined style, `border: 1px solid rgba(255,255,255,0.2)`, slides the user to the AOI detail page.

***

## The AOI Detail Page: The Full Report

### The Hero Banner

The page opens with a fullscreen-width banner, 400px tall. The background is the actual Mapbox satellite imagery of the AOI, blurred `blur(4px)` and darkened with a `rgba(0,0,0,0.65)` overlay. It's recognizably a satellite view of the location — you can see the shape of forests, water bodies — but sufficiently obscured to read text over it.

Over this:
- AOI name: Space Grotesk, 48px, weight 700, white
- Coordinates: JetBrains Mono, 14px, `rgba(255,255,255,0.5)` — `3.456789°S, 60.123456°W`
- Status badge: pulsing dot + `MONITORING ACTIVE` or `ALERT: HIGH RISK` if triggered
- Breadcrumb: `Platform / Monitor / Amazon Basin AOI`

At the bottom edge of the banner, the background image feathers to `#0E0E0E` via a gradient — not a hard cutoff.

### The Overview Section

A two-column layout: 60% map, 40% summary cards.

The map here is static — the AOI polygon rendered over the satellite basemap with the hazard zones highlighted. No interactive drawing. Hazard zones appear as semi-transparent color fills over the geographic areas of concern (fire zones in red-orange, flood zones in blue, deforestation in amber).

Four summary cards in the right column — `<PerspectiveCard>` components, each tilting independently toward the cursor:

1. **Overall Risk Score**: A circular progress gauge (SVG arc), 120px, with the score number at center. The arc strokes from 0° to the risk percentage around the circle. Color matches severity.

2. **Area & Location**: Icon + metric rows. Area, perimeter, biome type (Tropical Rainforest), country.

3. **Last Analysis**: Relative timestamp, data sources used, satellite pass time.

4. **Alert Status**: If no alerts, green badge. If alerts, a red pulsing indicator with the alert count and a "View Alerts" CTA.

### The Hazard Breakdown Tabs

Five tabs: Fire / Flood / Drought / Landslide / Deforestation.

The tab indicator is a thin underline that physically slides between active tabs — not a CSS transition on each tab independently, but a single absolutely-positioned `div` that smoothly interpolates its `left` position and `width` using a spring.

Each tab panel contains:

**Risk meter**: A large horizontal bar, full-width, 12px height. Background `rgba(255,255,255,0.08)`. Fill in the hazard's color, animated on tab entry. The percentage value floats above the fill endpoint, updating as it fills.

**Key risk factors**: A list of 4-6 factors, each with:
- Icon (Lucide, 16px, colored by severity)
- Factor name: Plus Jakarta Sans, 14px, white
- Factor value: JetBrains Mono, 14px, `rgba(255,255,255,0.7)`
- Severity dot: 6px circle, color-coded

Example for Wildfire tab:
```
🌡️ Land Surface Temp    31.2°C       ● HIGH
💧 Fuel Moisture         18.5%        ● HIGH  
🌿 NDVI                  0.42         ● MODERATE
💨 Wind Speed            5.2 m/s      ● MODERATE
⛰️ Slope                 8.5°         ● LOW
```

**Mini visualization**: A small chart (180px height) specific to each hazard:
- Fire: Time-series of LST over the past 90 days, with current date highlighted
- Flood: Elevation histogram of the AOI with flood threshold marked
- Drought: Soil moisture over time with drought threshold line
- Landslide: Slope gradient heatmap thumbnail
- Deforestation: NDVI change map (false-color)

**Recommendations**: 2-3 action items. Each is a card with a bold action verb, description, and urgency badge.

### The Time Series Section

**NDVI Timeline** (the primary chart): Full-width, 280px height. Built in D3.js.

The X axis spans the selected date range (default: 12 months). The Y axis runs from 0 to 1.0 (healthy vegetation). The chart renders with:

- A gradient area fill below the line: from `rgba(16,185,129,0.4)` at top to `rgba(16,185,129,0)` at baseline — representing vegetation health visually
- The line itself: `#10B981` (emerald), 2px, no corners (cardinal curve interpolation)
- Anomaly markers: Where the Isolation Forest detected an outlier, a small red dot sits on the line with a pulsing halo. Hovering reveals a tooltip: the date, value, and the AI anomaly description
- Seasonal baseline band: A very faint `rgba(255,255,255,0.04)` band showing the expected NDVI range for each month of the year — the deviation from this band is immediately visually obvious

The chart enters with a drawing animation: the area fill sweeps in from left-to-right over 1.2s, the line traces itself over the same duration.

**Date range selector**: Below the chart, a two-handle slider built with `<Slider>` — handles are 14px circles with spring physics on drag. Moving handles re-fetches data and the chart transitions smoothly.

**Metric toggle**: Above the chart, pill buttons to swap to Temperature / Precipitation / Soil Moisture — switching triggers a crossfade of the area fill color and re-annotation.

### The Satellite Imagery Comparison

**Before/After Slider**: A full-width (constrained to 800px max), 500px tall container with two satellite images — one dated (e.g., `JAN 2020`) and one current (e.g., `FEB 2026`).

A vertical divider line sits at 50% by default. It has a circular handle at center — 32px, white, with left and right arrow icons. Dragging it reveals more of one image or the other. The drag uses spring physics — it follows the mouse with a tiny lag (`stiffness: 400, damping: 40`), creating a satisfying physical feel.

Both images are initially grayscale via `filter: grayscale(100%)`. When the user hovers the comparison component, a transition over 2000ms eases both images to full color — a luxury, expensive-feeling reveal. The transition is so slow it's almost subliminal, making you feel like you've "earned" seeing the color.

Vegetation loss between the two images is immediately visible — where there was forest green in 2020 there is brown deforestation scarring in 2026. No annotation needed; the images speak for themselves.

***

## The Dashboard: Mission Control

### Layout

The sidebar is on the left. In the main content area, a 280×280px mini Earth scene floats in the upper-right corner — interactive, draggable, zoomable. It has all your saved AOIs as small glowing dots on the surface. Hovering a dot triggers a tooltip: AOI name + current risk level. Clicking flies the full Monitor page map to that location.

### The Stat Cards

Four cards at the top, spanning the width above the mini globe. Each is a `<PerspectiveCard>`:

**Card 1: Active AOIs** — a blue number counter, animated odometer-style from 0 to current count on page load. Icon: polygon outline.

**Card 2: Active Alerts** — the number in red if > 0, with a subtle red glow. If 0, the number is in green.

**Card 3: Satellite Status** — Two checkmarks (Sentinel-2, MODIS) — green if last GEE call succeeded within 6 hours, amber if stale, red if failed.

**Card 4: Global Risk Index** — An aggregate score from all your AOIs. A mini horizontal bar in the card showing the distribution (how many AOIs are low/medium/high risk).

### The Live Activity Timeline

A vertical timeline running down the left portion of the dashboard. Each event is a row:
- A colored dot (red = alert, blue = analysis complete, green = new data)
- Event description in Plus Jakarta Sans, 14px
- Relative timestamp in JetBrains Mono, 12px, `rgba(255,255,255,0.4)`

When a new event arrives via WebSocket, it inserts at the top with a `motion.div` that enters from `y: -20, opacity: 0` and pushes all other items down with Framer Motion's `layout` prop — every existing item smoothly animates to its new position. Nothing jumps.

### The AOI Grid

Below the live feed, a 3-column card grid of your saved AOIs. Each `<AOICard>`:
- A small map thumbnail (static Mapbox image of the AOI)
- AOI name
- Risk level badge
- Last updated timestamp
- A thin colored top border matching the highest-severity hazard color

On hover: the card lifts `translateY(-4px)`, the map thumbnail crossfades from grayscale to color in 2000ms (the same luxury transition from the comparison slider).

***

## The Insights Page

### The Masonry Grid

Full-width masonry layout — not a uniform grid. Cards are different heights based on content length. Two columns on desktop. They cascade like a magazine layout.

**Insight Cards**: Each is a `<PerspectiveCard>` with glassmorphic styling. The content:
- Severity badge (top-left corner): a small colored pill, `HIGH PRIORITY` or `INFORMATIONAL`
- AI-generated headline: Space Grotesk, 20px, weight 600, white — e.g., *"Wildfire corridor expanding northward across 3 monitored regions"*
- Body: Plus Jakarta Sans, 15px, `rgba(255,255,255,0.65)`, 3-4 sentences of AI-generated analysis
- Data citation: JetBrains Mono, 11px, `rgba(255,255,255,0.35)` — e.g., `Source: Sentinel-2 / MODIS · 2026-03-04`
- Bottom: A small sparkline — 60px wide, 24px tall — showing the trend this insight is based on

The cards animate into view as you scroll — each scales from `scale: 0.96, opacity: 0` to `scale: 1, opacity: 1` with a spring, staggered at 50ms intervals. The masonry layout itself reflows with smooth spring transitions if the viewport resizes.

**Hover state**: The card's border color transitions from `rgba(255,255,255,0.08)` to the hazard accent color, and a very faint colored glow appears behind the card (`box-shadow: 0 0 40px -10px [hazard-color]`).

### The Predictive Globe

Below the masonry grid, a full-width panel with a large 3D globe (bigger than the mini globe on the dashboard — 500px). The globe is in heatmap mode: risk probability is overlaid as a transparent color layer directly on the sphere. High-risk zones glow red-orange; low-risk zones are near-invisible.

Three toggle pills above it: `3 MONTHS` / `6 MONTHS` / `1 YEAR`. Switching triggers a shader transition on the globe — the heatmap dissolves and reforms with the new prediction data.

***

## Typography in Motion: The Rules

Every text element on the platform follows exactly one of three animation patterns:

**Pattern A — TextReveal (Headers)**: Words split, each word enters from `y: 40, opacity: 0`. Stagger 50ms per word. Used for all `h1` and hero text.

**Pattern B — FadeUp (Body)**: Full paragraph enters from `y: 20, opacity: 0`. Single animation, no stagger. Used for body copy and card content.

**Pattern C — Counter (Numbers)**: JetBrains Mono values roll up from 0 or from previous value. Duration 1200ms, ease-out cubic. Used for all stat cards and metric values.

Nothing ever just "appears". Every text element has a reason for how it arrives.

***

## Color as Communication

Every color in the system carries meaning that never contradicts itself across the entire product:

```
#3B82F6  Electric Blue   — Action, selection, primary CTA, active states
#10B981  Emerald         — Healthy, safe, low risk, positive change
#F59E0B  Amber           — Caution, moderate risk, watch state
#EF4444  Red             — High risk, danger, critical alerts
#8B5CF6  Violet          — AI-generated content, predictions
#0A0A0A  Void            — Page backgrounds
#0E0E0E  Space           — Card backgrounds
#1A1A1A  Coal            — Input fields, elevated surfaces
```

This semantic color system means a user never needs a legend. Red means danger wherever they see it. Emerald means healthy. Violet means AI is speaking.

***

## The Sound Design Layer *(Optional but Discussed)*

Not audio — but micro-interaction feedback that mimics sound through haptics and animation weight:

- Polygon snap-to-close: a brief scale pulse `1 → 1.05 → 1` on the polygon vertices, 80ms — feels like a click
- Alert arrival: the bell icon in the top bar performs a physical shake animation, 3 oscillations, decreasing amplitude
- Analysis complete: the results panel entry is paired with a brief blue flash (50ms) along the panel border — a visual "ping"
- Data update on live cards: the updating card border flashes to the metric's accent color and returns to default in 200ms

***

## What This All Adds Up To

The visual experience has three distinct registers that shift based on where you are:

**Exploration register** (Homepage, Insights): Dark, cinematic, wide-breathing. Massive type, particles, the Earth floating in space. You feel small in relation to the data. This is intentional — the scale of environmental monitoring is planetary.

**Operational register** (Monitor, Dashboard): Precise, dense, purposeful. The aesthetic pulls back — the 3D effects reduce, the layout tightens. You're now a professional with instruments. The design does not distract from the task.

**Analytical register** (AOI Detail, Analytics): Clinical but beautiful. Charts and data take over. The design provides scaffolding — consistent spacing, typography hierarchy — but the data is the primary visual element. The satellite imagery comparison, the D3 timelines, the before/after slider — these are where the product earns its credibility.

The transition between these registers as users move through the platform is seamless. The same film grain, the same sidebar, the same font system, the same color palette — these threads of consistency tie together what could feel like three different apps into one coherent, unforgettable product.
declare module '@mapbox/mapbox-gl-draw'
declare module '@turf/turf'
// Provide a global type alias used in app code where MapboxDraw is referenced as a type
// This keeps compilation unblocked without altering existing files
type MapboxDraw = any

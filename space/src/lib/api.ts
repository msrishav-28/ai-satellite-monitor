/*
  Shared frontend API helpers for the canonical /space app.
  Added in Phase 4 so hooks and panels use one consistent AOI payload shape,
  base URL, websocket URL, and API response unwrapping strategy.
*/

export type PolygonGeometry = {
  type: 'Polygon'
  coordinates: number[][][]
}

type AOIFeatureLike = {
  type?: string
  geometry?: PolygonGeometry
  properties?: Record<string, unknown>
}

export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

export function getWebSocketUrl() {
  return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws'
}

export function normalizeAOIGeometry(input: PolygonGeometry | AOIFeatureLike) {
  const geometry =
    (input as AOIFeatureLike)?.geometry ??
    (input as PolygonGeometry)

  if (!geometry || geometry.type !== 'Polygon' || !Array.isArray(geometry.coordinates)) {
    throw new Error('A polygon AOI is required')
  }

  return geometry
}

export function buildAOIPayload(input: PolygonGeometry | AOIFeatureLike) {
  return {
    geometry: normalizeAOIGeometry(input),
    properties:
      (input as AOIFeatureLike)?.properties &&
      typeof (input as AOIFeatureLike).properties === 'object'
        ? (input as AOIFeatureLike).properties
        : {},
  }
}

export function unwrapApiData<T>(payload: any): T {
  if (payload?.success === false) {
    throw new Error(payload?.message || payload?.detail || payload?.error || 'Request failed')
  }

  return (payload?.data ?? payload) as T
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Request failed'
}

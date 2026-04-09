/**
 * Core domain types for the satellite monitoring platform.
 */

export interface AOI {
    id: string
    name: string
    region?: string
    coordinates?: [number, number]
    polygon?: GeoJSON.Feature
    area?: number
    riskIndex?: number
    lastScan?: string
}

export interface GeoJSONPolygon {
    type: 'Feature'
    geometry: {
        type: 'Polygon'
        coordinates: number[][][]
    }
    properties: Record<string, unknown>
}

export interface HazardData {
    wildfire: { risk: number; trend: number }
    flood: { risk: number; trend: number }
    drought: { risk: number; trend: number }
    deforestation: { risk: number; trend: number }
    air_quality: { risk: number; trend: number }
}

export interface AlertItem {
    id: string
    title: string
    description: string
    severity: 'critical' | 'high' | 'moderate' | 'low'
    status: 'active' | 'acknowledged' | 'resolved'
    aoi: string
    type: string
    timestamp: string
}

export interface WebSocketMessage {
    type: string
    payload: Record<string, unknown>
    timestamp: number
}

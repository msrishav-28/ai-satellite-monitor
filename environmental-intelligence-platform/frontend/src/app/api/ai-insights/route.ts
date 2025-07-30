import { NextResponse } from 'next/server'

// Mock data for now, will be replaced with real model outputs
const mockInsightsData = {
  anomaly: {
    title: 'Anomalous NDVI Drop Detected',
    details: 'A significant drop in vegetation health (NDVI) was detected on the western edge of the AOI, inconsistent with seasonal patterns. This may indicate an unregistered deforestation event or pest infestation.',
    confidence: 92,
  },
  causal: {
    title: 'Road Construction Impact Assessment',
    details: 'Causal analysis suggests the new logging road is responsible for a 15% increase in deforestation in the surrounding area compared to similar areas without new road development.',
    impact: '15% increase',
  },
  fusion: {
    title: 'All-Weather Monitoring Active',
    details: 'Optical (Sentinel-2) and Radar (Sentinel-1) data have been fused to provide continuous monitoring, even during periods of heavy cloud cover.',
    status: 'Active',
  },
}

export async function POST(request: Request) {
  const { aoi } = await request.json()

  if (!aoi) {
    return NextResponse.json({ error: 'AOI is required' }, { status: 400 })
  }

  // In a real implementation, you would use the AOI data to run
  // the various advanced analytics models and return their outputs.

  return NextResponse.json(mockInsightsData)
} 
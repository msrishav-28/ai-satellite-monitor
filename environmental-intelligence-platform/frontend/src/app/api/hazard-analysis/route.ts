import { NextResponse } from 'next/server'

// Mock data for now, will be replaced with real model outputs
const mockHazardData = {
  wildfire: { risk: 78, trend: 'up' },
  flood: { risk: 45, trend: 'down' },
  landslide: { risk: 62, trend: 'stable' },
  deforestation: { risk: 30, trend: 'up' },
  heatwave: { risk: 85, trend: 'up' },
  cyclone: { risk: 15, trend: 'down' },
}

export async function POST(request: Request) {
  const { aoi } = await request.json()

  if (!aoi) {
    return NextResponse.json({ error: 'AOI is required' }, { status: 400 })
  }

  // In a real implementation, you would use the AOI data to run
  // the various hazard prediction models and return their outputs.

  return NextResponse.json(mockHazardData)
} 
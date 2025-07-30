import { NextResponse } from 'next/server'

// Mock data for now, will be replaced with real data
const mockLayerData = {
  'wildfire-risk': {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.4, 37.8],
        },
        properties: {
          risk: 80,
        },
      },
    ],
  },
  'flood-zones': {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-90.1, 29.9],
        },
        properties: {
          risk: 60,
        },
      },
    ],
  },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const layerId = searchParams.get('id')

  if (!layerId) {
    return NextResponse.json({ error: 'Layer ID is required' }, { status: 400 })
  }

  // In a real implementation, you would use the layer ID to fetch
  // the appropriate data from your backend models or a tile server.

  const data = mockLayerData[layerId as keyof typeof mockLayerData]

  if (!data) {
    return NextResponse.json({ error: 'Invalid layer ID' }, { status: 400 })
  }

  return NextResponse.json(data)
} 
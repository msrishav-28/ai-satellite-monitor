'use client'

import { useRef, useEffect, useState } from 'react'
import Map, { Source, Layer } from 'react-map-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useMapStore } from '@/store/useMapStore'
import GlobeControls from './GlobeControls'
import AOIDrawing from './AOIDrawing'
import { Projection } from 'react-map-gl'

interface Props {
  onAOISelect: (aoi: any) => void
  onLoadingChange: (loading: boolean) => void
}

export default function InteractiveGlobe({ onAOISelect, onLoadingChange }: Props) {
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2.5,
    pitch: 0,
    bearing: 0
  })
  
  const { activeLayers, setMapInstance } = useMapStore()
  const [layerData, setLayerData] = useState<Record<string, any>>({})
  const projection: Projection = {
    name: 'globe'
  }

  useEffect(() => {
    if (mapRef.current) {
      setMapInstance(mapRef.current)
    }
  }, [setMapInstance])

  useEffect(() => {
    const fetchLayerData = async (layerId: string) => {
      onLoadingChange(true)
      try {
        const response = await fetch(`/api/map-layer?id=${layerId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch data for layer: ${layerId}`)
        }
        const data = await response.json()
        setLayerData((prev) => ({ ...prev, [layerId]: data }))
      } catch (error) {
        console.error(error)
      } finally {
        onLoadingChange(false)
      }
    }

    activeLayers.forEach((layerId: string) => {
      if (!layerData[layerId]) {
        fetchLayerData(layerId)
      }
    })
  }, [activeLayers, layerData, onLoadingChange])

  const handleMapLoad = () => {
    const map = mapRef.current
    if (!map) return

    // Enable globe projection
    map.setProjection('globe')
    
    // Add atmosphere effect
    map.setFog({
      'range': [-1, 2],
      'color': '#0a0f1b',
      'horizon-blend': 0.3
    })

    // Start rotation animation
    let isRotating = true
    const rotateCamera = (timestamp: number) => {
      if (isRotating && map) {
        map.rotateTo((timestamp / 200) % 360, { duration: 0 })
        requestAnimationFrame(rotateCamera)
      }
    }
    
    rotateCamera(0)

    // Stop rotation on user interaction
    map.on('mousedown', () => { isRotating = false })
    map.on('touchstart', () => { isRotating = false })
  }

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        onLoad={handleMapLoad}
        projection={projection}
      >
        <GlobeControls />
        <AOIDrawing onComplete={onAOISelect} />
        
        {activeLayers.map((layerId: string) => (
          layerData[layerId] && (
            <Source
              key={layerId}
              id={`${layerId}-source`}
              type="geojson"
              data={layerData[layerId]}
            >
              <Layer
                id={`${layerId}-layer`}
                type="heatmap" // This could be dynamic based on layer type
                paint={{
                  'heatmap-intensity': 1,
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)',
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                  ],
                  'heatmap-radius': 30,
                  'heatmap-opacity': 0.7
                }}
              />
            </Source>
          )
        ))}
      </Map>
    </div>
  )
}
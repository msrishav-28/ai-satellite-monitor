import { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'

interface UseMapboxOptions {
  container: string
  style?: string
  center?: [number, number]
  zoom?: number
  projection?: 'globe' | 'mercator'
  accessToken?: string
}

interface MapboxState {
  map: mapboxgl.Map | null
  draw: MapboxDraw | null
  isLoaded: boolean
  error: string | null
}

export function useMapbox(options: UseMapboxOptions) {
  const {
    container,
    style = 'mapbox://styles/mapbox/satellite-streets-v12',
    center = [0, 0],
    zoom = 2,
    projection = 'globe',
    accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  } = options

  const [state, setState] = useState<MapboxState>({
    map: null,
    draw: null,
    isLoaded: false,
    error: null
  })

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setState(prev => ({ ...prev, error: 'Mapbox access token is required' }))
      return
    }

    if (!container) {
      setState(prev => ({ ...prev, error: 'Container element is required' }))
      return
    }

    mapboxgl.accessToken = accessToken

    try {
      const map = new mapboxgl.Map({
        container,
        style,
        center,
        zoom,
        projection: projection as any,
        antialias: true
      })

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add fullscreen control
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      // Initialize drawing tools
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'draw_polygon'
      })

      map.addControl(draw, 'top-left')

      map.on('load', () => {
        // Enable globe atmosphere
        if (projection === 'globe') {
          map.setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
          })
        }

        setState(prev => ({
          ...prev,
          map,
          draw,
          isLoaded: true,
          error: null
        }))

        mapRef.current = map
        drawRef.current = draw
      })

      map.on('error', (e) => {
        setState(prev => ({ ...prev, error: e.error?.message || 'Map error occurred' }))
      })

      return () => {
        map.remove()
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize map'
      }))
    }
  }, [container, style, center, zoom, projection, accessToken])

  const flyTo = useCallback((coordinates: [number, number], zoom?: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: coordinates,
        zoom: zoom || mapRef.current.getZoom(),
        essential: true
      })
    }
  }, [])

  const addLayer = useCallback((layer: mapboxgl.AnyLayer) => {
    if (mapRef.current && state.isLoaded) {
      mapRef.current.addLayer(layer)
    }
  }, [state.isLoaded])

  const removeLayer = useCallback((layerId: string) => {
    if (mapRef.current && state.isLoaded) {
      if (mapRef.current.getLayer(layerId)) {
        mapRef.current.removeLayer(layerId)
      }
    }
  }, [state.isLoaded])

  const addSource = useCallback((sourceId: string, source: mapboxgl.AnySourceData) => {
    if (mapRef.current && state.isLoaded) {
      mapRef.current.addSource(sourceId, source)
    }
  }, [state.isLoaded])

  const removeSource = useCallback((sourceId: string) => {
    if (mapRef.current && state.isLoaded) {
      if (mapRef.current.getSource(sourceId)) {
        mapRef.current.removeSource(sourceId)
      }
    }
  }, [state.isLoaded])

  const getDrawnFeatures = useCallback(() => {
    if (drawRef.current) {
      return drawRef.current.getAll()
    }
    return null
  }, [])

  const clearDrawnFeatures = useCallback(() => {
    if (drawRef.current) {
      drawRef.current.deleteAll()
    }
  }, [])

  const setDrawMode = useCallback((mode: string) => {
    if (drawRef.current) {
      drawRef.current.changeMode(mode)
    }
  }, [])

  return {
    map: state.map,
    draw: state.draw,
    isLoaded: state.isLoaded,
    error: state.error,
    flyTo,
    addLayer,
    removeLayer,
    addSource,
    removeSource,
    getDrawnFeatures,
    clearDrawnFeatures,
    setDrawMode
  }
}
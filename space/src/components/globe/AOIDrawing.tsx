'use client'

/*
  AOI drawing control layered on top of the Mapbox globe.
  Updated in Phase 4 so draw styling matches the canonical red /space visual
  system instead of the previous blue-green defaults.
*/

import { useEffect, useRef, useState } from 'react'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { useMap } from 'react-map-gl/mapbox'
import { Pencil, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  onComplete: (geojson: any) => void
}

export default function AOIDrawing({ onComplete }: Props) {
  const { current: map } = useMap()
  const drawRef = useRef<MapboxDraw | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    if (!map) return

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      styles: [
        {
          id: 'gl-draw-polygon-fill-inactive',
          type: 'fill',
          filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#ff0000',
            'fill-outline-color': '#ff0000',
            'fill-opacity': 0.08,
          },
        },
        {
          id: 'gl-draw-polygon-fill-active',
          type: 'fill',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': '#ff3b30',
            'fill-outline-color': '#ff3b30',
            'fill-opacity': 0.16,
          },
        },
        {
          id: 'gl-draw-polygon-stroke-inactive',
          type: 'line',
          filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#ff4d4f',
            'line-width': 2,
          },
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 3,
          },
        },
      ],
    })

    map.addControl(draw)
    drawRef.current = draw

    return () => {
      map.removeControl(draw)
    }
  }, [map])

  const handleDrawClick = () => {
    if (!drawRef.current) return

    if (!isDrawing) {
      drawRef.current.changeMode('draw_polygon')
      setIsDrawing(true)
      return
    }

    const data = drawRef.current.getAll()
    if (data.features.length > 0) {
      onComplete(data.features[0])
      drawRef.current.deleteAll()
    }
    setIsDrawing(false)
  }

  return (
    <motion.button
      className={`absolute bottom-60 left-1/2 flex -translate-x-1/2 items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] transition-all duration-700 group ${
        isDrawing
          ? 'bg-red-600 text-white'
          : 'bg-white text-black hover:bg-red-600 hover:text-white'
      }`}
      onClick={handleDrawClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isDrawing ? (
        <>
          <Check className="h-4 w-4" />
          <span className="relative z-10">Confirm Selection</span>
        </>
      ) : (
        <>
          <Pencil className="h-4 w-4" />
          <span className="relative z-10">Define Area of Interest</span>
        </>
      )}
    </motion.button>
  )
}

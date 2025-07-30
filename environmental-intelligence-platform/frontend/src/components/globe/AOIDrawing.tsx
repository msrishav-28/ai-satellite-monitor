'use client'

import { useEffect, useRef } from 'react'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { useMap } from 'react-map-gl'
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
        trash: true
      },
      styles: [
        {
          'id': 'gl-draw-polygon-fill-inactive',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'paint': {
            'fill-color': '#3b82f6',
            'fill-outline-color': '#3b82f6',
            'fill-opacity': 0.1
          }
        },
        {
          'id': 'gl-draw-polygon-fill-active',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'paint': {
            'fill-color': '#10b981',
            'fill-outline-color': '#10b981',
            'fill-opacity': 0.2
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-inactive',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#3b82f6',
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-active',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#10b981',
            'line-width': 3
          }
        }
      ]
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
    } else {
      const data = drawRef.current.getAll()
      if (data.features.length > 0) {
        onComplete(data.features[0])
        drawRef.current.deleteAll()
      }
      setIsDrawing(false)
    }
  }

  return (
    <motion.button
      className="absolute bottom-60 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-green rounded-full text-white font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transition-shadow"
      onClick={handleDrawClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isDrawing ? (
        <>
          <Check className="w-5 h-5" />
          Confirm Selection
        </>
      ) : (
        <>
          <Pencil className="w-5 h-5" />
          Define Area of Interest
        </>
      )}
    </motion.button>
  )
}
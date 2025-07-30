'use client'

import { useMapStore } from '@/store/useMapStore'
import { ZoomIn, ZoomOut, Compass } from 'lucide-react'

export default function GlobeControls() {
  const { mapInstance } = useMapStore()

  const handleZoomIn = () => {
    mapInstance?.zoomIn()
  }

  const handleZoomOut = () => {
    mapInstance?.zoomOut()
  }

  const handleResetNorth = () => {
    mapInstance?.resetNorth()
  }

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button onClick={handleZoomIn} className="p-2 bg-black/50 rounded-full">
        <ZoomIn />
      </button>
      <button onClick={handleZoomOut} className="p-2 bg-black/50 rounded-full">
        <ZoomOut />
      </button>
      <button onClick={handleResetNorth} className="p-2 bg-black/50 rounded-full">
        <Compass />
      </button>
    </div>
  )
}

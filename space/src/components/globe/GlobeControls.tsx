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
    <div className="absolute top-4 right-4 flex flex-col gap-3">
      <button onClick={handleZoomIn} className="w-10 h-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
        <ZoomIn className="w-4 h-4" />
      </button>
      <button onClick={handleZoomOut} className="w-10 h-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
        <ZoomOut className="w-4 h-4" />
      </button>
      <button onClick={handleResetNorth} className="w-10 h-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
        <Compass className="w-4 h-4" />
      </button>
    </div>
  )
}

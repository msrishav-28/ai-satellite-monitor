'use client'

import { useState } from 'react'
import InteractiveGlobe from '@/components/globe/InteractiveGlobe'
import LayerControl from '@/components/panels/LayerControl'
import SearchPanel from '@/components/panels/SearchPanel'
import EnhancedAQIPanel from '@/components/panels/EnhancedAQIPanel'
import WeatherPanel from '@/components/panels/WeatherPanel'
import LoadingOverlay from '@/components/shared/LoadingOverlay'

export default function EnvironmentalPage() {
  const [loading, setLoading] = useState(false)
  const [selectedAOI, setSelectedAOI] = useState<any>(null)

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0">
        <InteractiveGlobe onAOISelect={setSelectedAOI} onLoadingChange={setLoading} />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <SearchPanel />
        </div>
        <div className="pointer-events-auto">
          <LayerControl />
        </div>

        {selectedAOI && (
          <>
            <div className="pointer-events-auto">
              <EnhancedAQIPanel aoi={selectedAOI} />
            </div>
            <div className="pointer-events-auto">
              <WeatherPanel aoi={selectedAOI} />
            </div>
          </>
        )}
      </div>

      <LoadingOverlay isLoading={loading} variant="detailed" />
    </div>
  )
}

'use client'

import { useState } from 'react'
import InteractiveGlobe from '@/components/globe/InteractiveGlobe'
import SearchPanel from '@/components/panels/SearchPanel'
import LayerControl from '@/components/panels/LayerControl'
import MetricsPanel from '@/components/panels/MetricsPanel'
import HazardAnalysis from '@/components/panels/HazardAnalysis'
import AIInsights from '@/components/panels/AIInsights'
import ImpactAnalysis from '@/components/panels/ImpactAnalysis'
import TimeSeriesControl from '@/components/panels/TimeSeriesControl'
import LoadingOverlay from '@/components/shared/LoadingOverlay'

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [selectedAOI, setSelectedAOI] = useState(null)
  const [activePanel, setActivePanel] = useState<string | null>(null)

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main globe container */}
      <div className="absolute inset-0">
        <InteractiveGlobe
          onAOISelect={setSelectedAOI}
          onLoadingChange={setLoading}
        />
      </div>

      {/* UI Overlay Layer */}
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
              <MetricsPanel aoi={selectedAOI} />
            </div>
            <div className="pointer-events-auto">
              <HazardAnalysis aoi={selectedAOI} />
            </div>
          </>
        )}

        {activePanel === 'ai-insights' && selectedAOI && (
          <div className="pointer-events-auto">
            <AIInsights aoi={selectedAOI} />
          </div>
        )}
        {activePanel === 'impact' && (
          <div className="pointer-events-auto">
            <ImpactAnalysis aoi={selectedAOI} />
          </div>
        )}
        {activePanel === 'time-series' && (
          <div className="pointer-events-auto">
            <TimeSeriesControl aoi={selectedAOI} />
          </div>
        )}
      </div>

      {/* Loading overlay */}
      <LoadingOverlay isLoading={loading} variant="detailed" />
    </div>
  )
}
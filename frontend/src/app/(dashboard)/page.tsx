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
    <div className="relative w-full h-full">
      <InteractiveGlobe 
        onAOISelect={setSelectedAOI}
        onLoadingChange={setLoading}
      />
      
      <SearchPanel />
      <LayerControl />
      
      {selectedAOI && (
        <>
          <MetricsPanel aoi={selectedAOI} />
          <HazardAnalysis aoi={selectedAOI} />
        </>
      )}
      
      {activePanel === 'ai-insights' && <AIInsights />}
      {activePanel === 'impact' && <ImpactAnalysis aoi={selectedAOI} />}
      {activePanel === 'time-series' && <TimeSeriesControl aoi={selectedAOI} />}
      
      <LoadingOverlay isLoading={loading} />
    </div>
  )
}
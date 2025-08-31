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
import EnhancedAQIPanel from '@/components/panels/EnhancedAQIPanel'
import WeatherPanel from '@/components/panels/WeatherPanel'

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [selectedAOI, setSelectedAOI] = useState(null)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [showEnhancedAQI, setShowEnhancedAQI] = useState<boolean>(false)
  const [showWeather, setShowWeather] = useState<boolean>(false)

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

        {/* Quick toggle for Enhanced AQI panel */}
        <div className="pointer-events-auto absolute top-4 right-4 z-20 flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-lg text-xs transition glass-panel hover:opacity-90 ${showEnhancedAQI ? 'ring-1 ring-purple-500 text-purple-300' : 'text-text-secondary'}`}
            onClick={() => setShowEnhancedAQI((v: boolean) => !v)}
          >
            {showEnhancedAQI ? 'Hide Enhanced AQI' : 'Show Enhanced AQI'}
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-xs transition glass-panel hover:opacity-90 ${showWeather ? 'ring-1 ring-cyan-500 text-cyan-300' : 'text-text-secondary'}`}
            onClick={() => setShowWeather((v: boolean) => !v)}
          >
            {showWeather ? 'Hide Weather' : 'Show Weather'}
          </button>
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

        {showEnhancedAQI && selectedAOI && (
          <div className="pointer-events-auto">
            <EnhancedAQIPanel aoi={selectedAOI} onClose={() => setShowEnhancedAQI(false)} />
          </div>
        )}
        {showWeather && selectedAOI && (
          <div className="pointer-events-auto">
            <WeatherPanel aoi={selectedAOI} onClose={() => setShowWeather(false)} />
          </div>
        )}
      </div>

      {/* Loading overlay */}
      <LoadingOverlay isLoading={loading} variant="detailed" />
    </div>
  )
}
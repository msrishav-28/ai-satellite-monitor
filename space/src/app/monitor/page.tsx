'use client'

/*
  Full-screen mission-control monitor page.
  Updated in Phase 4 to expose the repaired impact and timelapse overlays and
  make the quick-action workflow clearer when no AOI is selected yet.
*/

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Layers, Brain, Shield, BarChart3, Film, Leaf } from 'lucide-react'
import { Nav } from '@/components/Nav'
import { Magnetic } from '@/components/ui/Magnetic'

const InteractiveGlobe = dynamic(
  () => import('@/components/globe/InteractiveGlobe'),
  { ssr: false, loading: () => <div className="h-full w-full bg-[#0E0E0E]" /> }
)
const WeatherPanel = dynamic(() => import('@/components/panels/WeatherPanel'), { ssr: false })
const EnhancedAQIPanel = dynamic(() => import('@/components/panels/EnhancedAQIPanel'), { ssr: false })
const HazardAnalysis = dynamic(() => import('@/components/panels/HazardAnalysis'), { ssr: false })
const AIInsights = dynamic(() => import('@/components/panels/AIInsights'), { ssr: false })
const ImpactAnalysis = dynamic(() => import('@/components/panels/ImpactAnalysis'), { ssr: false })
const MetricsPanel = dynamic(() => import('@/components/panels/MetricsPanel'), { ssr: false })
const SearchPanel = dynamic(() => import('@/components/panels/SearchPanel'), { ssr: false })
const LayerControl = dynamic(() => import('@/components/panels/LayerControl'), { ssr: false })
const TimeSeriesControl = dynamic(() => import('@/components/panels/TimeSeriesControl'), { ssr: false })

type ActivePanel = 'metrics' | 'weather' | 'aqi' | 'hazard' | 'ai' | 'impact' | 'timelapse' | null

export default function MonitorPage() {
  const [selectedAOI, setSelectedAOI] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const hasSelection = Boolean(selectedAOI)

  const handleAOISelect = useCallback((aoi: any) => {
    setSelectedAOI(aoi)
    setActivePanel('metrics')
  }, [])

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0E0E0E] text-white">
      <Nav />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-1 left-0 right-0 z-[120] h-1 origin-left bg-red-600"
          >
            <motion.div
              className="h-full bg-white/30"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0">
        <InteractiveGlobe
          onAOISelect={handleAOISelect}
          onLoadingChange={handleLoadingChange}
        />
      </div>

      <div className="relative z-10">
        <SearchPanel />
        <LayerControl />

        <div className="fixed bottom-8 left-1/2 z-20 -translate-x-1/2">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
          >
            {[
              { id: 'metrics' as const, icon: BarChart3, label: 'Metrics' },
              { id: 'weather' as const, icon: Globe, label: 'Weather' },
              { id: 'aqi' as const, icon: Layers, label: 'Air Quality' },
              { id: 'hazard' as const, icon: Shield, label: 'Hazards' },
              { id: 'ai' as const, icon: Brain, label: 'AI Insights' },
              { id: 'impact' as const, icon: Leaf, label: 'Impact' },
              { id: 'timelapse' as const, icon: Film, label: 'Timelapse' },
            ].map((item) => (
              <Magnetic key={item.id} strength={0.3}>
                <button
                  onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
                  disabled={!hasSelection}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                    activePanel === item.id
                      ? 'bg-red-600 text-white'
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                  } ${!hasSelection ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              </Magnetic>
            ))}
          </motion.div>

          {!hasSelection && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center text-[11px] uppercase tracking-[0.24em] text-white/40"
            >
              Define an AOI on the globe to unlock analysis panels
            </motion.p>
          )}
        </div>

        <AnimatePresence>
          {selectedAOI && activePanel === 'metrics' && (
            <MetricsPanel aoi={selectedAOI} />
          )}
          {selectedAOI && activePanel === 'weather' && (
            <WeatherPanel aoi={selectedAOI} onClose={() => setActivePanel(null)} />
          )}
          {selectedAOI && activePanel === 'aqi' && (
            <EnhancedAQIPanel aoi={selectedAOI} onClose={() => setActivePanel(null)} />
          )}
          {selectedAOI && activePanel === 'hazard' && (
            <HazardAnalysis aoi={selectedAOI} />
          )}
          {selectedAOI && activePanel === 'ai' && (
            <AIInsights aoi={selectedAOI} />
          )}
          {selectedAOI && activePanel === 'impact' && (
            <ImpactAnalysis aoi={selectedAOI} />
          )}
          {selectedAOI && activePanel === 'timelapse' && (
            <TimeSeriesControl aoi={selectedAOI} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

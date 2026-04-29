'use client'

/*
  Hazard analysis overlay for the monitor view.
  Updated in Phase 4 to align the panel with the backend's risk_score-based
  payload, highlight overall priorities, and handle error states explicitly.
*/

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Flame, Droplet, Mountain, Trees, Sun, Wind } from 'lucide-react'
import { GlassPanel } from '../shared/GlassPanel'
import { RiskGauge } from '../charts/RiskGauge'
import { useHazardAnalysis } from '../../hooks/useHazardPrediction'
import { toErrorMessage } from '../../lib/api'

interface Props {
  aoi: any
}

const hazardIcons = {
  wildfire: <Flame className="h-6 w-6 text-red-400" />,
  flood: <Droplet className="h-6 w-6 text-blue-400" />,
  landslide: <Mountain className="h-6 w-6 text-yellow-400" />,
  deforestation: <Trees className="h-6 w-6 text-green-400" />,
  heatwave: <Sun className="h-6 w-6 text-orange-400" />,
  cyclone: <Wind className="h-6 w-6 text-purple-400" />,
}

export default function HazardAnalysis({ aoi }: Props) {
  const { analyzeHazards, data: hazardData, isLoading: loading, error } = useHazardAnalysis()

  const hazardEntries = hazardData
    ? Object.entries(hazardData).filter(([, value]) => (
        Boolean(value) &&
        typeof value === 'object' &&
        'risk_score' in value
      ))
    : []

  useEffect(() => {
    if (!aoi) return

    analyzeHazards(aoi)
  }, [aoi, analyzeHazards])

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1,
      }}
      className="absolute top-80 right-4 z-10 h-auto w-[420px]"
    >
      <GlassPanel variant="elevated" className="overflow-hidden">
        <div className="p-6">
          <motion.h3
            className="mb-6 flex items-center text-xl font-bold text-gradient"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
            Hazard Analysis
            <div className="ml-3 h-2 w-2 rounded-full bg-red-500 animate-glow-pulse" />
          </motion.h3>

          {loading ? (
            <div className="space-y-4">
              <div className="p-6 text-center">
                <motion.div
                  className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-purple-500/20 border-t-purple-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-text-secondary">Analyzing hazards...</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="glass-panel rounded-xl p-4 space-y-3">
                    <div className="loading-skeleton mx-auto h-16 w-16 rounded-full" />
                    <div className="loading-skeleton mx-auto h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-sm font-semibold text-red-300">Hazard analysis unavailable</p>
              <p className="mt-2 text-sm text-text-secondary">{toErrorMessage(error)}</p>
            </div>
          ) : !hazardData ? (
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-sm text-text-secondary">Define an AOI to generate multi-hazard analysis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-text-tertiary">Overall Exposure</p>
                    <p className="mt-2 text-3xl font-semibold text-white">
                      {Math.round(hazardData.overall_risk_score)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.24em] text-text-tertiary">Priority Hazards</p>
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      {hazardData.priority_hazards.length > 0 ? (
                        hazardData.priority_hazards.map((hazard) => (
                          <span
                            key={hazard}
                            className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-red-200"
                          >
                            {hazard}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-text-secondary">No priority flags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {hazardEntries.map(([key, value]: [string, any], index) => (
                  <motion.div
                    key={key}
                    className="glass-panel group cursor-pointer rounded-xl p-4 text-center transition-all duration-300 hover:bg-glass-secondary hover:shadow-glass-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.4 + index * 0.1,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RiskGauge value={value.risk_score} />
                    </motion.div>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center">
                        {hazardIcons[key as keyof typeof hazardIcons]}
                      </div>
                      <span className="text-sm font-medium capitalize text-text-primary transition-colors duration-200 group-hover:text-white">
                        {key}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-text-tertiary">
                      Risk: {Math.round(value.risk_score)}% · {value.risk_level}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

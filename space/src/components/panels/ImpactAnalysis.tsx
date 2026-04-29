'use client'

/*
  Impact analysis overlay for the monitor view.
  Updated in Phase 4 to surface the backend's overall assessment fields and
  provide loading and error states consistent with the rest of /space.
*/

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Footprints, PawPrint, Sprout, Droplets } from 'lucide-react'
import { GlassPanel } from '../shared/GlassPanel'
import { useImpactAnalysis } from '../../hooks/useImpactAnalysis'
import { toErrorMessage } from '../../lib/api'

interface Props {
  aoi: any
}

export default function ImpactAnalysis({ aoi }: Props) {
  const { analyzeImpact, data: impactData, isLoading: loading, error } = useImpactAnalysis()

  useEffect(() => {
    if (!aoi) return

    analyzeImpact(aoi)
  }, [aoi, analyzeImpact])

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
      className="absolute bottom-24 left-1/2 z-10 w-2/3 max-w-4xl -translate-x-1/2"
    >
      <GlassPanel variant="elevated" className="overflow-hidden">
        <div className="p-6">
          <h3 className="mb-6 flex items-center text-lg font-bold text-gradient">
            <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            Impact Analysis
          </h3>

          {loading ? (
            <div className="space-y-4">
              <div className="p-6 text-center">
                <motion.div
                  className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-red-500/20 border-t-red-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-text-secondary">Analyzing environmental impacts...</p>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="glass-panel rounded-xl p-4 space-y-3">
                    <div className="loading-skeleton h-5 w-28" />
                    <div className="loading-skeleton h-4 w-full" />
                    <div className="loading-skeleton h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-sm font-semibold text-red-300">Impact analysis unavailable</p>
              <p className="mt-2 text-sm text-text-secondary">{toErrorMessage(error)}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-text-tertiary">Overall Assessment</p>
                    <p className="mt-2 text-3xl font-semibold text-white">
                      {Math.round(impactData?.overall_assessment.impact_score ?? 0)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm md:text-right">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">Severity</p>
                      <p className="mt-2 font-medium capitalize text-red-200">{impactData?.overall_assessment.severity}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">Urgency</p>
                      <p className="mt-2 font-medium capitalize text-white">{impactData?.overall_assessment.urgency}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="glass-panel rounded-xl p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <Footprints className="h-4 w-4 text-red-300" />
                    Carbon
                  </h4>
                  <p className="text-sm text-text-secondary">Emissions: <span className="text-white">{impactData?.carbon.emissions} tCO2e</span></p>
                  <p className="mt-2 text-sm text-text-secondary">Sequestration: <span className="text-white">{impactData?.carbon.sequestration} tCO2e</span></p>
                </div>

                <div className="glass-panel rounded-xl p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <PawPrint className="h-4 w-4 text-emerald-300" />
                    Biodiversity
                  </h4>
                  <p className="text-sm text-text-secondary">Species affected: <span className="text-white">{impactData?.biodiversity.species_affected}</span></p>
                  <p className="mt-2 text-sm text-text-secondary">Habitat loss: <span className="text-white">{impactData?.biodiversity.habitat_loss} km²</span></p>
                </div>

                <div className="glass-panel rounded-xl p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <Sprout className="h-4 w-4 text-amber-300" />
                    Agriculture
                  </h4>
                  <p className="text-sm text-text-secondary">Yield: <span className="text-white">{impactData?.agriculture.yield_prediction}</span></p>
                  <p className="mt-2 text-sm text-text-secondary">Soil moisture: <span className="text-white">{impactData?.agriculture.soil_moisture}</span></p>
                </div>

                <div className="glass-panel rounded-xl p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <Droplets className="h-4 w-4 text-sky-300" />
                    Water
                  </h4>
                  <p className="text-sm text-text-secondary">Surface change: <span className="text-white">{impactData?.water.surface_water_change}%</span></p>
                  <p className="mt-2 text-sm text-text-secondary">Snowpack: <span className="text-white">{impactData?.water.snowpack_level}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

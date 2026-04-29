'use client'

/*
  AI insights overlay for the monitor view.
  Updated in Phase 4 to render the backend's structured anomaly, causal, and
  fusion payloads while covering loading and error states.
*/

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Search } from 'lucide-react'
import { GlassPanel } from '../shared/GlassPanel'
import { useAIInsights } from '../../hooks/useAIInsights'
import { toErrorMessage } from '../../lib/api'

interface Props {
  aoi: any
}

export default function AIInsights({ aoi }: Props) {
  const { generateInsights, data: insightsData, isLoading: loading, error } = useAIInsights()

  useEffect(() => {
    if (!aoi) return

    generateInsights(aoi)
  }, [aoi, generateInsights])

  const fusionStatusColor = insightsData?.fusion.status === 'Active'
    ? 'text-green-400'
    : insightsData?.fusion.status === 'Partial'
      ? 'text-amber-300'
      : 'text-text-secondary'

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: '100%', opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="absolute bottom-6 left-1/2 z-10 w-[90%] max-w-5xl -translate-x-1/2"
    >
      <GlassPanel variant="purple" className="overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-600/5" />
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="relative z-10 p-8">
          <motion.h3
            className="mb-8 flex items-center text-2xl font-bold text-gradient-purple"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple animate-glow-pulse">
              <Brain className="h-5 w-5 text-white" />
            </div>
            AI-Powered Insights
            <div className="ml-4 flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="h-2 w-2 rounded-full bg-purple-500"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.h3>

          {loading ? (
            <div className="space-y-6">
              <div className="p-8 text-center">
                <motion.div
                  className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-purple-500/20 border-t-purple-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="mb-2 text-lg text-text-secondary">Generating AI insights...</p>
                <p className="text-sm text-text-tertiary">Analyzing patterns and anomalies</p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="glass-panel rounded-xl p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="loading-skeleton h-8 w-8 rounded-lg" />
                      <div className="loading-skeleton h-5 w-32" />
                    </div>
                    <div className="space-y-2">
                      <div className="loading-skeleton h-4 w-full" />
                      <div className="loading-skeleton h-4 w-3/4" />
                      <div className="loading-skeleton h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-sm font-semibold text-red-300">AI insight generation unavailable</p>
              <p className="mt-2 text-sm text-text-secondary">{toErrorMessage(error)}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div
                className="glass-panel rounded-2xl p-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-text-tertiary">Mission Summary</p>
                    <p className="mt-2 text-lg font-semibold text-white">{insightsData?.summary}</p>
                    <p className="mt-2 text-sm text-text-secondary">{insightsData?.key_finding}</p>
                  </div>
                  <div className="max-w-xs">
                    <p className="text-xs uppercase tracking-[0.24em] text-text-tertiary">Recommended Next Step</p>
                    <p className="mt-2 text-sm text-white">
                      {insightsData?.recommendations?.[0] || 'Continue monitoring the selected AOI for follow-on changes.'}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <motion.div
                  className="glass-panel group rounded-xl p-6 transition-all duration-300 hover:bg-glass-secondary hover:shadow-glass-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <h4 className="mb-4 flex items-center text-lg font-semibold text-text-primary transition-colors duration-200 group-hover:text-white">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                    Anomaly Detection
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-text-primary">{insightsData?.anomaly.title}</p>
                    <p className="text-sm leading-relaxed text-text-secondary">{insightsData?.anomaly.details}</p>
                    <div className="flex items-center justify-between border-t border-glass-border pt-2">
                      <span className="text-xs text-text-tertiary">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-glass-primary">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${insightsData?.anomaly.confidence ?? 0}%` }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                          />
                        </div>
                        <span className="text-xs font-medium text-blue-400">{insightsData?.anomaly.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="glass-panel group rounded-xl p-6 transition-all duration-300 hover:bg-glass-secondary hover:shadow-glass-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <h4 className="mb-4 flex items-center text-lg font-semibold text-text-primary transition-colors duration-200 group-hover:text-white">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    Causal Inference
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-text-primary">{insightsData?.causal.title}</p>
                    <p className="text-sm leading-relaxed text-text-secondary">{insightsData?.causal.details}</p>
                    <div className="border-t border-glass-border pt-2">
                      <span className="text-xs text-text-tertiary">Estimated Impact</span>
                      <p className="mt-1 text-sm font-medium text-orange-400">{insightsData?.causal.impact}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="glass-panel group rounded-xl p-6 transition-all duration-300 hover:bg-glass-secondary hover:shadow-glass-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <h4 className="mb-4 flex items-center text-lg font-semibold text-text-primary transition-colors duration-200 group-hover:text-white">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    Data Fusion
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-text-primary">{insightsData?.fusion.title}</p>
                    <p className="text-sm leading-relaxed text-text-secondary">{insightsData?.fusion.details}</p>
                    <div className="border-t border-glass-border pt-2">
                      <span className="text-xs text-text-tertiary">Status</span>
                      <p className={`mt-1 text-sm font-medium ${fusionStatusColor}`}>{insightsData?.fusion.status}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

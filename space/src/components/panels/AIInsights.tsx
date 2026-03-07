'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from '../shared/GlassPanel'
import { useAIInsights } from '../../hooks/useAIInsights'
import { Brain, Zap, Search } from 'lucide-react'

interface Props {
  aoi: any
}

export default function AIInsights({ aoi }: Props) {
  // Use the AI insights hook
  const { generateInsights, data: insightsData, isLoading: loading, error } = useAIInsights()

  useEffect(() => {
    if (!aoi) return

    // Generate AI insights when AOI changes
    generateInsights(aoi)
  }, [aoi, generateInsights])

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: '100%', opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-10"
    >
      <GlassPanel variant="purple" className="overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-600/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="p-8 relative z-10">
          <motion.h3
            className="text-2xl font-bold mb-8 text-gradient-purple flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-purple animate-glow-pulse">
              <Brain className="w-5 h-5 text-white" />
            </div>
            AI-Powered Insights
            <div className="ml-4 flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.h3>

          {loading ? (
            <div className="space-y-6">
              <div className="text-center p-8">
                <motion.div
                  className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-lg text-text-secondary mb-2">Generating AI insights...</p>
                <p className="text-sm text-text-tertiary">Analyzing patterns and anomalies</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-panel p-6 rounded-xl space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="loading-skeleton w-8 h-8 rounded-lg" />
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Anomaly Detection */}
              <motion.div
                className="glass-panel p-6 rounded-xl group hover:shadow-glass-lg transition-all duration-300 hover:bg-glass-secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <h4 className="font-semibold text-lg mb-4 flex items-center text-text-primary group-hover:text-white transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  Anomaly Detection
                </h4>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-text-primary">{insightsData?.anomaly.title}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{insightsData?.anomaly.details}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                    <span className="text-xs text-text-tertiary">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-glass-primary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${insightsData?.anomaly.confidence}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-blue-400">{insightsData?.anomaly.confidence}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Causal Inference */}
              <motion.div
                className="glass-panel p-6 rounded-xl group hover:shadow-glass-lg transition-all duration-300 hover:bg-glass-secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <h4 className="font-semibold text-lg mb-4 flex items-center text-text-primary group-hover:text-white transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  Causal Inference
                </h4>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-text-primary">{insightsData?.causal.title}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{insightsData?.causal.details}</p>
                  <div className="pt-2 border-t border-glass-border">
                    <span className="text-xs text-text-tertiary">Estimated Impact</span>
                    <p className="text-sm font-medium text-orange-400 mt-1">{insightsData?.causal.impact}</p>
                  </div>
                </div>
              </motion.div>

              {/* Data Fusion */}
              <motion.div
                className="glass-panel p-6 rounded-xl group hover:shadow-glass-lg transition-all duration-300 hover:bg-glass-secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <h4 className="font-semibold text-lg mb-4 flex items-center text-text-primary group-hover:text-white transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  Data Fusion
                </h4>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-text-primary">Intelligent Data Fusion</p>
                  <p className="text-sm text-text-secondary leading-relaxed">Multi-source data integration and analysis</p>
                  <div className="pt-2 border-t border-glass-border">
                    <span className="text-xs text-text-tertiary">Status</span>
                    <p className="text-sm font-medium text-green-400 mt-1">Active</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

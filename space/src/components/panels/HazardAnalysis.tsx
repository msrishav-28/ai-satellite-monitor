'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from '../shared/GlassPanel'
import { RiskGauge } from '../charts/RiskGauge'
import { useHazardAnalysis } from '../../hooks/useHazardPrediction'
import { Shield, Flame, Droplet, Mountain, Trees, Sun, Wind } from 'lucide-react'

interface Props {
  aoi: any
}

const hazardIcons = {
  wildfire: <Flame className="w-6 h-6 text-red-400" />,
  flood: <Droplet className="w-6 h-6 text-blue-400" />,
  landslide: <Mountain className="w-6 h-6 text-yellow-400" />,
  deforestation: <Trees className="w-6 h-6 text-green-400" />,
  heatwave: <Sun className="w-6 h-6 text-orange-400" />,
  cyclone: <Wind className="w-6 h-6 text-purple-400" />,
}

export default function HazardAnalysis({ aoi }: Props) {
  // Use the hazard analysis hook
  const { analyzeHazards, data: hazardData, isLoading: loading, error } = useHazardAnalysis()

  useEffect(() => {
    if (!aoi) return

    // Trigger hazard analysis when AOI changes
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
        delay: 0.1
      }}
      className="absolute top-80 right-4 w-[420px] h-auto z-10"
    >
      <GlassPanel variant="elevated" className="overflow-hidden">
        <div className="p-6">
          <motion.h3
            className="text-xl font-bold mb-6 text-gradient flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            Hazard Analysis
            <div className="w-2 h-2 bg-red-500 rounded-full ml-3 animate-glow-pulse" />
          </motion.h3>

          {loading ? (
            <div className="space-y-4">
              <div className="text-center p-6">
                <motion.div
                  className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-text-secondary">Analyzing hazards...</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass-panel p-4 rounded-xl space-y-3">
                    <div className="loading-skeleton h-16 w-16 rounded-full mx-auto" />
                    <div className="loading-skeleton h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {hazardData && Object.entries(hazardData).map(([key, value]: [string, any], index) => (
                <motion.div
                  key={key}
                  className="glass-panel p-4 rounded-xl text-center group hover:shadow-glass-lg transition-all duration-300 hover:bg-glass-secondary cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RiskGauge value={value.risk} />
                  </motion.div>
                  <div className="flex items-center justify-center mt-3 gap-2">
                    <div className="flex items-center justify-center w-6 h-6">
                      {hazardIcons[key as keyof typeof hazardIcons]}
                    </div>
                    <span className="text-sm font-medium capitalize text-text-primary group-hover:text-white transition-colors duration-200">
                      {key}
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-1">
                    Risk: {value.risk}%
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

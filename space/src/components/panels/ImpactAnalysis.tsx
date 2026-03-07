'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from '../shared/GlassPanel'
import { useImpactAnalysis } from '../../hooks/useImpactAnalysis'
import { BarChart3, Footprints, PawPrint, Sprout, Droplets } from 'lucide-react'

interface Props {
  aoi: any
}

export default function ImpactAnalysis({ aoi }: Props) {
  // Use the impact analysis hook
  const { analyzeImpact, data: impactData, isLoading: loading, error } = useImpactAnalysis()

  useEffect(() => {
    if (!aoi) return

    // Analyze impact when AOI changes
    analyzeImpact(aoi)
  }, [aoi, analyzeImpact])

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 w-2/3 max-w-4xl z-10"
    >
      <GlassPanel>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <BarChart3 className="mr-2" />
            Impact Analysis
          </h3>
          {loading ? (
            <div className="text-center p-8">Analyzing impacts...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Carbon Footprint */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center"><Footprints className="mr-2" /> Carbon Footprint</h4>
                <p className="text-sm"><strong>Emissions:</strong> {impactData?.carbon.emissions} tCO₂e</p>
                <p className="text-sm"><strong>Sequestration:</strong> {impactData?.carbon.sequestration} tCO₂e</p>
              </div>

              {/* Biodiversity Impact */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center"><PawPrint className="mr-2" /> Biodiversity</h4>
                <p className="text-sm"><strong>Species Affected:</strong> {impactData?.biodiversity.species_affected}</p>
                <p className="text-sm"><strong>Habitat Loss:</strong> {impactData?.biodiversity.habitat_loss} km²</p>
              </div>

              {/* Agricultural Yield */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center"><Sprout className="mr-2" /> Agriculture</h4>
                <p className="text-sm"><strong>Yield Prediction:</strong> {impactData?.agriculture.yield_prediction}</p>
                <p className="text-sm"><strong>Soil Moisture:</strong> {impactData?.agriculture.soil_moisture}</p>
              </div>

              {/* Water Resources */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center"><Droplets className="mr-2" /> Water Resources</h4>
                <p className="text-sm"><strong>Surface Water:</strong> {impactData?.water.surface_water_change}%</p>
                <p className="text-sm"><strong>Snowpack:</strong> {impactData?.water.snowpack_level}</p>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

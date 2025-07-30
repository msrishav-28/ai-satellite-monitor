'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from '../shared/GlassPanel'
import { RiskGauge } from '../charts/RiskGauge'
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
  const [hazardData, setHazardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!aoi) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/hazard-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aoi }),
        })
        if (!response.ok) {
          throw new Error('Failed to fetch hazard data')
        }
        const data = await response.json()
        setHazardData(data)
      } catch (error) {
        console.error('Failed to fetch hazard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [aoi])

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
      className="absolute top-80 right-4 w-[400px] h-auto z-10"
    >
      <GlassPanel>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Shield className="mr-2" />
            Hazard Analysis
          </h3>
          {loading ? (
            <div className="text-center p-8">Analyzing hazards...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {hazardData && Object.entries(hazardData).map(([key, value]: [string, any]) => (
                <div key={key} className="text-center">
                  <RiskGauge value={value.risk} />
                  <div className="flex items-center justify-center mt-2">
                    {hazardIcons[key as keyof typeof hazardIcons]}
                    <span className="ml-2 capitalize">{key}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

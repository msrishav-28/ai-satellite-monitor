'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Wind, Droplets, Cloud, ShieldAlert } from 'lucide-react'
import { GlassPanel } from '../shared/GlassPanel'
import { AQIChart } from '../charts/AQIChart'
import { TemperatureChart } from '../charts/TemperatureChart'
import { useEnvironmentalData } from '../../hooks/useEnvironmentalData'
import * as turf from '@turf/turf'

interface Props {
  aoi: any
}

export default function MetricsPanel({ aoi }: Props) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null)

  // Extract coordinates from AOI
  useEffect(() => {
    if (!aoi) {
      setCoordinates(null)
      return
    }

    try {
      // Get the centroid of the AOI
      const centroid = turf.centroid(aoi)
      const [lon, lat] = centroid.geometry.coordinates
      setCoordinates({ lat, lon })
    } catch (error) {
      console.error('Failed to extract coordinates from AOI:', error)
      setCoordinates(null)
    }
  }, [aoi])

  // Use the environmental data hook
  const { data: environmentalData, isLoading: loading, error } = useEnvironmentalData({
    latitude: coordinates?.lat || 0,
    longitude: coordinates?.lon || 0,
    enabled: !!coordinates
  })

  const weatherData = environmentalData?.weather
  const aqiData = environmentalData?.aqi

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="absolute top-20 right-4 w-[420px] h-auto z-10"
    >
      <GlassPanel variant="elevated" className="overflow-hidden">
        <div className="p-6">
          <motion.h3
            className="text-xl font-bold mb-6 text-gradient flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-glow-pulse" />
            Environmental Metrics
          </motion.h3>
          {loading ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 loading-skeleton rounded" />
                  <div className="loading-skeleton h-5 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="loading-skeleton h-8 rounded-lg" />
                  ))}
                </div>
                <div className="loading-skeleton h-24 rounded-lg" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 loading-skeleton rounded" />
                  <div className="loading-skeleton h-5 w-24" />
                </div>
                <div className="loading-skeleton h-20 rounded-lg" />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Weather Data */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h4 className="font-semibold text-lg mb-4 flex items-center text-text-primary">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <Sun className="w-4 h-4 text-white" />
                  </div>
                  Weather Conditions
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-4 rounded-xl">
                    <div className="text-xs text-text-tertiary mb-1">Temperature</div>
                    <div className="text-lg font-semibold text-text-primary">{weatherData?.temperature}°C</div>
                    <div className="text-xs text-text-secondary">Feels like {weatherData?.apparentTemperature}°C</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl">
                    <div className="text-xs text-text-tertiary mb-1">Humidity</div>
                    <div className="text-lg font-semibold text-text-primary">{weatherData?.humidity}%</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl col-span-2">
                    <div className="text-xs text-text-tertiary mb-1">Wind</div>
                    <div className="text-lg font-semibold text-text-primary">
                      {weatherData?.windSpeed} km/h {weatherData?.windDirection}
                    </div>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                  <TemperatureChart data={[]} />
                </div>
              </motion.div>

              {/* AQI Data */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <h4 className="font-semibold text-lg mb-4 flex items-center text-text-primary">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                    <ShieldAlert className="w-4 h-4 text-white" />
                  </div>
                  Air Quality Index
                </h4>
                <div className="glass-panel p-4 rounded-xl">
                  <div className="text-xs text-text-tertiary mb-1">Overall AQI</div>
                  <div className="text-2xl font-bold text-text-primary mb-2">{aqiData?.value}</div>
                  <AQIChart data={aqiData?.pollutants || []} />
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

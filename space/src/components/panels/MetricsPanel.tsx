'use client'

/*
  Environmental metrics overlay for the monitor view.
  Updated in Phase 4 to derive AOI coordinates without effect-driven state and
  to cover loading and error states consistently.
*/

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sun, ShieldAlert } from 'lucide-react'
import * as turf from '@turf/turf'
import { GlassPanel } from '../shared/GlassPanel'
import { AQIChart } from '../charts/AQIChart'
import { TemperatureChart } from '../charts/TemperatureChart'
import { useEnvironmentalData } from '../../hooks/useEnvironmentalData'
import { toErrorMessage } from '../../lib/api'

interface Props {
  aoi: any
}

export default function MetricsPanel({ aoi }: Props) {
  const coordinates = useMemo(() => {
    if (!aoi) return null

    try {
      const centroid = turf.centroid(aoi)
      const [lon, lat] = centroid.geometry.coordinates
      return { lat, lon }
    } catch (error) {
      console.error('Failed to extract coordinates from AOI:', error)
      return null
    }
  }, [aoi])

  const { data: environmentalData, isLoading: loading, error } = useEnvironmentalData({
    latitude: coordinates?.lat || 0,
    longitude: coordinates?.lon || 0,
    enabled: !!coordinates,
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
        ease: [0.16, 1, 0.3, 1],
      }}
      className="absolute top-20 right-4 z-10 h-auto w-[420px]"
    >
      <GlassPanel variant="elevated" className="overflow-hidden">
        <div className="p-6">
          <motion.h3
            className="mb-6 flex items-center text-xl font-bold text-gradient"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="mr-3 h-2 w-2 rounded-full bg-purple-500 animate-glow-pulse" />
            Environmental Metrics
          </motion.h3>
          {loading ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="loading-skeleton h-6 w-6 rounded" />
                  <div className="loading-skeleton h-5 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="loading-skeleton h-8 rounded-lg" />
                  ))}
                </div>
                <div className="loading-skeleton h-24 rounded-lg" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="loading-skeleton h-6 w-6 rounded" />
                  <div className="loading-skeleton h-5 w-24" />
                </div>
                <div className="loading-skeleton h-20 rounded-lg" />
              </div>
            </div>
          ) : error ? (
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-sm font-semibold text-red-300">Environmental data unavailable</p>
              <p className="mt-2 text-sm text-text-secondary">{toErrorMessage(error)}</p>
            </div>
          ) : (
            <div className="space-y-8">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h4 className="mb-4 flex items-center text-lg font-semibold text-text-primary">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                    <Sun className="h-4 w-4 text-white" />
                  </div>
                  Weather Conditions
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel rounded-xl p-4">
                    <div className="mb-1 text-xs text-text-tertiary">Temperature</div>
                    <div className="text-lg font-semibold text-text-primary">{weatherData?.temperature} C</div>
                    <div className="text-xs text-text-secondary">Feels like {weatherData?.apparentTemperature} C</div>
                  </div>
                  <div className="glass-panel rounded-xl p-4">
                    <div className="mb-1 text-xs text-text-tertiary">Humidity</div>
                    <div className="text-lg font-semibold text-text-primary">{weatherData?.humidity}%</div>
                  </div>
                  <div className="glass-panel col-span-2 rounded-xl p-4">
                    <div className="mb-1 text-xs text-text-tertiary">Wind</div>
                    <div className="text-lg font-semibold text-text-primary">
                      {weatherData?.windSpeed} km/h {weatherData?.windDirection}
                    </div>
                  </div>
                </div>
                <div className="glass-panel rounded-xl p-4">
                  <TemperatureChart data={[]} />
                </div>
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <h4 className="mb-4 flex items-center text-lg font-semibold text-text-primary">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                    <ShieldAlert className="h-4 w-4 text-white" />
                  </div>
                  Air Quality Index
                </h4>
                <div className="glass-panel rounded-xl p-4">
                  <div className="mb-1 text-xs text-text-tertiary">Overall AQI</div>
                  <div className="mb-2 text-2xl font-bold text-text-primary">{aqiData?.value}</div>
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

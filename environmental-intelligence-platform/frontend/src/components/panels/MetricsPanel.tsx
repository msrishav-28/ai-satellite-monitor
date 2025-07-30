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
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute top-20 right-4 w-[400px] h-auto z-10"
    >
      <GlassPanel>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4">Environmental Metrics</h3>
          {loading ? (
            <div className="text-center p-8">Loading metrics...</div>
          ) : (
            <>
              {/* Weather Data */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 flex items-center"><Sun className="mr-2" /> Weather</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Temp:</strong> {weatherData?.temperature}°C</p>
                  <p><strong>Feels Like:</strong> {weatherData?.apparentTemperature}°C</p>
                  <p><strong>Humidity:</strong> {weatherData?.humidity}%</p>
                  <p><strong>Wind:</strong> {weatherData?.windSpeed} km/h {weatherData?.windDirection}</p>
                </div>
                <div className="mt-2">
                  <TemperatureChart data={weatherData?.forecast} />
                </div>
              </div>

              {/* AQI Data */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center"><ShieldAlert className="mr-2" /> Air Quality (AQI)</h4>
                <div className="text-sm mb-2">
                  <p><strong>Overall AQI:</strong> {aqiData?.value}</p>
                </div>
                <AQIChart data={aqiData?.pollutants} />
              </div>
            </>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

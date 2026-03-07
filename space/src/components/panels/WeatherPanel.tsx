'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import * as turf from '@turf/turf'
import { GlassPanel } from '../shared/GlassPanel'
import { useWeatherData } from '@/hooks/useWeatherData'

interface Props {
  aoi: any
  onClose?: () => void
}

export default function WeatherPanel({ aoi, onClose }: Props) {
  const centroid = useMemo(() => {
    try {
      if (!aoi) return null
      const c = turf.centroid(aoi as any)
      const [lon, lat] = c.geometry.coordinates
      return { lat, lon }
    } catch {
      return null
    }
  }, [aoi])

  const { data, loading, error } = useWeatherData(centroid, {
    includeForecast: false,
    includeAir: true,
  })

  const current = data?.current_weather?.current
  const aqi = data?.air_quality?.aqi

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-24 right-4 w-[320px] z-10"
    >
      <GlassPanel variant="elevated" className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-text-primary">Weather</h3>
          <button onClick={onClose} className="text-xs text-text-secondary hover:text-text-primary">Close</button>
        </div>
        {loading ? (
          <div className="loading-skeleton h-24 rounded-lg" />
        ) : error ? (
          <div className="text-xs text-red-300">{error}</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-text-tertiary text-xs">Temp</div>
                <div className="font-semibold text-text-primary">{current?.temperature ?? '—'}°C</div>
                <div className="text-text-secondary text-xs">Feels {current?.feels_like ?? '—'}°C</div>
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-text-tertiary text-xs">Humidity</div>
                <div className="font-semibold text-text-primary">{current?.humidity ?? '—'}%</div>
                <div className="text-text-secondary text-xs">Pressure {current?.pressure ?? '—'} hPa</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-text-tertiary text-xs">Wind</div>
                <div className="font-semibold text-text-primary">{current?.wind_speed ?? '—'} m/s</div>
                <div className="text-text-secondary text-xs">Dir {current?.wind_direction ?? '—'}°</div>
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-text-tertiary text-xs">AQI</div>
                <div className="font-semibold text-text-primary">{aqi ?? '—'}</div>
                <div className="text-text-secondary text-xs">OpenWeather</div>
              </div>
            </div>
            <div className="text-xs text-text-tertiary">
              {centroid ? `Lat ${centroid.lat.toFixed(3)}, Lon ${centroid.lon.toFixed(3)}` : 'Select an area'}
            </div>
          </div>
        )}
      </GlassPanel>
    </motion.div>
  )
}

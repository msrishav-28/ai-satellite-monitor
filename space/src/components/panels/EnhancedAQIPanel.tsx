'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import * as turf from '@turf/turf'
import { useEnhancedAirQuality, EnhancedAQIData } from '@/hooks/useEnhancedAirQuality'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Props {
  aoi: any
  onClose?: () => void
}

export default function EnhancedAQIPanel({ aoi, onClose }: Props) {
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

  const { aqiData, loading } = useEnhancedAirQuality(centroid)
  const [liveData, setLiveData] = useState<EnhancedAQIData | null>(null)

  const { isConnected, sendMessage, lastMessage, disconnect } = useWebSocket({
    onOpen: () => {
      // Subscribe to environmental updates using server protocol
      sendMessage?.({ type: 'subscribe', subscription_type: 'environmental' })
    },
  })

  useEffect(() => {
    // Unsubscribe on unmount to be polite
    return () => {
      sendMessage?.({ type: 'unsubscribe', subscription_type: 'environmental' })
    }
  }, [sendMessage])

  useEffect(() => {
    if (!lastMessage) return
    if (lastMessage.type === 'environmental_update') {
      const d = lastMessage.data || {}
      // Normalize minimal subset into EnhancedAQIData shape where possible
      const next: EnhancedAQIData = {
        timestamp: d.timestamp || new Date().toISOString(),
        location: d.location || centroid || { lat: 0, lon: 0 },
        data_quality: 'mixed',
        sources_used: Array.isArray(d.sources_used) ? d.sources_used : ['realtime'],
        measurements: d.measurements || { aqi: d.aqi ?? d?.aqi_value },
      }
      setLiveData(next)
    }
  }, [lastMessage, centroid])

  const display = liveData || aqiData
  const overallAQI = display?.measurements?.aqi

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-24 right-4 w-[360px] z-10"
    >
      <div className="glass-panel-purple p-5 rounded-xl shadow-purple">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gradient-purple">Enhanced Air Quality</h3>
          <div className="text-xs text-text-tertiary">
            {isConnected ? 'Live' : 'Idle'}
          </div>
        </div>
        {loading && !display ? (
          <div className="loading-skeleton h-24 rounded-lg" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-tertiary">Overall AQI</div>
              <div className="text-2xl font-bold text-text-primary">{overallAQI ?? '—'}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-text-tertiary">Quality</div>
                <div className="font-medium">{display?.data_quality || 'standard'}</div>
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-text-tertiary">Sources</div>
                <div className="font-medium truncate" title={display?.sources_used?.join(', ')}>
                  {display?.sources_used?.slice(0, 2).join(', ') || '—'}
                </div>
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-text-tertiary">Updated</div>
                <div className="font-medium">{display?.timestamp ? new Date(display.timestamp).toLocaleTimeString() : '—'}</div>
              </div>
            </div>
            <div className="text-xs text-text-tertiary">
              {centroid ? `Lat ${centroid.lat.toFixed(3)}, Lon ${centroid.lon.toFixed(3)}` : 'Select an area to view AQI'}
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="text-xs text-text-secondary hover:text-purple-400">Close</button>
        </div>
      </div>
    </motion.div>
  )
}

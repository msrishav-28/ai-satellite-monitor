'use client'

/*
  Enhanced AQI overlay for the monitor view.
  Updated in Phase 4 to subscribe cleanly to backend environmental websocket
  updates and normalize the live AQI payload shape.
*/

import { useEffect, useMemo } from 'react'
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
      const center = turf.centroid(aoi as any)
      const [lon, lat] = center.geometry.coordinates
      return { lat, lon }
    } catch {
      return null
    }
  }, [aoi])

  const { aqiData, loading, error } = useEnhancedAirQuality(centroid)
  const { isConnected, sendMessage, lastMessage } = useWebSocket()

  useEffect(() => {
    if (!isConnected) return

    sendMessage?.({ type: 'subscribe', subscription_type: 'environmental' })

    return () => {
      sendMessage?.({ type: 'unsubscribe', subscription_type: 'environmental' })
    }
  }, [isConnected, sendMessage])

  const liveData = useMemo<EnhancedAQIData | null>(() => {
    if (!lastMessage || lastMessage.type !== 'environmental_update') {
      return null
    }

    const data = lastMessage.data || {}
    const liveAqi =
      data.measurements?.aqi ??
      data.environmental_data?.aqi?.value ??
      data.aqi ??
      data.aqi_value

    const nextLocation = centroid || {
      lat: data.location?.lat ?? 0,
      lon: data.location?.lon ?? 0,
    }

    return {
      timestamp: data.timestamp || new Date().toISOString(),
      location: nextLocation,
      data_quality: 'mixed',
      sources_used: Array.isArray(data.sources_used) ? data.sources_used : ['realtime'],
      measurements: data.measurements || { aqi: liveAqi },
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
      className="absolute top-24 right-4 z-10 w-[360px]"
    >
      <div className="glass-panel-purple rounded-xl p-5 shadow-purple">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gradient-purple">Enhanced Air Quality</h3>
          <div className="text-xs text-text-tertiary">
            {isConnected ? 'Live' : 'Idle'}
          </div>
        </div>

        {loading && !display ? (
          <div className="loading-skeleton h-24 rounded-lg" />
        ) : error && !display ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-tertiary">Overall AQI</div>
              <div className="text-2xl font-bold text-text-primary">{overallAQI ?? 'n/a'}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="glass-panel rounded-lg p-3">
                <div className="text-text-tertiary">Quality</div>
                <div className="font-medium">{display?.data_quality || 'standard'}</div>
              </div>
              <div className="glass-panel rounded-lg p-3">
                <div className="text-text-tertiary">Sources</div>
                <div className="truncate font-medium" title={display?.sources_used?.join(', ')}>
                  {display?.sources_used?.slice(0, 2).join(', ') || 'n/a'}
                </div>
              </div>
              <div className="glass-panel rounded-lg p-3">
                <div className="text-text-tertiary">Updated</div>
                <div className="font-medium">
                  {display?.timestamp ? new Date(display.timestamp).toLocaleTimeString() : 'n/a'}
                </div>
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

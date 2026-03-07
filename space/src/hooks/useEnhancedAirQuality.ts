import { useEffect, useState } from 'react'

export type EnhancedAQIData = {
  timestamp: string
  location: { lat: number; lon: number }
  data_quality: 'high' | 'mixed' | 'standard'
  sources_used: string[]
  measurements: Record<string, any>
}

export const useEnhancedAirQuality = (coordinates: { lat: number; lon: number } | null) => {
  const [aqiData, setAqiData] = useState<EnhancedAQIData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEnhancedAQI = async () => {
      if (!coordinates) return
      setLoading(true)
      setError(null)
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await fetch(`${apiBase}/api/v1/environmental/enhanced-aqi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: coordinates.lat,
            lon: coordinates.lon,
            include_baseline: true,
            sources: ['all'],
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setAqiData(json.data as EnhancedAQIData)
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch enhanced AQI')
        setAqiData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchEnhancedAQI()
  }, [coordinates?.lat, coordinates?.lon])

  return { aqiData, loading, error }
}

import { useEffect, useState } from 'react'

export type WeatherCurrent = {
  temperature: number
  feels_like: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_direction: number
  visibility: number
  description?: string
  icon?: string
}

export type WeatherResponse = {
  current_weather: {
    timestamp: string
    location: { lat: number; lon: number; city?: string; country?: string }
    current: WeatherCurrent
    source: string
    data_quality: string
  }
  forecast?: { forecast: any[]; source: string }
  air_quality?: { aqi: number; components: Record<string, number>; source: string }
}

export const useWeatherData = (
  coordinates: { lat: number; lon: number } | null,
  opts: { includeForecast?: boolean; includeAir?: boolean } = {}
) => {
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      if (!coordinates) return
      setLoading(true)
      setError(null)
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const url = `${apiBase}/api/v1/environmental/weather/${coordinates.lat}/${coordinates.lon}?include_forecast=${!!opts.includeForecast}&include_air_quality=${!!opts.includeAir}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setData(json as WeatherResponse)
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch weather')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [coordinates?.lat, coordinates?.lon, opts.includeAir, opts.includeForecast])

  return { data, loading, error }
}

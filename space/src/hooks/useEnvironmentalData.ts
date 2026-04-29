/*
  Environmental data hooks for weather and AQI.
  Updated in Phase 4 to normalize the backend's snake_case weather fields into
  the camelCase shape used by the monitor panels.
*/

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getApiBase, unwrapApiData } from '@/lib/api'

interface EnvironmentalData {
  weather: {
    temperature: number
    apparentTemperature: number
    humidity: number
    windSpeed: number
    windDirection: number
    description: string
    pressure?: number
    visibility?: number
  }
  aqi: {
    value: number
    category: string
    pollutants: Array<{
      name: string
      value: number
      unit: string
    }>
    source: string
  }
  location: {
    latitude: number
    longitude: number
  }
  timestamp: string
}

interface UseEnvironmentalDataProps {
  latitude: number
  longitude: number
  enabled?: boolean
}

export function useEnvironmentalData({ latitude, longitude, enabled = true }: UseEnvironmentalDataProps) {
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['environmental-data', latitude, longitude],
    queryFn: async (): Promise<EnvironmentalData> => {
      const response = await axios.get(`${getApiBase()}/api/v1/environmental/data`, {
        params: { lat: latitude, lon: longitude }
      })
      const data = unwrapApiData<any>(response.data)
      return {
        ...data,
        weather: {
          temperature: data.weather.temperature,
          apparentTemperature: data.weather.apparent_temperature,
          humidity: data.weather.humidity,
          windSpeed: data.weather.wind_speed,
          windDirection: data.weather.wind_direction,
          description: data.weather.description,
          pressure: data.weather.pressure,
          visibility: data.weather.visibility,
        },
      }
    },
    enabled: enabled && !!(latitude && longitude),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  return {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  }
}

export function useWeatherData({ latitude, longitude, enabled = true }: UseEnvironmentalDataProps) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['weather-data', latitude, longitude],
    queryFn: async () => {
      const response = await axios.get(`${getApiBase()}/api/v1/environmental/weather`, {
        params: { lat: latitude, lon: longitude }
      })

      return unwrapApiData(response.data)
    },
    enabled: enabled && !!(latitude && longitude),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    staleTime: 5 * 60 * 1000
  })

  return {
    weather: data,
    isLoading,
    error,
    refetch
  }
}

export function useAQIData({ latitude, longitude, enabled = true }: UseEnvironmentalDataProps) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['aqi-data', latitude, longitude],
    queryFn: async () => {
      const response = await axios.get(`${getApiBase()}/api/v1/environmental/aqi`, {
        params: { lat: latitude, lon: longitude }
      })

      return unwrapApiData(response.data)
    },
    enabled: enabled && !!(latitude && longitude),
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    staleTime: 10 * 60 * 1000
  })

  return {
    aqi: data,
    isLoading,
    error,
    refetch
  }
}

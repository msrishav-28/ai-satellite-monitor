import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface AOI {
  type: 'Polygon'
  coordinates: number[][][]
}

interface HazardRisk {
  hazard_type: string
  risk_score: number
  risk_level: 'low' | 'moderate' | 'high' | 'extreme'
  trend: 'up' | 'down' | 'stable'
  confidence: number
  factors: string[]
  recommendations: string[]
}

interface WildfireRisk extends HazardRisk {
  ignition_probability: number
  spread_rate: number
  fuel_moisture: number
  fire_weather_index: number
}

interface FloodRisk extends HazardRisk {
  return_period: number
  max_depth: number
  affected_area: number
  drainage_capacity: number
}

interface LandslideRisk extends HazardRisk {
  slope_stability: number
  soil_saturation: number
  trigger_threshold: number
}

interface HazardAnalysisResponse {
  wildfire: WildfireRisk
  flood: FloodRisk
  landslide: LandslideRisk
  deforestation: HazardRisk
  heatwave: HazardRisk
  cyclone: HazardRisk
  overall_risk_score: number
  priority_hazards: string[]
}

export function useHazardAnalysis() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<HazardAnalysisResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/hazards/analyze`, {
        geometry: aoi
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to analyze hazards')
      }

      return response.data.data
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  return {
    analyzeHazards: mutation.mutate,
    analyzeHazardsAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  }
}

export function useWildfireAnalysis() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<WildfireRisk> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/hazards/wildfire`, {
        geometry: aoi
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to analyze wildfire risk')
      }

      return response.data.data
    }
  })

  return {
    analyzeWildfire: mutation.mutate,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  }
}

export function useFloodAnalysis() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<FloodRisk> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/hazards/flood`, {
        geometry: aoi
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to analyze flood risk')
      }

      return response.data.data
    }
  })

  return {
    analyzeFlood: mutation.mutate,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  }
}

export function useLandslideAnalysis() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<LandslideRisk> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/hazards/landslide`, {
        geometry: aoi
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to analyze landslide risk')
      }

      return response.data.data
    }
  })

  return {
    analyzeLandslide: mutation.mutate,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  }
}
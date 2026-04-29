/*
  React Query hooks for hazard analysis.
  Updated in Phase 4 to normalize AOI payloads and type the backend's
  risk_score-based response correctly.
*/

import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { buildAOIPayload, getApiBase, unwrapApiData } from '@/lib/api'

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
      const response = await axios.post(`${getApiBase()}/api/v1/hazards/analyze`, buildAOIPayload(aoi))
      return unwrapApiData<HazardAnalysisResponse>(response.data)
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
      const response = await axios.post(`${getApiBase()}/api/v1/hazards/wildfire`, buildAOIPayload(aoi))
      return unwrapApiData<WildfireRisk>(response.data)
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
      const response = await axios.post(`${getApiBase()}/api/v1/hazards/flood`, buildAOIPayload(aoi))
      return unwrapApiData<FloodRisk>(response.data)
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
      const response = await axios.post(`${getApiBase()}/api/v1/hazards/landslide`, buildAOIPayload(aoi))
      return unwrapApiData<LandslideRisk>(response.data)
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

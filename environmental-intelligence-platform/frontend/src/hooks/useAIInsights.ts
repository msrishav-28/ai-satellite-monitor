import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

interface AOI {
  type: 'Polygon'
  coordinates: number[][][]
}

interface AIInsight {
  title: string
  details: string
  confidence: number
  severity: 'low' | 'medium' | 'high'
  location?: {
    lat: number
    lon: number
  }
  detected_at: string
}

interface CausalInsight {
  title: string
  details: string
  impact: string
  confidence: number
  methodology: string
  control_areas: number
}

interface DataFusionStatus {
  title: string
  details: string
  status: 'Active' | 'Inactive' | 'Partial'
  optical_coverage: number
  radar_coverage: number
  fusion_quality: 'excellent' | 'good' | 'fair' | 'poor'
}

interface AIInsightsResponse {
  anomaly: AIInsight
  causal: CausalInsight
  fusion: DataFusionStatus
  predictions: {
    short_term: string
    long_term: string
    confidence: number
  }
}

interface AnomalyDetectionResponse {
  anomalies_detected: number
  detection_method: string
  time_period: string
  anomalies: Array<{
    id: number
    type: string
    date: string
    severity: 'low' | 'medium' | 'high'
    confidence: number
    location: {
      lat: number
      lon: number
    }
    description: string
  }>
  model_performance: {
    precision: number
    recall: number
    f1_score: number
  }
}

export function useAIInsights() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<AIInsightsResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/ai-insights/analyze`, {
        geometry: aoi
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate AI insights')
      }
      
      return response.data.data
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  return {
    generateInsights: mutation.mutate,
    generateInsightsAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  }
}

export function useAnomalyDetection() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<AnomalyDetectionResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/ai-insights/anomaly-detection`, {
        geometry: aoi
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to detect anomalies')
      }
      
      return response.data.data
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  return {
    detectAnomalies: mutation.mutate,
    detectAnomaliesAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  }
}

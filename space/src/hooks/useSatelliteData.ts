import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface AOI {
  type: 'Polygon'
  coordinates: number[][][]
}

interface TimeRange {
  start_date: string
  end_date: string
}

interface TimelapseMetadata {
  start_date: string
  end_date: string
  duration_days: number
  frame_count: number
  resolution: string
  file_size_mb: number
  processing_time_seconds: number
}

interface SatelliteDataInfo {
  primary_source: string
  secondary_source: string
  cloud_coverage_threshold: number
  images_used: number
  data_quality: 'excellent' | 'good' | 'fair' | 'poor'
}

interface VisualizationSettings {
  bands: string[]
  enhancement: string
  cloud_masking: boolean
  temporal_smoothing: boolean
}

interface AnalysisInsights {
  change_detected: boolean
  change_type: string
  change_magnitude: 'low' | 'moderate' | 'high'
  change_locations: Array<{
    lat: number
    lon: number
    change_score: number
  }>
}

interface DownloadOptions {
  formats: string[]
  resolutions: string[]
  frame_rates: number[]
  expiry_date: string
}

interface TimelapseResponse {
  status: 'completed' | 'processing' | 'failed'
  video_url?: string
  gif_url?: string
  thumbnail_url?: string
  metadata?: TimelapseMetadata
  satellite_data?: SatelliteDataInfo
  visualization_settings?: VisualizationSettings
  analysis_insights?: AnalysisInsights
  download_options?: DownloadOptions
  error?: string
  message?: string
  fallback_url?: string
}

interface SatelliteDataResponse {
  // Vegetation indices
  ndvi: number
  evi: number
  savi: number
  
  // Temperature data
  land_surface_temperature: number
  temperature_anomaly: number
  
  // Precipitation
  precipitation: number
  precipitation_anomaly: number
  
  // Topography
  elevation: number
  slope: number
  aspect: number
  
  // Land cover
  land_cover: string
  forest_percentage: number
  urban_percentage: number
  
  // Soil and moisture
  soil_moisture: number
  soil_type: string
  
  // Infrastructure proximity
  road_distance: number
  settlement_distance: number
  fault_distance: number
  
  // Weather variables
  wind_speed: number
  wind_direction: number
  humidity: number
  
  // Fire-related
  fuel_load: number
  fuel_moisture: number
  
  // Water-related
  drainage_density: number
  river_distance: number
  
  // Data quality
  cloud_cover: number
  data_quality: 'excellent' | 'good' | 'fair' | 'poor'
  acquisition_date: string
}

export function useTimelapseGeneration() {
  const mutation = useMutation({
    mutationFn: async ({ aoi, timeRange }: { aoi: AOI; timeRange: TimeRange }): Promise<TimelapseResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/satellite/timelapse`, {
        geometry: aoi,
        start_date: timeRange.start_date,
        end_date: timeRange.end_date
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate timelapse')
      }
      
      return response.data.data
    },
    retry: 1, // Timelapse generation is expensive, limit retries
    retryDelay: 5000
  })

  return {
    generateTimelapse: mutation.mutate,
    generateTimelapseAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  }
}

export function useSatelliteData() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<SatelliteDataResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/satellite/data`, {
        geometry: aoi
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch satellite data')
      }
      
      return response.data.data
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  return {
    fetchSatelliteData: mutation.mutate,
    fetchSatelliteDataAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  }
}

// Hook for real-time satellite data updates
export function useRealtimeSatelliteData(aoi: AOI | null, enabled: boolean = true) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['realtime-satellite-data', aoi],
    queryFn: async (): Promise<SatelliteDataResponse> => {
      if (!aoi) throw new Error('AOI is required')
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/satellite/data`, {
        geometry: aoi
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch satellite data')
      }
      
      return response.data.data
    },
    enabled: enabled && !!aoi,
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000, // Data is fresh for 15 minutes
    retry: 2
  })

  return {
    data,
    isLoading,
    error,
    refetch
  }
}

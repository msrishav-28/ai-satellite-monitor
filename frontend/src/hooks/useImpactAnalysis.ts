import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

interface AOI {
  type: 'Polygon'
  coordinates: number[][][]
}

interface CarbonImpact {
  emissions: number
  sequestration: number
  net_impact: number
  source: string
  methodology: string
}

interface BiodiversityImpact {
  species_affected: number
  habitat_loss: number
  threatened_species: number
  endemic_species: number
  conservation_priority: 'low' | 'medium' | 'high'
  data_source: string
}

interface AgricultureImpact {
  yield_prediction: string
  yield_change: number
  soil_moisture: string
  crop_stress_index: number
  affected_area: number
  economic_impact: number
}

interface WaterImpact {
  surface_water_change: number
  groundwater_impact: string
  snowpack_level: string
  drought_risk: 'low' | 'moderate' | 'high'
  water_quality_index: number
  availability_forecast: string
}

interface AirQualityImpact {
  pm25_impact: number
  no2_impact: number
  dust_emissions: string
  health_risk: 'low' | 'moderate' | 'high'
}

interface SocioeconomicImpact {
  population_affected: number
  economic_loss: number
  livelihood_impact: 'low' | 'moderate' | 'high'
  displacement_risk: 'low' | 'moderate' | 'high'
}

interface OverallAssessment {
  impact_score: number
  severity: 'low' | 'moderate' | 'moderate-high' | 'high'
  urgency: 'low' | 'medium' | 'high'
  reversibility: 'reversible' | 'partially reversible' | 'irreversible'
  mitigation_potential: 'low' | 'medium' | 'high'
}

interface ComprehensiveImpactResponse {
  carbon: CarbonImpact
  biodiversity: BiodiversityImpact
  agriculture: AgricultureImpact
  water: WaterImpact
  air_quality: AirQualityImpact
  socioeconomic: SocioeconomicImpact
  overall_assessment: OverallAssessment
}

interface CarbonAnalysisResponse {
  total_emissions: number
  total_sequestration: number
  net_carbon_impact: number
  emission_sources: {
    deforestation: number
    land_use_change: number
    soil_disturbance: number
  }
  sequestration_sources: {
    forest_growth: number
    soil_carbon: number
  }
  carbon_density: {
    above_ground: number
    below_ground: number
    soil_organic: number
    dead_wood: number
  }
  temporal_analysis: {
    baseline_year: number
    current_year: number
    annual_change: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  uncertainty: {
    confidence_interval: string
    data_quality: 'excellent' | 'good' | 'fair' | 'poor'
    methodology: string
  }
  mitigation_potential: {
    reforestation: number
    conservation: number
    sustainable_practices: number
    total_potential: number
  }
}

export function useImpactAnalysis() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<ComprehensiveImpactResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/impact/analyze`, {
        geometry: aoi
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to analyze impact')
      }
      
      return response.data.data
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  return {
    analyzeImpact: mutation.mutate,
    analyzeImpactAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  }
}

export function useCarbonAnalysis() {
  const mutation = useMutation({
    mutationFn: async (aoi: AOI): Promise<CarbonAnalysisResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/v1/impact/carbon`, {
        geometry: aoi
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to analyze carbon impact')
      }
      
      return response.data.data
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  return {
    analyzeCarbon: mutation.mutate,
    analyzeCarbonAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  }
}

/*
  Operational data hooks for dashboard, analytics, alerts, and settings.
  Added in Phase 4 to pull truthful platform state from health, provider,
  websocket, and hazard-alert endpoints instead of relying on static mock data.
*/

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getApiBase, unwrapApiData } from '@/lib/api'

export interface ReadyHealthResponse {
  status: string
  timestamp: string
  version: string
  components: Record<string, string>
  details: {
    dependencies: {
      providers: Record<string, ProviderStatus>
      websocket_manager?: {
        status: string
        active_connections: number
      }
    }
  }
}

export interface ProviderStatus {
  purpose: string
  status: string
  configured: boolean
  auth_method: string
  env_vars: string[]
}

export interface DataSourcesHealthResponse {
  environment: string
  mock_flags: Record<string, boolean>
  providers: Record<string, ProviderStatus>
}

export interface WebSocketStatusResponse {
  total_connections: number
  subscriptions: Record<string, number>
  status: string
  timestamp: string
}

export interface HazardAlertRecord {
  id: string
  hazard_type: string
  risk_level: string
  title: string
  description: string
  location_name: string
  severity: string
  urgency: string
  issued_at: string
  valid_until?: string | null
  aoi_geometry?: Record<string, unknown> | null
  alert_type: string
  timestamp: string
}

export interface HazardUpdateRecord {
  location: {
    name: string
    lat?: number | null
    lon?: number | null
  }
  hazard_type: string
  risk_level: string
  risk_score: number
  trend: string
  update_type: string
  timestamp: string
}

export function usePlatformHealth() {
  return useQuery({
    queryKey: ['platform-health'],
    queryFn: async (): Promise<ReadyHealthResponse> => {
      const response = await axios.get(`${getApiBase()}/health/ready`)
      return response.data as ReadyHealthResponse
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useDataSourceHealth() {
  return useQuery({
    queryKey: ['data-source-health'],
    queryFn: async (): Promise<DataSourcesHealthResponse> => {
      const response = await axios.get(`${getApiBase()}/api/v1/data-sources/health`)
      return response.data as DataSourcesHealthResponse
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}

export function useWebSocketStatus() {
  return useQuery({
    queryKey: ['websocket-status'],
    queryFn: async (): Promise<WebSocketStatusResponse> => {
      const response = await axios.get(`${getApiBase()}/api/v1/ws/status`)
      return unwrapApiData<WebSocketStatusResponse>(response.data)
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useActiveAlerts() {
  return useQuery({
    queryKey: ['active-alerts'],
    queryFn: async (): Promise<HazardAlertRecord[]> => {
      const response = await axios.get(`${getApiBase()}/api/v1/hazards/alerts/active`)
      return unwrapApiData<HazardAlertRecord[]>(response.data)
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useRecentHazardUpdates() {
  return useQuery({
    queryKey: ['recent-hazard-updates'],
    queryFn: async (): Promise<HazardUpdateRecord[]> => {
      const response = await axios.get(`${getApiBase()}/api/v1/hazards/updates/recent`)
      return unwrapApiData<HazardUpdateRecord[]>(response.data)
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

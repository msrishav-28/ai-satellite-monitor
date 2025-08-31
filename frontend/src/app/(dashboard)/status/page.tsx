'use client'

import { useQuery } from '@tanstack/react-query'
import { GlassPanel } from '@/components/shared/GlassPanel'

type Health = {
  status: string
  version?: string
  components?: Record<string, string>
  details?: any
}

async function fetchHealth(): Promise<Health> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const res = await fetch(`${base}/health`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function StatusPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 15000,
  })

  const statusColor = (s?: string) => s === 'healthy' ? 'text-green-400' : s === 'unhealthy' ? 'text-red-400' : 'text-yellow-400'

  return (
    <div className="p-6">
      <div className="max-w-3xl space-y-4">
        <GlassPanel variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">System Status</h2>
            <button className="text-sm text-text-secondary hover:text-text-primary" onClick={() => refetch()}>
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          {isLoading ? (
            <div className="loading-skeleton h-24 rounded-lg mt-4" />
          ) : error ? (
            <div className="text-sm text-red-300 mt-4">{String((error as Error).message)}</div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className={`text-sm font-medium ${statusColor(data?.status)}`}>Overall: {data?.status}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {Object.entries(data?.components || {}).map(([k, v]) => (
                  <div key={k} className="glass-panel p-3 rounded-lg">
                    <div className="text-text-tertiary text-xs">{k}</div>
                    <div className="font-medium text-text-primary">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  )
}

'use client'

/*
  Analytics console route for the application shell.
  Added in Phase 4 to expose real platform telemetry using backend health,
  provider, websocket, and hazard-update endpoints.
*/

import { motion } from 'framer-motion'
import { Activity, Database, RadioTower, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PerspectiveCard } from '@/components/ui/PerspectiveCard'
import {
  useDataSourceHealth,
  usePlatformHealth,
  useRecentHazardUpdates,
  useWebSocketStatus,
} from '@/hooks/useOperationsData'

function AnalyticsMetric({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string
  value: string
  description: string
  icon: LucideIcon
}) {
  return (
    <PerspectiveCard className="h-full">
      <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-sm text-white/35">{description}</p>
        </div>
      </div>
    </PerspectiveCard>
  )
}

export default function AnalyticsPage() {
  const { data: platformHealth } = usePlatformHealth()
  const { data: sourceHealth } = useDataSourceHealth()
  const { data: websocketStatus } = useWebSocketStatus()
  const { data: recentUpdates } = useRecentHazardUpdates()

  const providers = Object.entries(sourceHealth?.providers ?? {})
  const liveProviders = providers.filter(([, provider]) => provider.status === 'live').length
  const mockedDomains = (Object.entries(sourceHealth?.mock_flags ?? {}) as Array<[string, boolean]>).filter(
    ([, enabled]) => enabled
  )

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0E0E0E] p-8">
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-400">Analytics</p>
          <h1 className="mt-4 text-4xl font-bold text-white">Operational Telemetry</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/35">
            Real platform telemetry derived from runtime health, provider configuration, websocket transport, and recent hazard update flow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <AnalyticsMetric
              label="Readiness"
              value={platformHealth?.status?.toUpperCase() || 'UNKNOWN'}
              description={`Backend version ${platformHealth?.version || 'unavailable'}`}
              icon={ShieldCheck}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <AnalyticsMetric
              label="Providers Live"
              value={`${liveProviders}/${providers.length || 0}`}
              description="Data providers with live configuration status"
              icon={Database}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AnalyticsMetric
              label="Realtime Links"
              value={`${websocketStatus?.total_connections ?? 0}`}
              description={`Transport status: ${websocketStatus?.status || 'idle'}`}
              icon={RadioTower}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AnalyticsMetric
              label="Recent Updates"
              value={`${recentUpdates?.length ?? 0}`}
              description="Hazard update records emitted in the last 24 hours"
              icon={Activity}
            />
          </motion.div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Provider Breakdown</h2>
            <div className="space-y-4">
              {providers.map(([name, provider]) => (
                <div key={name} className="flex flex-col gap-3 rounded-[1.25rem] border border-white/5 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{name.replaceAll('_', ' ')}</p>
                    <p className="mt-1 text-sm text-white/35">{provider.purpose}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                      provider.status === 'live'
                        ? 'bg-emerald-500/15 text-emerald-200'
                        : provider.status === 'partial'
                          ? 'bg-amber-500/15 text-amber-200'
                          : 'bg-white/10 text-white/50'
                    }`}>
                      {provider.status}
                    </span>
                    <p className="mt-2 text-xs text-white/25">Env vars: {provider.env_vars.join(', ') || 'none'}</p>
                  </div>
                </div>
              ))}

              {providers.length === 0 && (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.01] p-5 text-sm text-white/35">
                  Provider telemetry is not currently available.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Mock Flags</h2>
              <div className="space-y-3">
                {mockedDomains.length > 0 ? (
                  mockedDomains.map(([name]) => (
                    <div key={name} className="rounded-[1rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {name.replaceAll('_', ' ')} is currently forced into mock mode.
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    No frontend-visible mock flags are enabled.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Realtime Subscriptions</h2>
              <div className="space-y-3 text-sm text-white/35">
                {Object.entries(websocketStatus?.subscriptions ?? {}).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between rounded-[1rem] border border-white/5 bg-black/20 px-4 py-3">
                    <span className="uppercase tracking-[0.16em] text-white/60">{name}</span>
                    <span className="font-medium text-white">{count}</span>
                  </div>
                ))}

                {Object.keys(websocketStatus?.subscriptions ?? {}).length === 0 && (
                  <div className="rounded-[1rem] border border-dashed border-white/10 bg-white/[0.01] px-4 py-3">
                    No websocket subscriptions are currently active.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

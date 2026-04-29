'use client'

/*
  Operations dashboard for the application shell.
  Updated in Phase 4 to replace hardcoded sample cards with live platform
  health, provider status, websocket, and alert data.
*/

import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  RadioTower,
  Satellite,
  ShieldCheck,
  ArrowUpRight,
  Clock3,
  MapPin,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { PerspectiveCard } from '@/components/ui/PerspectiveCard'
import { TextReveal } from '@/components/ui/TextReveal'
import {
  useActiveAlerts,
  useDataSourceHealth,
  usePlatformHealth,
  useRecentHazardUpdates,
  useWebSocketStatus,
} from '@/hooks/useOperationsData'

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  tone: 'white' | 'red' | 'green' | 'blue'
}) {
  const toneClasses: Record<'white' | 'red' | 'green' | 'blue', string> = {
    white: 'bg-white/10 text-white',
    red: 'bg-red-500/15 text-red-200',
    green: 'bg-emerald-500/15 text-emerald-200',
    blue: 'bg-sky-500/15 text-sky-200',
  }

  return (
    <PerspectiveCard className="h-full">
      <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-sm text-white/35">{detail}</p>
        </div>
      </div>
    </PerspectiveCard>
  )
}

export default function DashboardPage() {
  const { data: platformHealth, isLoading: loadingHealth } = usePlatformHealth()
  const { data: sourceHealth, isLoading: loadingSources } = useDataSourceHealth()
  const { data: websocketStatus, isLoading: loadingWebsocket } = useWebSocketStatus()
  const { data: activeAlerts, isLoading: loadingAlerts } = useActiveAlerts()
  const { data: recentUpdates, isLoading: loadingUpdates } = useRecentHazardUpdates()

  const providers = Object.entries(sourceHealth?.providers ?? {})
  const liveProviders = providers.filter(([, provider]) => provider.status === 'live').length
  const partialProviders = providers.filter(([, provider]) => provider.status === 'partial').length
  const blockedProviders = providers.filter(([, provider]) => provider.status.includes('blocked')).length

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-8">
      <div className="mb-12">
        <TextReveal text="Mission Control" className="text-4xl font-bold text-white" />
        <p className="mt-2 text-sm tracking-normal text-white/30">
          Live operational status for the environmental intelligence platform.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <MetricCard
            label="Platform Status"
            value={platformHealth?.status?.toUpperCase() || (loadingHealth ? 'LOADING' : 'UNKNOWN')}
            detail={`Environment: ${sourceHealth?.environment || 'unavailable'}`}
            icon={ShieldCheck}
            tone="red"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <MetricCard
            label="Active Alerts"
            value={`${activeAlerts?.length ?? 0}`}
            detail={loadingAlerts ? 'Checking database-backed alerts' : 'Live alerts currently marked active'}
            icon={AlertTriangle}
            tone="white"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <MetricCard
            label="Providers Live"
            value={`${liveProviders}/${providers.length || 0}`}
            detail={`${partialProviders} partial - ${blockedProviders} blocked`}
            icon={Satellite}
            tone="green"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <MetricCard
            label="WebSocket Links"
            value={`${websocketStatus?.total_connections ?? 0}`}
            detail={loadingWebsocket ? 'Checking real-time transport' : `Status: ${websocketStatus?.status || 'idle'}`}
            icon={RadioTower}
            tone="blue"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
              Provider Matrix
            </h2>
            <Link
              href="/settings"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 transition-colors hover:text-white"
            >
              Runtime Settings <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {providers.map(([name, provider]) => (
              <PerspectiveCard key={name}>
                <div className="rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{name.replaceAll('_', ' ')}</h3>
                      <p className="mt-2 text-sm text-white/35">{provider.purpose}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                      provider.status === 'live'
                        ? 'bg-emerald-500/15 text-emerald-200'
                        : provider.status === 'partial'
                          ? 'bg-amber-500/15 text-amber-200'
                          : 'bg-white/10 text-white/50'
                    }`}>
                      {provider.status}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-white/5 pt-4 text-xs text-white/30">
                    Auth: {provider.auth_method}
                  </div>
                </div>
              </PerspectiveCard>
            ))}

            {!loadingSources && providers.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.01] p-6 text-sm text-white/35">
                No provider status data is available from the backend.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
              Recent Hazard Flow
            </h2>

            <div className="space-y-4">
              {recentUpdates?.map((update) => (
                <div key={`${update.hazard_type}-${update.timestamp}`} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{update.hazard_type}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-white/30">
                        <MapPin className="h-3 w-3" />
                        {update.location?.name || 'Unspecified AOI'}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                      {Math.round(update.risk_score)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/25">
                    <span>{update.risk_level}</span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {!loadingUpdates && (recentUpdates?.length ?? 0) === 0 && (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.01] p-5 text-sm text-white/35">
                  No recent hazard updates are stored yet.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-8"
      >
        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
              Active Alerts
            </h2>
            <Link
              href="/alerts"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 transition-colors hover:text-white"
            >
              Open Alerts <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {activeAlerts?.map((alert) => (
              <div key={alert.id} className="rounded-[1.5rem] border border-white/5 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{alert.title}</p>
                    <p className="mt-2 text-sm text-white/35">{alert.description || 'No alert description provided.'}</p>
                  </div>
                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
                    {alert.severity || alert.risk_level}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.location_name || 'Unknown location'}</span>
                  <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{alert.hazard_type}</span>
                </div>
              </div>
            ))}

            {!loadingAlerts && (activeAlerts?.length ?? 0) === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.01] p-6 text-sm text-white/35">
                No active alerts are currently marked in the database.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

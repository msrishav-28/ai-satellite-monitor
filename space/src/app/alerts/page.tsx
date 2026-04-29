'use client'

/*
  Alerts console route for the application shell.
  Added in Phase 4 to display database-backed active alerts and recent hazard
  updates instead of linking to a missing page.
*/

import { motion } from 'framer-motion'
import { AlertTriangle, Clock3, MapPin, Siren, TrendingUp } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { useActiveAlerts, useRecentHazardUpdates } from '@/hooks/useOperationsData'

export default function AlertsPage() {
  const { data: activeAlerts, isLoading: loadingAlerts, error: alertsError } = useActiveAlerts()
  const { data: recentUpdates, isLoading: loadingUpdates, error: updatesError } = useRecentHazardUpdates()

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0E0E0E] p-8">
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-400">Alerts</p>
          <h1 className="mt-4 text-4xl font-bold text-white">Operational Warnings</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/35">
            Live alert inventory from the hazard alert store, paired with the most recent hazard update flow seen by the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Active Alerts</h2>
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
                {activeAlerts?.length ?? 0} open
              </span>
            </div>

            <div className="space-y-4">
              {activeAlerts?.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-[1.5rem] border border-white/5 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-200">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{alert.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">{alert.hazard_type}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-white/40">
                        {alert.description || 'No alert description provided.'}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <span className="rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
                        {alert.severity || alert.risk_level}
                      </span>
                      <p className="mt-3 text-xs text-white/30">Urgency: {alert.urgency || 'unspecified'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.location_name || 'Unknown location'}</span>
                    <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{new Date(alert.issued_at).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}

              {!loadingAlerts && (activeAlerts?.length ?? 0) === 0 && !alertsError && (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.01] p-6 text-sm text-white/35">
                  No active alerts are currently stored in the backend.
                </div>
              )}

              {alertsError && (
                <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-100">
                  Failed to load active alerts.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Siren className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Recent Update Stream</h2>
                  <p className="mt-1 text-sm text-white/35">Most recent hazard updates emitted from alert records.</p>
                </div>
              </div>

              <div className="space-y-4">
                {recentUpdates?.map((update, index) => (
                  <motion.div
                    key={`${update.hazard_type}-${update.timestamp}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-[1.25rem] border border-white/5 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium capitalize text-white">{update.hazard_type}</p>
                        <p className="mt-1 text-xs text-white/30">{update.location?.name || 'Unspecified AOI'}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                        {Math.round(update.risk_score)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/25">
                      <span className="capitalize">{update.risk_level}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{update.trend}</span>
                    </div>
                  </motion.div>
                ))}

                {!loadingUpdates && (recentUpdates?.length ?? 0) === 0 && !updatesError && (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.01] p-5 text-sm text-white/35">
                    No recent hazard updates are available yet.
                  </div>
                )}

                {updatesError && (
                  <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100">
                    Failed to load recent hazard updates.
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

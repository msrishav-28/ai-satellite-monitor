'use client'

/*
  Settings console route for the application shell.
  Added in Phase 4 as a truthful runtime overview for provider configuration,
  frontend endpoints, and mock-mode visibility.
*/

import { AppShell } from '@/components/AppShell'
import { getApiBase, getWebSocketUrl } from '@/lib/api'
import { useDataSourceHealth, usePlatformHealth } from '@/hooks/useOperationsData'

export default function SettingsPage() {
  const { data: sourceHealth } = useDataSourceHealth()
  const { data: platformHealth } = usePlatformHealth()

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0E0E0E] p-8">
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-400">Settings</p>
          <h1 className="mt-4 text-4xl font-bold text-white">Runtime Configuration</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/35">
            Read-only operational settings derived from the current environment. This view is intentionally truthful: runtime behavior is controlled through backend environment variables and deployment configuration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Frontend Endpoints</h2>
              <div className="space-y-4 text-sm text-white/35">
                <div className="rounded-[1.25rem] border border-white/5 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">API Base</p>
                  <p className="mt-2 break-all text-white">{getApiBase()}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/5 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">WebSocket URL</p>
                  <p className="mt-2 break-all text-white">{getWebSocketUrl()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Runtime State</h2>
              <div className="space-y-4 text-sm text-white/35">
                <div className="rounded-[1.25rem] border border-white/5 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Platform Status</p>
                  <p className="mt-2 text-white">{platformHealth?.status || 'unavailable'}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/5 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Environment</p>
                  <p className="mt-2 text-white">{sourceHealth?.environment || 'unavailable'}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/5 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Version</p>
                  <p className="mt-2 text-white">{platformHealth?.version || 'unavailable'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Provider Configuration</h2>
            <div className="space-y-4">
              {Object.entries(sourceHealth?.providers ?? {}).map(([name, provider]) => (
                <div key={name} className="rounded-[1.25rem] border border-white/5 bg-black/20 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{name.replaceAll('_', ' ')}</p>
                      <p className="mt-1 text-sm text-white/35">{provider.purpose}</p>
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
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Configured</p>
                      <p className="mt-1 text-sm text-white">{provider.configured ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Environment Variables</p>
                      <p className="mt-1 text-sm text-white/45">{provider.env_vars.join(', ') || 'None'}</p>
                    </div>
                  </div>
                </div>
              ))}

              {Object.keys(sourceHealth?.providers ?? {}).length === 0 && (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.01] p-5 text-sm text-white/35">
                  Provider configuration details are not available from the backend.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

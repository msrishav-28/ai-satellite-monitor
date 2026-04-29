'use client'

/*
  Timelapse generation panel for the monitor view.
  Updated in Phase 4 to call the real backend timelapse endpoint, validate
  date ranges, and render truthful result metadata and failure states.
*/

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, Film } from 'lucide-react'
import { GlassPanel } from '../shared/GlassPanel'
import { useTimelapseGeneration } from '../../hooks/useSatelliteData'
import { toErrorMessage } from '../../lib/api'

interface Props {
  aoi: any
}

export default function TimeSeriesControl({ aoi }: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const {
    generateTimelapseAsync,
    data: timelapseData,
    isLoading: generating,
    error,
    reset,
  } = useTimelapseGeneration()

  const previewUrl = useMemo(
    () => timelapseData?.video_url ?? timelapseData?.gif_url ?? timelapseData?.thumbnail_url ?? timelapseData?.fallback_url ?? null,
    [timelapseData]
  )

  const handleGenerate = async () => {
    if (!aoi || !startDate || !endDate) return

    if (new Date(startDate) >= new Date(endDate)) {
      setFormError('End date must be after the start date.')
      return
    }

    setFormError(null)
    reset()

    await generateTimelapseAsync({
      aoi,
      timeRange: {
        start_date: startDate,
        end_date: endDate,
      },
    })
  }

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
      className="absolute bottom-40 left-1/2 z-10 w-2/3 max-w-4xl -translate-x-1/2"
    >
      <GlassPanel variant="elevated" className="overflow-hidden">
        <div className="p-6">
          <h3 className="mb-4 flex items-center text-lg font-bold text-gradient">
            <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            Time-Lapse Visualization
          </h3>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="glass-panel rounded-xl p-4">
              <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-tertiary">
                <Calendar className="h-4 w-4" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full border-b border-glass-border bg-transparent pb-2 text-sm text-white outline-none"
              />
            </div>

            <div className="glass-panel rounded-xl p-4">
              <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-tertiary">
                <Calendar className="h-4 w-4" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full border-b border-glass-border bg-transparent pb-2 text-sm text-white outline-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !startDate || !endDate}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Film className="h-4 w-4" />
              {generating ? 'Generating' : 'Generate'}
            </button>
          </div>

          {(formError || error || timelapseData?.status === 'failed') && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {formError || timelapseData?.error || toErrorMessage(error)}
            </div>
          )}

          {previewUrl && timelapseData?.status === 'completed' && (
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="glass-panel rounded-2xl p-3">
                {timelapseData.video_url ? (
                  <video src={previewUrl} controls autoPlay loop className="w-full rounded-xl" />
                ) : (
                  <img src={previewUrl} alt="Generated AOI timelapse preview" className="w-full rounded-xl object-cover" />
                )}
              </div>

              <div className="glass-panel rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-text-tertiary">Request</p>
                <p className="mt-2 text-sm font-medium text-white">{timelapseData.request_id || 'Generated preview'}</p>

                <div className="mt-4 space-y-3 text-sm text-text-secondary">
                  <div className="flex items-center justify-between gap-3">
                    <span>Status</span>
                    <span className="font-medium capitalize text-green-300">{timelapseData.status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Frames</span>
                    <span className="font-medium text-white">{timelapseData.metadata?.frame_count ?? 'n/a'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Duration</span>
                    <span className="font-medium text-white">{timelapseData.metadata?.duration_days ?? 'n/a'} days</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Source</span>
                    <span className="text-right font-medium text-white">{timelapseData.satellite_data?.primary_source ?? 'Sentinel imagery'}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-text-tertiary">
                  {timelapseData.download_options?.note || timelapseData.message || 'Preview URLs may expire depending on the upstream imagery provider.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

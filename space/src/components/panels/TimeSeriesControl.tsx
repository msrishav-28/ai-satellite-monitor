'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from '../shared/GlassPanel'
import { Clock, Calendar, Film } from 'lucide-react'

interface Props {
  aoi: any
}

export default function TimeSeriesControl({ aoi }: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [generating, setGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!aoi || !startDate || !endDate) return
    setGenerating(true)
    setVideoUrl(null)
    try {
      const response = await fetch('/api/time-lapse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi, startDate, endDate }),
      })
      if (!response.ok) {
        throw new Error('Failed to generate time-lapse')
      }
      const data = await response.json()
      setVideoUrl(data.videoUrl)
    } catch (error) {
      console.error('Failed to generate time-lapse:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
      className="absolute bottom-40 left-1/2 -translate-x-1/2 w-2/3 max-w-4xl z-10"
    >
      <GlassPanel>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Clock className="mr-2" />
            Time-Lapse Visualization
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-b border-white/20 p-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-b border-white/20 p-1"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !startDate || !endDate}
              className="px-4 py-2 bg-accent-blue rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Film className="w-5 h-5" />
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {videoUrl && (
            <div className="mt-4">
              <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg" />
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from '../shared/GlassPanel'
import { Brain, Zap, Search } from 'lucide-react'

interface Props {
  aoi: any
}

export default function AIInsights({ aoi }: Props) {
  const [insightsData, setInsightsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!aoi) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aoi }),
        })
        if (!response.ok) {
          throw new Error('Failed to fetch AI insights')
        }
        const data = await response.json()
        setInsightsData(data)
      } catch (error) {
        console.error('Failed to fetch AI insights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [aoi])

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 max-w-4xl z-10"
    >
      <GlassPanel>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Brain className="mr-2" />
            AI-Powered Insights
          </h3>
          {loading ? (
            <div className="text-center p-8">Generating insights...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Anomaly Detection */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center"><Search className="mr-2" /> Anomaly Detection</h4>
                <p className="text-sm"><strong>{insightsData?.anomaly.title}</strong></p>
                <p className="text-xs mt-1">{insightsData?.anomaly.details}</p>
                <p className="text-xs mt-1"><strong>Confidence:</strong> {insightsData?.anomaly.confidence}%</p>
              </div>

              {/* Causal Inference */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center"><Zap className="mr-2" /> Causal Inference</h4>
                <p className="text-sm"><strong>{insightsData?.causal.title}</strong></p>
                <p className="text-xs mt-1">{insightsData?.causal.details}</p>
                <p className="text-xs mt-1"><strong>Estimated Impact:</strong> {insightsData?.causal.impact}</p>
              </div>

              {/* Data Fusion */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center"><Zap className="mr-2" /> Intelligent Data Fusion</h4>
                <p className="text-sm"><strong>{insightsData?.fusion.title}</strong></p>
                <p className="text-xs mt-1">{insightsData?.fusion.details}</p>
                <p className="text-xs mt-1"><strong>Status:</strong> {insightsData?.fusion.status}</p>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

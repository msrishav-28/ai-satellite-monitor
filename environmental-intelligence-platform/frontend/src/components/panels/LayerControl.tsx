'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMapStore } from '@/store/useMapStore'
import * as Switch from '@radix-ui/react-switch'

const layers = [
  { id: 'wildfire-risk', name: 'Wildfire Risk', icon: '🔥', color: 'bg-red-500/20' },
  { id: 'flood-zones', name: 'Flood Susceptibility', icon: '💧', color: 'bg-blue-500/20' },
  { id: 'landslide-risk', name: 'Landslide Risk', icon: '⛰️', color: 'bg-orange-500/20' },
  { id: 'deforestation', name: 'Deforestation Risk', icon: '🌳', color: 'bg-green-500/20' },
  { id: 'heat-wave', name: 'Heat Wave Forecast', icon: '☀️', color: 'bg-pink-500/20' },
  { id: 'cyclone', name: 'Cyclone Intensity', icon: '🌀', color: 'bg-purple-500/20' },
  { id: 'air-quality', name: 'Air Quality (AQI)', icon: '💨', color: 'bg-indigo-500/20' },
  { id: 'infrared', name: 'Infrared Heatmap', icon: '🌡️', color: 'bg-amber-500/20' },
]

export default function LayerControl() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { activeLayers, toggleLayer } = useMapStore()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-24 right-6 z-10"
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsCollapsed(false)}
            className="glass-panel p-4 flex items-center gap-2"
          >
            <Layers className="w-5 h-5 text-accent-blue" />
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-6 w-80"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-accent-blue" />
                <h3 className="text-lg font-semibold">Data Layers</h3>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-3">
              {layers.map((layer) => (
                <motion.div
                  key={layer.id}
                  className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  whileHover={{ x: -4 }}
                  onClick={() => toggleLayer(layer.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${layer.color} rounded-lg flex items-center justify-center text-sm`}>
                      {layer.icon}
                    </div>
                    <span className="text-sm font-medium">{layer.name}</span>
                  </div>
                  
                  <Switch.Root
                    checked={activeLayers.includes(layer.id)}
                    onCheckedChange={() => toggleLayer(layer.id)}
                    className="layer-toggle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch.Thumb className="layer-toggle-ball" />
                  </Switch.Root>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-glass-border">
              <button className="w-full py-2 text-sm text-text-secondary hover:text-white transition-colors">
                Configure layer settings →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
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
  { id: 'arcgis-air-quality', name: 'ArcGIS AQI', icon: '🗺️', color: 'bg-teal-500/20' },
  { id: 'google-airview', name: 'Google AirView', icon: '📡', color: 'bg-cyan-500/20' },
]

export default function LayerControl() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { activeLayers, toggleLayer } = useMapStore()

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="absolute top-24 right-6 z-10"
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            onClick={() => setIsCollapsed(false)}
            className="glass-panel-purple p-4 flex items-center gap-2 group hover:shadow-purple transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronLeft className="w-4 h-4 text-purple-400" />
            </motion.div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="glass-panel-purple p-6 w-[340px] relative overflow-hidden"
          >
            {/* Ambient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-purple">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gradient-purple">Data Layers</h3>
              </motion.div>
              <motion.button
                onClick={() => setIsCollapsed(true)}
                className="p-2 hover:bg-purple-500/10 rounded-lg transition-all duration-200 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-purple-400 transition-colors duration-200" />
              </motion.button>
            </div>

            <div className="space-y-2 relative z-10">
              {layers.map((layer, index) => (
                <motion.div
                  key={layer.id}
                  className="flex items-center justify-between p-4 hover:bg-purple-500/5 rounded-xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-purple-500/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  whileHover={{
                    x: -6,
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => toggleLayer(layer.id)}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`w-10 h-10 ${layer.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <span className="text-white text-sm">{layer.icon}</span>
                    </motion.div>
                    <div>
                      <span className="text-sm font-medium text-text-primary group-hover:text-white transition-colors duration-200">
                        {layer.name}
                      </span>
                      <div className="text-xs text-text-tertiary">
                        {activeLayers.includes(layer.id) ? 'Active' : 'Inactive'}
                      </div>
                    </div>
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

            <motion.div
              className="mt-6 pt-6 border-t border-glass-border-strong relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                className="w-full py-3 text-sm text-text-secondary hover:text-purple-400 transition-all duration-200 hover:bg-purple-500/5 rounded-xl group flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Configure layer settings</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
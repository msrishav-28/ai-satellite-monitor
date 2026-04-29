'use client'

/*
  Layer control for the globe monitor.
  Updated in Phase 4 to use canonical backend layer identifiers, non-emoji
  iconography, and clearer descriptions for each operational overlay.
*/

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Flame,
  Droplets,
  Mountain,
  Trees,
  Sun,
  Wind,
  Cloudy,
  Thermometer,
  type LucideIcon,
} from 'lucide-react'
import * as Switch from '@radix-ui/react-switch'
import { useMapStore } from '@/store/useMapStore'

type LayerDefinition = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
}

const layers: LayerDefinition[] = [
  { id: 'wildfire', name: 'Wildfire Risk', description: 'Active burn and spread exposure', icon: Flame, color: 'bg-red-500/20' },
  { id: 'flood', name: 'Flood Exposure', description: 'Drainage and inundation pressure', icon: Droplets, color: 'bg-blue-500/20' },
  { id: 'landslide', name: 'Landslide Risk', description: 'Slope instability and saturation', icon: Mountain, color: 'bg-orange-500/20' },
  { id: 'vegetation', name: 'Vegetation Health', description: 'Coverage and biomass trends', icon: Trees, color: 'bg-emerald-500/20' },
  { id: 'temperature', name: 'Surface Heat', description: 'Thermal anomalies and hotspots', icon: Thermometer, color: 'bg-amber-500/20' },
  { id: 'weather', name: 'Weather Systems', description: 'Storm structures and fronts', icon: Cloudy, color: 'bg-sky-500/20' },
  { id: 'aqi', name: 'Air Quality', description: 'AQI and pollution plumes', icon: Wind, color: 'bg-violet-500/20' },
  { id: 'satellite', name: 'Satellite Coverage', description: 'Recent imagery availability', icon: Sun, color: 'bg-fuchsia-500/20' },
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
        ease: [0.16, 1, 0.3, 1],
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
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={() => setIsCollapsed(false)}
            className="glass-panel-purple group flex items-center gap-2 p-4 transition-all duration-300 hover:shadow-purple"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronLeft className="h-4 w-4 text-purple-400" />
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
              ease: [0.16, 1, 0.3, 1],
            }}
            className="glass-panel-purple relative w-[340px] overflow-hidden p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5" />

            <div className="relative z-10 mb-6 flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gradient-purple">Data Layers</h3>
              </motion.div>
              <motion.button
                onClick={() => setIsCollapsed(true)}
                className="group rounded-lg p-2 transition-all duration-200 hover:bg-purple-500/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="h-4 w-4 text-text-secondary transition-colors duration-200 group-hover:text-purple-400" />
              </motion.button>
            </div>

            <div className="relative z-10 space-y-2">
              {layers.map((layer, index) => (
                <motion.div
                  key={layer.id}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-4 transition-all duration-300 hover:border-purple-500/20 hover:bg-purple-500/5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    x: -6,
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => toggleLayer(layer.id)}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${layer.color} shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <layer.icon className="h-4 w-4 text-white" />
                    </motion.div>
                    <div>
                      <span className="text-sm font-medium text-text-primary transition-colors duration-200 group-hover:text-white">
                        {layer.name}
                      </span>
                      <div className="text-xs text-text-tertiary">
                        {layer.description}
                      </div>
                    </div>
                  </div>

                  <Switch.Root
                    checked={activeLayers.includes(layer.id)}
                    onCheckedChange={() => toggleLayer(layer.id)}
                    className="layer-toggle"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Switch.Thumb className="layer-toggle-ball" />
                  </Switch.Root>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="relative z-10 mt-6 border-t border-glass-border-strong pt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs leading-relaxed text-text-tertiary">
                Layer visibility is driven by the live map-layer API. Combine overlays to compare weather, heat, vegetation, and hazard signals within the same AOI.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

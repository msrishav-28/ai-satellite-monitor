'use client'

import { useState } from 'react'
import { Search, MapPin, Navigation } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMapStore } from '@/store/useMapStore'

export default function SearchPanel() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { mapInstance } = useMapStore()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || !mapInstance) return

    setIsSearching(true)

    try {
      // Geocoding API call
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center
        
        mapInstance.flyTo({
          center: [lng, lat],
          zoom: 10,
          duration: 2000,
          essential: true
        })
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCurrentLocation = () => {
    if (!mapInstance) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapInstance.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 12,
          duration: 2000
        })
      },
      (error) => {
        console.error('Location error:', error)
      }
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="absolute top-6 left-24 z-10"
    >
      <motion.form
        onSubmit={handleSearch}
        className="glass-panel-purple p-2 flex items-center gap-2 w-[420px] group relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Ambient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex-1 flex items-center gap-3 px-4 relative z-10">
          <motion.div
            animate={{
              rotate: isSearching ? 360 : 0,
              scale: isSearching ? 1.1 : 1
            }}
            transition={{
              rotate: { duration: 1, repeat: isSearching ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.2 }
            }}
          >
            <Search className="w-5 h-5 text-purple-400" />
          </motion.div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location or coordinates..."
            className="flex-1 bg-transparent py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:placeholder:text-text-secondary transition-colors duration-200"
          />
        </div>

        <motion.button
          type="button"
          onClick={handleCurrentLocation}
          className="p-3 hover:bg-purple-500/10 rounded-xl transition-all duration-200 group/btn relative z-10"
          title="Use current location"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Navigation className="w-5 h-5 text-text-secondary group-hover/btn:text-purple-400 transition-colors duration-200" />
        </motion.button>

        <motion.button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-purple relative z-10 group/submit overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-400 opacity-0 group-hover/submit:opacity-100 transition-opacity duration-300" />
          <MapPin className="w-5 h-5 text-white relative z-10" />
        </motion.button>
      </motion.form>

      {/* Recent searches */}
      <motion.div
        className="mt-3 glass-panel p-4 w-[420px] opacity-0 hover:opacity-100 transition-all duration-300 hover:shadow-glass-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0, y: 0 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs text-text-tertiary mb-3 font-medium">Recent searches</p>
        <div className="space-y-1">
          {['California, USA', 'Amazon Rainforest', 'Tokyo, Japan'].map((location, index) => (
            <motion.button
              key={location}
              onClick={() => setQuery(location)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-purple-500/10 rounded-lg transition-all duration-200 text-text-secondary hover:text-text-primary group/item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-200" />
                {location}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
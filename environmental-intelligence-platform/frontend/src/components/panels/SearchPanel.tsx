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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-6 left-24 z-10"
    >
      <form onSubmit={handleSearch} className="glass-panel p-1 flex items-center gap-2 w-96">
        <div className="flex-1 flex items-center gap-3 px-4">
          <Search className={`w-5 h-5 ${isSearching ? 'animate-pulse' : ''} text-text-secondary`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location or coordinates..."
            className="flex-1 bg-transparent py-3 text-white placeholder:text-text-secondary focus:outline-none"
          />
        </div>
        
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="p-3 hover:bg-white/10 rounded-xl transition-colors"
          title="Use current location"
        >
          <Navigation className="w-5 h-5 text-text-secondary hover:text-accent-blue" />
        </button>
        
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          <MapPin className="w-5 h-5 text-white" />
        </button>
      </form>

      {/* Recent searches */}
      <div className="mt-2 glass-panel p-4 w-96 opacity-0 hover:opacity-100 transition-opacity">
        <p className="text-xs text-text-secondary mb-2">Recent searches</p>
        <div className="space-y-1">
          {['California, USA', 'Amazon Rainforest', 'Tokyo, Japan'].map((location) => (
            <button
              key={location}
              onClick={() => setQuery(location)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors"
            >
              {location}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
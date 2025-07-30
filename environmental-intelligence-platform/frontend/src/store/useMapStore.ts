import create from 'zustand'
import type { MapRef } from 'react-map-gl'

interface MapState {
  mapInstance: MapRef | null
  activeLayers: string[]
  setMapInstance: (map: MapRef) => void
  toggleLayer: (layerId: string) => void
}

export const useMapStore = create<MapState>((set) => ({
  mapInstance: null,
  activeLayers: [],
  setMapInstance: (map) => set({ mapInstance: map }),
  toggleLayer: (layerId) =>
    set((state) => ({
      activeLayers: state.activeLayers.includes(layerId)
        ? state.activeLayers.filter((id) => id !== layerId)
        : [...state.activeLayers, layerId],
    })),
}))

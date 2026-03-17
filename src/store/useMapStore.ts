import { create } from 'zustand'

export interface SearchResult {
  title: string
  category: string
  address: string
  roadAddress: string
  telephone: string
  link: string
  lat: number
  lng: number
}

interface MapState {
  mapInstance: naver.maps.Map | null
  setMapInstance: (map: naver.maps.Map | null) => void

  center: { lat: number; lng: number }
  setCenter: (lat: number, lng: number) => void

  results: SearchResult[]
  isLoading: boolean
  error: string | null

  selectedResult: SearchResult | null
  setSelectedResult: (result: SearchResult | null) => void

  searchNearby: (lat: number, lng: number, keyword?: string) => Promise<void>
}

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787'

export const useMapStore = create<MapState>((set) => ({
  mapInstance: null,
  setMapInstance: (map) => set({ mapInstance: map }),

  center: { lat: 37.5665, lng: 126.978 },
  setCenter: (lat, lng) => set({ center: { lat, lng } }),

  results: [],
  isLoading: false,
  error: null,

  selectedResult: null,
  setSelectedResult: (result) => set({ selectedResult: result }),

  searchNearby: async (lat, lng, keyword = '버터떡') => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${WORKER_URL}/api/search?q=${encodeURIComponent(keyword)}&lat=${lat}&lng=${lng}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      set({ results: data.items || [] })
      set({ center: { lat, lng } })
      // [FIX] 여기서 mapInstance.setCenter() 를 호출하지 않습니다. 
      // 지도를 드래그하는 도중에 중심좌표가 강제로 초기화되는(뚝 끊기는) 현상을 방지합니다.
    } catch (err) {
      set({ error: String(err) })
    } finally {
      set({ isLoading: false })
    }
  },
}))

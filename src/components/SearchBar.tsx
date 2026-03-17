import { useState, useMemo, useEffect, useRef } from 'react'
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework'
import { useMapStore } from '../store/useMapStore'
import { isAitSupported } from '../utils/aitSupport'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787'
const FULL_AD_GROUP_ID = 'toss_full'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const { results, isLoading, mapInstance, searchNearby } = useMapStore()

  // 전면 광고 상태
  const [adLoaded, setAdLoaded] = useState(false)
  const unregisterAdRef = useRef<(() => void) | null>(null)
  const pendingSearch = useRef<{ lat: number; lng: number; keyword: string } | null>(null)

  function loadAd() {
    if (!isAitSupported(loadFullScreenAd)) return
    setAdLoaded(false)
    const unregister = loadFullScreenAd({
      options: { adGroupId: FULL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') setAdLoaded(true)
      },
      onError: () => { /* 광고 로드 실패 시 무시 */ },
    })
    unregisterAdRef.current = unregister
  }

  useEffect(() => {
    loadAd()
    return () => { unregisterAdRef.current?.() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function executeSearch() {
    const pending = pendingSearch.current
    if (!pending) return
    if (mapInstance) {
      mapInstance.setCenter(new naver.maps.LatLng(pending.lat, pending.lng))
    }
    searchNearby(pending.lat, pending.lng, pending.keyword)
    pendingSearch.current = null
    setQuery('')
  }

  async function handleSearch() {
    const q = query.trim()
    if (!q) return

    setIsGeocoding(true)
    setGeoError(null)

    try {
      const res = await fetch(`${WORKER_URL}/api/geocode?q=${encodeURIComponent(q)}`)
      const data = await res.json()

      if (!res.ok || !data.lat) {
        setGeoError(data.error || '지역을 찾을 수 없어요')
        return
      }

      pendingSearch.current = { lat: data.lat, lng: data.lng, keyword: `${q} 버터떡` }

      // 전면 광고 노출 후 검색 실행
      if (isAitSupported(loadFullScreenAd) && adLoaded) {
        showFullScreenAd({
          options: { adGroupId: FULL_AD_GROUP_ID },
          onEvent: (event) => {
            if (event.type === 'dismissed' || event.type === 'failedToShow') {
              executeSearch()
              setAdLoaded(false)
              loadAd()
            }
          },
          onError: () => executeSearch(),
        })
      } else {
        executeSearch()
      }
    } catch {
      setGeoError('검색 중 오류가 발생했어요')
    } finally {
      setIsGeocoding(false)
    }
  }

  const isBusy = isGeocoding || isLoading

  const visibleCount = useMemo(() => {
    if (!mapInstance || results.length === 0) return results.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bounds = (mapInstance as any).getBounds()
    if (!bounds) return results.length
    const sw = bounds.getSW()
    const ne = bounds.getNE()
    return results.filter(r =>
      r.lat >= sw.lat() && r.lat <= ne.lat() &&
      r.lng >= sw.lng() && r.lng <= ne.lng()
    ).length
  }, [results, mapInstance])

  return (
    <div className="px-4 pt-3 pb-1">
      {/* 검색 필드 */}
      <div
        className="bg-white rounded-full flex items-center px-4 gap-3 transition-shadow duration-200"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', height: '52px' }}
      >
        <img src="/butter.png" className="w-7 h-7 object-contain flex-none" alt="" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setGeoError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="지역명 검색 (예: 강남, 홍대)"
          className="flex-1 text-sm text-toss-text placeholder:text-toss-text-sub outline-none bg-transparent min-w-0"
        />

        {/* 로딩 스피너 or 검색 버튼 */}
        <button
          onClick={handleSearch}
          disabled={isBusy}
          className="flex-none text-toss-text-sub active:scale-90 transition-transform disabled:opacity-40"
          aria-label="검색"
        >
          {isBusy ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#E5E8EB" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#3182F6" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          )}
        </button>
      </div>

      {/* 에러 메시지 */}
      {geoError && (
        <div className="mt-2 ml-1">
          <span className="text-xs text-red-500 font-medium">{geoError}</span>
        </div>
      )}

      {/* 결과 수 (에러 없을 때) */}
      {!geoError && visibleCount > 0 && (
        <div className="mt-2 ml-1">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-toss-text bg-white rounded-full px-3 py-1.5"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.10)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-toss-blue inline-block" />
            {visibleCount}개 매장
          </span>
        </div>
      )}
    </div>
  )
}

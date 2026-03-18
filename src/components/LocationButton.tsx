import { useEffect, useRef, useState } from 'react'
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework'
import { useMapStore } from '../store/useMapStore'
import { isAitSupported } from '../utils/aitSupport'

const REWARDED_AD_GROUP_ID = 'toss_reward'

export default function LocationButton() {
  const { setCenter, searchNearby, mapInstance } = useMapStore()
  const [adLoaded, setAdLoaded] = useState(false)
  const [adLoading, setAdLoading] = useState(false)
  const unregisterRef = useRef<(() => void) | null>(null)

  function loadAd() {
    if (!isAitSupported(loadFullScreenAd)) return
    setAdLoading(true)
    setAdLoaded(false)
    const unregister = loadFullScreenAd({
      options: { adGroupId: REWARDED_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          setAdLoaded(true)
          setAdLoading(false)
        }
      },
      onError: () => setAdLoading(false),
    })
    unregisterRef.current = unregister
  }

  useEffect(() => {
    loadAd()
    return () => { unregisterRef.current?.() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function requestLocation() {
    if (!navigator.geolocation) {
      alert('이 기기에서는 위치 서비스를 사용할 수 없습니다.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCenter(lat, lng)
        if (mapInstance) {
          mapInstance.setCenter(new naver.maps.LatLng(lat, lng))
        }
        searchNearby(lat, lng)
      },
      () => alert('위치를 가져올 수 없습니다. 권한을 확인해주세요.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function handleClick() {
    if (!isAitSupported(loadFullScreenAd) || !adLoaded) {
      requestLocation()
      return
    }
    showFullScreenAd({
      options: { adGroupId: REWARDED_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'userEarnedReward') requestLocation()
        if (event.type === 'dismissed') { setAdLoaded(false); loadAd() }
        if (event.type === 'failedToShow') requestLocation()
      },
      onError: () => requestLocation(),
    })
  }

  const isAdMode = isAitSupported(loadFullScreenAd)

  return (
    <button
      onClick={handleClick}
      aria-label="내 주변 버터떡 검색"
      className="active:scale-95 transition-transform duration-150 select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div
        className="flex items-center gap-3 px-6 rounded-full"
        style={{
          height: '52px',
          background: 'linear-gradient(135deg, #3182F6 0%, #1756C8 100%)',
          boxShadow: '0 4px 20px rgba(49, 130, 246, 0.50), 0 1px 4px rgba(0,0,0,0.12)',
        }}
      >
        {/* 아이콘 */}
        {adLoading ? (
          <svg className="animate-spin flex-none" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg className="flex-none" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <polygon points="3 11 22 2 13 21 11 13 3 11" fill="white"/>
          </svg>
        )}

        {/* 텍스트 */}
        <span className="text-[15px] font-bold text-white tracking-tight whitespace-nowrap">
          {adLoading
            ? '광고 준비 중…'
            : isAdMode
              ? '광고 보고 내 주변 검색'
              : '내 주변 검색'}
        </span>
      </div>
    </button>
  )
}

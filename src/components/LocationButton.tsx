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
        if (event.type === 'userEarnedReward') {
          requestLocation()
        }
        if (event.type === 'dismissed') {
          setAdLoaded(false)
          loadAd()
        }
        if (event.type === 'failedToShow') {
          requestLocation()
        }
      },
      onError: () => requestLocation(),
    })
  }

  const isAdMode = isAitSupported(loadFullScreenAd)

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-4 px-5 active:opacity-60 transition-opacity"
      style={{ height: '64px' }}
      aria-label="내 주변 버터떡 검색"
    >
      {/* 아이콘 */}
      <div
        className="flex-none w-11 h-11 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #3182F6 0%, #1B6EEB 100%)', boxShadow: '0 2px 8px rgba(49,130,246,0.35)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <polygon points="3 11 22 2 13 21 11 13 3 11" fill="white" />
        </svg>
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col items-start flex-1 min-w-0">
        <span className="text-[15px] font-bold text-toss-text leading-snug">내 주변 검색</span>
        <span className="text-xs text-toss-text-sub leading-snug">
          {adLoading
            ? '광고 준비 중...'
            : isAdMode
              ? adLoaded ? '광고를 보고 이용해요' : '바로 이용해요'
              : '내 위치로 이동해요'}
        </span>
      </div>

      {/* 광고 배지 */}
      {isAdMode && (
        <div className="flex-none flex items-center gap-1">
          {adLoaded ? (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#FFF3E0', color: '#E65100' }}
            >
              광고
            </span>
          ) : (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#EFF6FF', color: '#3182F6' }}
            >
              무료
            </span>
          )}
        </div>
      )}
    </button>
  )
}

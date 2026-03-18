import { useEffect, useState } from 'react'
import { TossAds } from '@apps-in-toss/web-framework'
import { isAitSupported } from './utils/aitSupport'
import MapContainer from './components/MapContainer'
import SearchBar from './components/SearchBar'
import LocationButton from './components/LocationButton'
import StoreBottomSheet from './components/StoreBottomSheet'
import AdBanner from './components/AdBanner'

export default function App() {
  const [adsInitialized, setAdsInitialized] = useState(false)

  useEffect(() => {
    if (!isAitSupported(TossAds.initialize)) return
    TossAds.initialize({
      callbacks: {
        onInitialized: () => setAdsInitialized(true),
        onInitializationFailed: (error) => {
          console.warn('TossAds 초기화 실패:', error)
        },
      },
    })
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-toss-bg">

      {/* 지도 전체화면 */}
      <div className="absolute inset-0">
        <MapContainer />
      </div>

      {/* 검색바 (지도 위 float) */}
      <div
        className="absolute top-0 left-0 right-0 z-10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <SearchBar />
      </div>

      {/* 매장 상세 바텀시트 */}
      <StoreBottomSheet />

      {/* 하단 영역: 배너 + 내 주변 버튼 플로팅 */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <AdBanner isInitialized={adsInitialized} />
        <div className="py-4">
          <LocationButton />
        </div>
      </div>

    </div>
  )
}

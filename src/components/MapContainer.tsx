import { useEffect, useRef } from 'react'
import { useMapStore } from '../store/useMapStore'
import MarkerManager from './MarkerManager'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787'

export default function MapContainer() {
  const mapRef = useRef<HTMLDivElement>(null)
  const { center, setMapInstance, searchNearby } = useMapStore()
  const mapInstanceRef = useRef<naver.maps.Map | null>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addressInfoWindowRef = useRef<naver.maps.InfoWindow | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    if (typeof naver === 'undefined' || !naver?.maps?.Map) return

    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom: 15,
      scaleControl: false,
      mapDataControl: false,
      zoomControl: false,
    })

    mapInstanceRef.current = map
    setMapInstance(map)

    // 초기 검색
    searchNearby(center.lat, center.lng)

    const triggerSearch = () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => {
        if (!mapInstanceRef.current) return
        const c = mapInstanceRef.current.getCenter()
        searchNearby(c.lat(), c.lng())
      }, 500)
    }

    map.addListener('dragend', triggerSearch)
    map.addListener('zoom_changed', triggerSearch)

    // 지도 클릭: 역지오코딩으로 주소만 표시
    map.addListener('click', async (e?: naver.maps.MapClickEvent) => {
      if (!e?.coord || !mapInstanceRef.current) return
      const lat = e.coord.lat()
      const lng = e.coord.lng()

      // 이전 주소 팝업 닫기
      addressInfoWindowRef.current?.close()

      try {
        const res = await fetch(`${WORKER_URL}/api/reverse-geocode?lat=${lat}&lng=${lng}`)
        const data = await res.json()
        if (!data.address) return

        const iw = new naver.maps.InfoWindow({
          content: `<div style="padding:8px 14px;font-size:13px;font-weight:600;color:#191F28;white-space:nowrap">${data.address}</div>`,
          borderWidth: 0,
          backgroundColor: 'white',
          disableAnchor: false,
        })
        iw.open(mapInstanceRef.current, new naver.maps.LatLng(lat, lng))
        addressInfoWindowRef.current = iw

        // 4초 후 자동 닫기
        setTimeout(() => iw.close(), 4000)
      } catch { /* ignore */ }
    })

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      setMapInstance(null)
      mapInstanceRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const noSdk = typeof naver === 'undefined' || !naver?.maps?.Map

  return (
    <div className="relative w-full h-full">
      {noSdk ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-toss-bg text-toss-text-sub text-sm gap-2">
          <span className="text-4xl">🗺️</span>
          <p className="font-semibold text-toss-text">네이버 지도 API 키가 필요합니다</p>
          <p className="text-xs">.env 파일에 VITE_NAVER_MAP_CLIENT_ID를 설정해주세요</p>
        </div>
      ) : (
        <>
          <div ref={mapRef} id="naver-map" className="naver-map-container w-full h-full" />
          {mapInstanceRef.current && <MarkerManager />}
        </>
      )}
    </div>
  )
}

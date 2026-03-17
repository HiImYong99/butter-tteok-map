import { useEffect, useRef } from 'react'
import { useMapStore, SearchResult } from '../store/useMapStore'

function createMarkerIcon(item: SearchResult): string {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="
        background:#FFD233;
        border-radius:50%;
        width:40px;
        height:40px;
        border:2.5px solid #fff;
        box-shadow:0 2px 10px rgba(0,0,0,0.2);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <img src="/butter.png" style="width:28px;height:28px;object-fit:contain;display:block;" alt="" />
      </div>
      <div style="
        background:#fff;
        border-radius:6px;
        padding:2px 7px;
        margin-top:3px;
        font-size:10px;
        font-weight:700;
        color:#191F28;
        box-shadow:0 1px 4px rgba(0,0,0,0.12);
        max-width:80px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      ">${item.title}</div>
    </div>
  `
}

export default function MarkerManager() {
  const { results, mapInstance, setSelectedResult } = useMapStore()
  const markersRef = useRef<naver.maps.Marker[]>([])

  useEffect(() => {
    if (!mapInstance) return

    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    results.forEach((item) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(item.lat, item.lng),
        map: mapInstance,
        icon: {
          content: createMarkerIcon(item),
          anchor: new naver.maps.Point(20, 58),
        },
        title: item.title,
      })

      marker.addListener('click', () => setSelectedResult(item))
      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
    }
  }, [results, mapInstance]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

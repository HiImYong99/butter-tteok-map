// 네이버 지도 SDK 타입 선언
declare namespace naver {
  namespace maps {
    class Map {
      constructor(element: HTMLElement | string, options?: MapOptions)
      setCenter(latlng: LatLng): void
      getCenter(): LatLng
      getBounds(): { getSW(): LatLng; getNE(): LatLng } | null
      addListener(event: string, handler: (e?: MapClickEvent) => void): void
      removeListener(listener: unknown): void
    }

    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
    }

    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
      addListener(event: string, handler: () => void): void
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions)
      open(map: Map, anchor: Marker | LatLng): void
      close(): void
    }

    interface MapClickEvent {
      coord: LatLng
    }

    interface MapOptions {
      center: LatLng
      zoom?: number
      mapTypeId?: string
      scaleControl?: boolean
      mapDataControl?: boolean
      zoomControl?: boolean
    }

    interface MarkerOptions {
      position: LatLng
      map?: Map
      icon?: MarkerIcon
      title?: string
    }

    interface MarkerIcon {
      content?: string
      anchor?: Point
    }

    class Point {
      constructor(x: number, y: number)
    }

    interface InfoWindowOptions {
      content: string
      maxWidth?: number
      backgroundColor?: string
      borderColor?: string
      borderWidth?: number
      disableAnchor?: boolean
    }
  }
}

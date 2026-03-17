# Phase 2 Handoff: 토스 미니앱 프론트엔드

## 웹뷰 UI 방어 로직

### 1. 오버스크롤/바운스 방지
- `src/index.css`에서 `html, body { overscroll-behavior: none; overflow: hidden; }` 전역 적용
- `#root`도 `overflow: hidden` 처리

### 2. Safe Area 대응
- `App.tsx` 최상위 컨테이너: `paddingTop: env(safe-area-inset-top)`
- `AdBanner.tsx`: `paddingBottom: env(safe-area-inset-bottom)`
- `index.html`에 `viewport-fit=cover` 메타 태그 포함

### 3. 터치 액션 제어
- `.naver-map-container { touch-action: pan-x pan-y; }` — 지도 터치 vs 웹뷰 스와이프 충돌 방지
- 전역 `-webkit-user-select: none; -webkit-touch-callout: none;` 텍스트 선택/콜아웃 비활성화

### 4. 레이아웃 구조
```
fixed inset-0 flex flex-col overflow-hidden
├─ header (flex-none, h-14)
├─ main (flex-1, relative overflow-hidden)
│   ├─ MapContainer (w-full h-full)
│   └─ 재검색 플로팅 버튼 (absolute, top-3, z-10)
└─ AdBanner (flex-none, fixed bottom-0)
```

---

## 상태 관리 구조 (Zustand - useMapStore)

| 상태 | 타입 | 역할 |
|------|------|------|
| `mapInstance` | `naver.maps.Map \| null` | 네이버 지도 인스턴스 참조 |
| `center` | `{ lat, lng }` | 현재 지도 중심 좌표 |
| `results` | `SearchResult[]` | 검색 결과 목록 |
| `isLoading` | `boolean` | API 로딩 상태 |
| `error` | `string \| null` | 에러 메시지 |
| `hasMapMoved` | `boolean` | 드래그 감지 → 재검색 버튼 표시 트리거 |

### 핵심 액션
- `searchNearby(query, lat, lng)`: Worker Proxy `/api/search` 호출 → 결과 저장
- `setHasMapMoved(true)`: 지도 dragend 시 재검색 버튼 노출
- `setHasMapMoved(false)`: 재검색 실행 시 버튼 숨김

---

## 컴포넌트 구조

```
App.tsx
├─ MapContainer.tsx       # 네이버 지도 초기화, dragend 감지
│   └─ MarkerManager.tsx  # 검색 결과 마커 렌더링, 인포윈도우 (배타적 노출)
├─ LocationButton.tsx     # 보상형 광고 → 위치 권한 획득
└─ AdBanner.tsx           # 하단 배너 광고 슬롯
```

### 마커 & 인포윈도우
- 버터떡 이모지(🧈) 기반 커스텀 마커
- 마커 클릭 시 인포윈도우 열림 — 기존 인포윈도우는 닫힘 (배타적 노출 보장)
- 인포윈도우 내 `nmap://` 딥링크로 네이버 지도 길찾기 연동

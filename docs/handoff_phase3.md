# Phase 3 Handoff: 수익화 및 권한 제어

## 광고 SDK 연동 포인트

### 배너 광고 (AdBanner.tsx)
- DOM 요소 `id="apps-in-toss-banner-ad"` 에 앱인토스 배너 광고 SDK 마운트
- 고정 높이 50px, 화면 하단 fixed 배치
- Safe Area 하단 여백(`env(safe-area-inset-bottom)`) 자동 적용

### 보상형 광고 (LocationButton.tsx)
- `window.AppsInTossAd.showRewardedAd(options)` 호출
- 실제 SDK 패키지: 앱인토스 SDK 문서 참조 (환경에 따라 달라짐)

---

## 권한 획득 플로우 (Ad Flow Rule)

```
사용자 클릭 (LocationButton)
    │
    ▼
window.AppsInTossAd.showRewardedAd 호출
    │
    ├─ onRewardEarned() ← ✅ 여기서만 geolocation 호출
    │       │
    │       ▼
    │   navigator.geolocation.getCurrentPosition()
    │       │
    │       ▼
    │   위치 획득 → setCenter() → mapInstance.setCenter() → searchNearby()
    │
    ├─ onAdFailed(reason) → alert (위치 요청 안 함)
    └─ onAdDismissed()    → 아무것도 안 함 (위치 요청 안 함)
```

**핵심 보장:** `navigator.geolocation.getCurrentPosition`은 오직 `onRewardEarned` 콜백 내부에서만 호출됩니다. 광고 완료 전 위치 권한 프롬프트가 절대 뜨지 않습니다.

---

## 개발 환경 Fallback
- `window.AppsInTossAd`가 없는 경우(로컬 개발 등) 직접 위치 요청으로 폴백
- 프로덕션 배포 전 SDK 분기 제거 여부 검토 필요

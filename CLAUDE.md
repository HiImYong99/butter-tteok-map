# Butter Map - Apps In Toss Mini-App

## Project Overview
Butter Map is a Toss Mini-App (App-in-Toss) built with Vite (React + TS) and Cloudflare Workers. It provides a map interface to find "Butter" spots, using Naver Maps API and Cloudflare Workers as a proxy for coordinate transformation (KATECH to WGS84).

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend/Proxy**: Cloudflare Workers (Wrangler)
- **Deployment**: Cloudflare Pages + Workers
- **External APIs**: Naver Search API, Naver Maps SDK

## Development Commands
- **Install Dependencies**: `npm install`
- **Run Frontend Dev**: `npm run dev` (Vite, port 5173)
- **Run Worker Dev**: `npx wrangler dev worker/proxy.js --local` (port 8787)
- **Deploy Worker**: `npx wrangler deploy worker/proxy.js`
- **Build Frontend**: `npm run build`
- **Set Secrets**: `npx wrangler secret put NAVER_CLIENT_ID`

## Project Structure
```
butter_map/
├─ src/
│   ├─ App.tsx                  # 루트 레이아웃, safe-area, 재검색 버튼
│   ├─ main.tsx                 # React 진입점
│   ├─ index.css                # 웹뷰 최적화 글로벌 CSS
│   ├─ vite-env.d.ts            # Vite 환경 변수 타입
│   ├─ types/naver.d.ts         # 네이버 지도 SDK 타입 선언
│   ├─ store/useMapStore.ts     # Zustand 전역 상태
│   └─ components/
│       ├─ MapContainer.tsx     # 네이버 지도 초기화 + dragend 감지
│       ├─ MarkerManager.tsx    # 마커 렌더링 + 인포윈도우(배타적)
│       ├─ AdBanner.tsx         # 하단 배너 광고 슬롯
│       └─ LocationButton.tsx   # 보상형 광고 → 위치 권한 플로우
├─ worker/
│   └─ proxy.js                 # Cloudflare Worker: Naver API + KATECH→WGS84
├─ docs/
│   ├─ spec.md                  # 프로젝트 명세
│   ├─ handoff_phase1.md        # 인프라/배포 가이드
│   ├─ handoff_phase2.md        # 웹뷰 UI/상태 관리 가이드
│   └─ handoff_phase3.md        # 광고/위치 권한 플로우
├─ wrangler.toml                # Cloudflare 배포 설정
├─ vite.config.ts               # Vite + /api 프록시 설정
└─ .env.example                 # 환경 변수 템플릿
```

## Apps In Toss Guidelines

### 1. Webview UI/UX Optimization
- **Overscroll/Bounce**: Prevent background bounce using `overscroll-none` on the root container.
- **Safe Area**: Ensure UI elements do not overlap with the device's notch or home indicator. Use Tailwind's `pb-[env(safe-area-inset-bottom)]`.
- **Keyboard**: Handle mobile keyboard pop-ups gracefully (adjust container height if necessary).
- **Selection**: Disable unintended text selection/callouts using `-webkit-user-select: none;` and `-webkit-touch-callout: none;`.

### 2. Interaction & Deep Links
- **Map Interaction**: Ensure map touch gestures don't conflict with webview swipe-to-back gestures.
- **Deep Links**: Use `nmap://` for Naver Map integration and `toss://` for Toss internal navigation if needed.

### 3. Ads & Permissions
- **Ad Flow**: When using Rewarded Ads, ensure the ad completes fully before executing the protected action (e.g., requesting location).
- **Location**: Use `navigator.geolocation` only after explicit user interaction or ad reward.

### 4. Toss Design System (TDS) Vibes
- Use premium aesthetics: sleek dark mode, soft gradients, and high-quality micro-animations.
- Follow Toss's signature typography and spacing.

## Code Style & Patterns
- **State Management**: Use Zustand for global state (map position, search results).
- **API Proxying**: All sensitive API keys (Naver) must remain on the Cloudflare Worker side.
- **Functional Components**: Use React functional components with Hooks.
- **Tailwind**: Use Utility-first CSS but keep repetitive patterns in custom components.

## MCP Integration
This project is optimized for use with the `apps_in_toss` MCP server.
If using Claude Code, you can add the MCP server to your configuration to access real-time documentation:
```bash
claude config mcp set apps_in_toss -- command npx -y @toss/apps-in-toss-mcp
```
(Note: Command may vary based on exact package name or local setup)

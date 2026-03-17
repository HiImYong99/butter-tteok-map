# Phase 1 Handoff: 인프라 및 프록시 아키텍트

## 로컬 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에 VITE_NAVER_MAP_CLIENT_ID 입력
```

### 3. Wrangler 시크릿 등록 (최초 1회)
```bash
npx wrangler secret put NAVER_CLIENT_ID      # 네이버 검색 API Client ID
npx wrangler secret put NAVER_CLIENT_SECRET  # 네이버 검색 API Client Secret
```

### 4. Worker 프록시 로컬 실행 (포트 8787)
```bash
npx wrangler dev worker/proxy.js --local
```

### 5. Vite 프론트엔드 로컬 실행 (포트 5173)
```bash
npm run dev
```

> `vite.config.ts`의 proxy 설정으로 `/api/*` 요청이 자동으로 `localhost:8787`로 프록시됩니다.

---

## 배포 구조

```
Cloudflare Pages (프론트엔드 정적 파일)
  └─ vite build → dist/
  └─ wrangler.toml [site] bucket 설정

Cloudflare Workers (API 프록시)
  └─ worker/proxy.js
  └─ 라우트: /api/*
  └─ 시크릿: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET (Pages 환경 변수 또는 wrangler secret)
```

### 배포 명령어
```bash
npm run build           # Vite 빌드
npx wrangler deploy     # Worker 배포
```

---

## API 엔드포인트

### GET /api/search?q=<query>
- 네이버 지역 검색 API 호출
- KATECH(TM128) 좌표 → WGS84 변환
- 응답 형식:
```json
{
  "items": [
    {
      "title": "버터떡집",
      "category": "음식점 > 분식",
      "address": "서울 강남구...",
      "roadAddress": "서울 강남구 테헤란로...",
      "telephone": "02-1234-5678",
      "link": "https://...",
      "lat": 37.5665,
      "lng": 126.978
    }
  ]
}
```

---

## 아키텍처 보안 설계
- API 키는 Cloudflare Worker 환경 변수(Secret)에만 존재
- 프론트엔드 번들에 API 키 포함 없음
- CORS: Origin 기반 헤더 제어

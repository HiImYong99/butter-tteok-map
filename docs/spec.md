# Butter Map Specification

## 1. Project Goal
Build a Toss Mini-App that provides a map interface for "Butter" spots.

## 2. Core Features
- Naver Local Search API integration.
- Coordinate conversion (KATECH -> WGS84).
- Webview-optimized UI.
- Ad-based location permission flow.

## 3. Tech Stack
- Frontend: Vite, React, TS, Tailwind, Zustand.
- Backend: Cloudflare Workers (Wrangler).

## 4. Ads
- Bottom Banner.
- Rewarded Ad for Location.

## 5. Webview Optimization Rules
- Overcroll-behavior: none.
- Safe Area insets handling.

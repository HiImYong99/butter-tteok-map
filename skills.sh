#!/bin/bash
# skills.sh - Environment setup and tool discovery for Butter Map

echo "🔍 Checking dependencies..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js: $(node -v)"
else
    echo "❌ Node.js is not installed."
fi

# Check Wrangler
if command -v wrangler >/dev/null 2>&1; then
    echo "✅ Wrangler: $(wrangler --version)"
else
    echo "⚠️ Wrangler not found globally. It will be used via npx."
fi

# Initialize project structure if it doesn't exist
mkdir -p docs
mkdir -p worker
mkdir -p src/store
mkdir -p src/components

echo "✅ Project directories initialized."

# Create a template spec.md if it doesn't exist
if [ ! -f docs/spec.md ]; then
    cat <<EOF > docs/spec.md
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
EOF
    echo "✅ Template docs/spec.md created."
fi

echo "🚀 Setup complete. Use 'npm run dev' to start development."

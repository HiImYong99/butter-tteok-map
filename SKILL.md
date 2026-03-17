# Project Skills & Environment

## Cloudflare Wrangler
Used for managing the Worker Proxy and deploying the frontend to Pages.
- **Run Worker (local)**: `npx wrangler dev worker/proxy.js --local` (port 8787)
- **Run Worker (remote secrets)**: `npx wrangler dev worker/proxy.js --remote`
- **Deploy**: `npx wrangler deploy worker/proxy.js`
- **Secrets**: `npx wrangler secret put NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET`

## Naver API (Coordinate Conversion)
Naver's Search API returns KATECH(TM128) coordinates. `worker/proxy.js` converts them to WGS84 via Helmert transformation.
- **Endpoint**: `GET /api/search?q=<query>`
- **Response**: `{ items: [{ title, category, address, roadAddress, telephone, link, lat, lng }] }`
- **Local test**: `curl "http://localhost:8787/api/search?q=버터떡"`

## Apps In Toss MCP
This project leverages the `apps_in_toss` MCP server for:
- Searching latest documentation.
- Accessing TDS (Toss Design System) Web components guidance.
- Checking bridge API specifications.

### How to use with Claude Code
To enable these skills in your local Claude Code CLI, run:
```bash
claude config mcp set apps_in_toss -- command npx -y @toss/apps-in-toss-mcp
```

## UI/UX Protection Rules
- **CSS**: Always use `overscroll-none` on the `#root` and `body`.
- **Viewport**: Use `h-screen w-screen overflow-hidden` for the main layout to prevent accidental scrolling of the entire webview.
- **Safe Area**: Apply `padding-bottom: env(safe-area-inset-bottom)` to bottom nav/banners.

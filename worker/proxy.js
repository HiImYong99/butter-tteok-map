/**
 * Butter Map - Cloudflare Worker Proxy
 */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5175',
  'http://localhost:8787',
  /^https:\/\/[\w-]+\.apps\.tossmini\.com$/,
  /^https:\/\/[\w-]+\.private-apps\.tossmini\.com$/,
]

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.some(o =>
    typeof o === 'string' ? o === origin : o.test(origin)
  )
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://butter-tteok.apps.tossmini.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

// 좌표 → 가장 가까운 한국 주요 도시명 (Reverse Geocoding API 없이 fallback용)
const KR_CITIES = [
  { name: '서울', lat: 37.5665, lng: 126.9780 },
  { name: '부산', lat: 35.1796, lng: 129.0756 },
  { name: '인천', lat: 37.4563, lng: 126.7052 },
  { name: '대구', lat: 35.8714, lng: 128.6014 },
  { name: '대전', lat: 36.3504, lng: 127.3845 },
  { name: '광주', lat: 35.1595, lng: 126.8526 },
  { name: '울산', lat: 35.5384, lng: 129.3114 },
  { name: '수원', lat: 37.2636, lng: 127.0286 },
  { name: '창원', lat: 35.2280, lng: 128.6811 },
  { name: '고양', lat: 37.6584, lng: 126.8320 },
  { name: '청주', lat: 36.6424, lng: 127.4890 },
  { name: '전주', lat: 35.8242, lng: 127.1480 },
  { name: '천안', lat: 36.8151, lng: 127.1139 },
  { name: '포항', lat: 36.0190, lng: 129.3435 },
  { name: '제주', lat: 33.4996, lng: 126.5312 },
  { name: '성남', lat: 37.4196, lng: 127.1269 },
  { name: '용인', lat: 37.2411, lng: 127.1776 },
  { name: '안산', lat: 37.3219, lng: 126.8309 },
  { name: '부천', lat: 37.5034, lng: 126.7660 },
  { name: '남양주', lat: 37.6360, lng: 127.2163 },
  { name: '화성', lat: 37.1994, lng: 126.8317 },
  { name: '평택', lat: 36.9921, lng: 127.1127 },
  { name: '시흥', lat: 37.3800, lng: 126.8029 },
  { name: '파주', lat: 37.7600, lng: 126.7800 },
  { name: '김해', lat: 35.2285, lng: 128.8892 },
]

function nearestCity(lat, lng) {
  let best = KR_CITIES[0], bestDist = Infinity
  for (const c of KR_CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best.name
}

const KATECH_PARAMS = {
  a: 6377397.155, f: 1 / 299.1528128, dx: -146.43, dy: 507.89, dz: 681.46,
  lon0: 128.0, lat0: 38.0, scaleFactor: 0.9999, falseEasting: 400000, falseNorthing: 600000,
}

function katechToWgs84(x, y) {
  const { a, f, lon0, lat0, scaleFactor, falseEasting, falseNorthing } = KATECH_PARAMS
  const b = a * (1 - f)
  const e2 = (a * a - b * b) / (a * a)
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))
  const lon0Rad = (lon0 * Math.PI) / 180
  const lat0Rad = (lat0 * Math.PI) / 180
  const M1 = a * (
    (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * lat0Rad
    - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * lat0Rad)
    + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * lat0Rad)
    - (35 * e2 ** 3 / 3072) * Math.sin(6 * lat0Rad)
  )
  const eX = (x - falseEasting) / scaleFactor
  const eY = (y - falseNorthing) / scaleFactor
  const M = M1 + eY
  const mu = M / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256))
  const phi1 = mu
    + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
    + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu)
    + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu)
  const N = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2)
  const T = Math.tan(phi1) ** 2
  const C = (e2 / (1 - e2)) * Math.cos(phi1) ** 2
  const R = a * (1 - e2) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5
  const D = eX / (N * scaleFactor)
  const lat = phi1
    - (N * Math.tan(phi1) / R) * (
      D ** 2 / 2
      - (5 + 3 * T + 10 * C - 4 * C ** 2 - 9 * (e2 / (1 - e2))) * D ** 4 / 24
      + (61 + 90 * T + 298 * C + 45 * T ** 2 - 252 * (e2 / (1 - e2)) - 3 * C ** 2) * D ** 6 / 720
    )
  const lon = lon0Rad
    + (
      D
      - (1 + 2 * T + C) * D ** 3 / 6
      + (5 - 2 * C + 28 * T - 3 * C ** 2 + 8 * (e2 / (1 - e2)) + 24 * T ** 2) * D ** 5 / 120
    ) / Math.cos(phi1)
  const { dx, dy, dz } = KATECH_PARAMS
  const latDeg = (lat * 180) / Math.PI
  const lonDeg = (lon * 180) / Math.PI
  const dlat = (dy * Math.cos(latDeg * Math.PI / 180) - dz * Math.sin(latDeg * Math.PI / 180)) / (a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2))
  const dlon = dx / ((a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2)) * Math.cos(lat))
  return { lat: latDeg + (dlat * 180) / Math.PI, lng: lonDeg + (dlon * 180) / Math.PI, }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    const clientId = env.NAVER_CLIENT_ID
    const clientSecret = env.NAVER_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'Naver API keys not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // GET /api/geocode?q=<location>
    if (url.pathname === '/api/geocode' && request.method === 'GET') {
      const query = url.searchParams.get('q')
      if (!query) return new Response(JSON.stringify({ error: 'Missing query parameter: q' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } })
      
      const localUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=1`
      const res = await fetch(localUrl, { headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret } })
      
      if (!res.ok) {
        return new Response(JSON.stringify({ error: '지오코딩 검색 실패' }), { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } })
      }
      
      const data = await res.json()
      if (!data.items || data.items.length === 0) {
        return new Response(JSON.stringify({ error: '지역을 찾을 수 없습니다.' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } })
      }
      
      const item = data.items[0]
      const rawX = parseInt(item.mapx, 10)
      const rawY = parseInt(item.mapy, 10)
      
      let lat, lng;
      if (rawX > 0 && rawX < 1000000) {
        const wgs = katechToWgs84(rawX, rawY);
        lat = wgs.lat; lng = wgs.lng;
      } else {
        lat = rawY / 1e7; lng = rawX / 1e7;
      }
      
      return new Response(JSON.stringify({
        lat, lng, address: item.address || item.title.replace(/<[^>]*>?/gm, ''),
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      })
    }

    // GET /api/search?q=<query>
    if (url.pathname === '/api/search' && request.method === 'GET') {
      let query = url.searchParams.get('q') || '버터떡'

      // lat/lng 있으면 NCP 역지오코딩으로 지역명 추출 → 검색어 앞에 붙이기
      const lat = url.searchParams.get('lat')
      const lng = url.searchParams.get('lng')
      if (lat && lng && !query.includes(' ')) {
        // query가 단순 "버터떡"일 때만 지역명 prefix 추가 (이미 "강남 버터떡" 처럼 지역 포함시 스킵)
        let locationName = ''

        // 1차: NCP Reverse Geocoding 시도
        try {
          const ncpId = env.NCP_CLIENT_ID
          const ncpSecret = env.NCP_CLIENT_SECRET
          if (ncpId && ncpSecret) {
            const rgUrl = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=admcode`
            const rgRes = await fetch(rgUrl, {
              headers: { 'X-NCP-APIGW-API-KEY-ID': ncpId, 'X-NCP-APIGW-API-KEY': ncpSecret },
            })
            if (rgRes.ok) {
              const rgData = await rgRes.json()
              const area = rgData.results?.[0]?.region
              locationName = area?.area2?.name || area?.area1?.name || ''
            }
          }
        } catch { /* NCP 실패 → 2차 fallback */ }

        // 2차: NCP 실패 시 좌표 기반 가장 가까운 도시 사용
        if (!locationName) locationName = nearestCity(parseFloat(lat), parseFloat(lng))

        if (locationName) query = `${locationName} ${query}`
      }

      let naverUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=25&start=1`
      let naverRes = await fetch(naverUrl, {
        headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
      })

      if (!naverRes.ok) {
        return new Response(JSON.stringify({ error: 'Naver API error' }), { status: naverRes.status, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } })
      }

      let data = await naverRes.json()

      const items = (data.items || []).map((item) => {
        const rawX = parseInt(item.mapx, 10)
        const rawY = parseInt(item.mapy, 10)
        let lat, lng;
        if (rawX > 0 && rawX < 1000000) {
          const wgs = katechToWgs84(rawX, rawY);
          lat = wgs.lat; lng = wgs.lng;
        } else {
          lat = rawY / 1e7; lng = rawX / 1e7;
        }

        return {
          title: item.title.replace(/<[^>]*>/g, ''),
          category: item.category,
          address: item.address,
          roadAddress: item.roadAddress,
          telephone: item.telephone,
          link: item.link,
          lat,
          lng,
        }
      })

      return new Response(JSON.stringify({ items }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // GET /api/reverse-geocode?lat=<lat>&lng=<lng>
    if (url.pathname === '/api/reverse-geocode' && request.method === 'GET') {
      const lat = url.searchParams.get('lat')
      const lng = url.searchParams.get('lng')
      if (!lat || !lng) {
        return new Response(JSON.stringify({ error: 'lat, lng 파라미터가 필요합니다' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        })
      }

      const ncpId = env.NCP_CLIENT_ID
      const ncpSecret = env.NCP_CLIENT_SECRET
      if (ncpId && ncpSecret) {
        try {
          const rgUrl = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=roadaddr,addr`
          const rgRes = await fetch(rgUrl, {
            headers: { 'X-NCP-APIGW-API-KEY-ID': ncpId, 'X-NCP-APIGW-API-KEY': ncpSecret },
          })
          if (rgRes.ok) {
            const rgData = await rgRes.json()
            const result = rgData.results?.[0]
            if (result) {
              const region = result.region
              const land = result.land
              const parts = [
                region?.area1?.name,
                region?.area2?.name,
                region?.area3?.name,
                land?.name,
                land?.number1 ? `${land.number1}${land.number2 ? `-${land.number2}` : ''}` : '',
              ].filter(Boolean)
              return new Response(JSON.stringify({ address: parts.join(' ') }), {
                status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
              })
            }
          }
        } catch { /* fallback */ }
      }

      return new Response(JSON.stringify({ address: '주소를 찾을 수 없습니다' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders(origin) })
  }
}

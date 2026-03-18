import { openURL } from '@apps-in-toss/web-framework'
import { useMapStore } from '../store/useMapStore'

function openLink(url: string) {
  openURL(url).catch(() => window.open(url, '_blank'))
}

export default function StoreBottomSheet() {
  const { selectedResult, setSelectedResult } = useMapStore()

  if (!selectedResult) return null

  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(selectedResult.title)}`
  const instagramUrl = selectedResult.link?.includes('instagram.com') ? selectedResult.link : null

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl"
      style={{
        boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
        {/* 드래그 핸들 + 닫기 */}
        <div className="flex items-center justify-center pt-3 pb-1 relative">
          <div className="w-10 h-1 bg-toss-border rounded-full" />
          <button
            onClick={() => setSelectedResult(null)}
            className="absolute right-4 top-2 p-1 text-toss-text-sub active:opacity-60"
            aria-label="닫기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 썸네일 + 매장 정보 헤더 */}
        <div className="flex items-center gap-4 px-5 pt-3 pb-4">
          {/* 썸네일 */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-none bg-amber-50 flex items-center justify-center border border-toss-border">
            <img src="/butter.png" className="w-10 h-10 object-contain" alt="" />
          </div>

          {/* 이름 + 카테고리 */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-toss-text leading-tight truncate">
              {selectedResult.title}
            </h2>
            <span className="inline-block mt-1 text-[11px] font-medium text-toss-text-sub bg-toss-bg rounded-full px-2.5 py-0.5">
              {selectedResult.category}
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-toss-border mx-5" />

        {/* 상세 정보 */}
        <div className="px-5 py-4 space-y-3">
          {/* 주소 */}
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-toss-text-sub flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-sm text-toss-text leading-relaxed">
              {selectedResult.roadAddress || selectedResult.address}
            </span>
          </div>

          {/* 전화번호 */}
          {selectedResult.telephone && (
            <a
              href={`tel:${selectedResult.telephone}`}
              className="flex items-center gap-3 active:opacity-60"
            >
              <svg className="w-4 h-4 text-toss-text-sub flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="text-sm text-toss-blue font-medium">{selectedResult.telephone}</span>
            </a>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="px-5 pb-5 flex gap-2">
          {/* 네이버 지도에서 열기 */}
          <button
            onClick={() => openLink(naverMapUrl)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white active:opacity-80 transition-opacity"
            style={{ background: '#03C75A' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="white" stroke="none"/>
              <circle cx="12" cy="10" r="3" fill="#03C75A" stroke="none"/>
            </svg>
            네이버 지도
          </button>

          {/* 인스타그램 링크 (있을 때만) */}
          {instagramUrl && (
            <button
              onClick={() => openLink(instagramUrl!)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 border-toss-border text-toss-text active:opacity-70 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              인스타그램
            </button>
          )}
        </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { TossAds } from '@apps-in-toss/web-framework'
import { isAitSupported } from '../utils/aitSupport'

const BANNER_AD_GROUP_ID = 'toss_banner'

export default function AdBanner({ isInitialized }: { isInitialized: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasFill, setHasFill] = useState(true)

  useEffect(() => {
    if (!isInitialized || !containerRef.current) return
    if (!isAitSupported(TossAds.attachBanner)) {
      setHasFill(false)
      return
    }

    const attached = TossAds.attachBanner(BANNER_AD_GROUP_ID, containerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: {
        onNoFill: () => setHasFill(false),
        onAdRendered: () => setHasFill(true),
        onAdFailedToRender: () => setHasFill(false),
      },
    })

    return () => { attached?.destroy() }
  }, [isInitialized])

  if (!hasFill) return null

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '96px' }}
      aria-label="광고 영역"
    />
  )
}

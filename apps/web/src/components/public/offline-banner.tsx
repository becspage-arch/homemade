'use client'

import { useEffect, useState } from 'react'

/**
 * Small sage banner that slides in across the top of every public page when
 * the browser reports offline. Disappears when connectivity returns. Doesn't
 * try to be clever about flaky connections — just trusts navigator.onLine.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <span className="offline-banner-dot" aria-hidden />
      You&apos;re offline. Saved recipes still work.
    </div>
  )
}

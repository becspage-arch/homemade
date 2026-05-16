'use client'

import { useEffect } from 'react'

/**
 * Mounts once in the public layout. Registers /sw.js and exposes a global
 * helper window.homemadePrecache(urls) the bookmark-action client can call.
 *
 * The SW is opt-out: setting ?nosw=1 (development convenience) or a
 * NEXT_PUBLIC_DISABLE_SW env var skips registration.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NEXT_PUBLIC_DISABLE_SW === '1') return
    if (new URLSearchParams(window.location.search).get('nosw') === '1') return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Expose a tiny precache + evict helper for the bookmark action.
        const send = (msg: object) => {
          const target = reg.active || reg.waiting || reg.installing
          target?.postMessage(msg)
        }
        ;(window as Window & {
          homemadePrecache?: (urls: string[]) => void
          homemadeEvict?: (urls: string[]) => void
        }).homemadePrecache = (urls) => send({ type: 'precache', urls })
        ;(window as Window & {
          homemadePrecache?: (urls: string[]) => void
          homemadeEvict?: (urls: string[]) => void
        }).homemadeEvict = (urls) => send({ type: 'evict', urls })
      })
      .catch(() => {
        /* Service worker registration failure is non-fatal — log only. */
      })
  }, [])

  return null
}

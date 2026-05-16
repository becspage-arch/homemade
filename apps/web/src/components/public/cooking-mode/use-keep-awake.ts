'use client'

import { useEffect } from 'react'

/**
 * Keep the device screen awake while a recipe is on screen. Inside Capacitor
 * this hits the native @capacitor-community/keep-awake plugin. On the open web it falls
 * back to the standard WakeLock API; if neither is available it no-ops (the
 * worst case is the user's phone dims after a minute — annoying, not broken).
 */
export function useKeepAwake(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let wakeLock: WakeLockSentinel | null = null
    let nativeActive = false

    async function engage() {
      // Try the native plugin first (Capacitor).
      const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
      if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
        try {
          const mod = await import(/* webpackIgnore: true */ '@capacitor-community/keep-awake')
          if (cancelled) return
          await mod.KeepAwake.keepAwake()
          nativeActive = true
          return
        } catch {
          // fall through to web wake lock
        }
      }
      // Web fallback.
      try {
        const navAny = navigator as Navigator & {
          wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinel> }
        }
        if (navAny.wakeLock?.request) {
          wakeLock = await navAny.wakeLock.request('screen')
        }
      } catch {
        /* ignore — no wake lock available */
      }
    }

    engage()

    return () => {
      cancelled = true
      if (wakeLock) {
        wakeLock.release().catch(() => undefined)
        wakeLock = null
      }
      if (nativeActive) {
        import(/* webpackIgnore: true */ '@capacitor-community/keep-awake')
          .then((mod) => mod.KeepAwake.allowSleep())
          .catch(() => undefined)
      }
    }
  }, [enabled])
}

interface WakeLockSentinel {
  release(): Promise<void>
}

'use client'

import { useEffect } from 'react'
import { CONSENT_CHANGE_EVENT, hasAnalyticsConsent } from '@/lib/consent'
import { GA_MEASUREMENT_ID } from '@/lib/ga'

/**
 * Keeps Google Analytics 4 in step with the cookie banner via Consent Mode v2.
 *
 * The default-denied bootstrap + the gtag.js library are rendered in <head>
 * by the root layout (see `lib/ga.ts` + `app/layout.tsx`) so the deny is
 * guaranteed to run before the library and before hydration. This component
 * does the reactive half: on mount it reconciles GA with whatever consent is
 * already stored (returning visitor who accepted before), and it pushes a
 * `consent update` whenever the banner choice changes — no reload needed.
 *
 * We have no ads, so only `analytics_storage` is ever flipped; ad_* stay
 * denied. Add a marketing category and flip those here if ads ever land.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const apply = () => {
      const granted = hasAnalyticsConsent()
      window.gtag?.('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
      })
    }

    apply()
    window.addEventListener(CONSENT_CHANGE_EVENT, apply)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, apply)
  }, [])

  return null
}

type GtagArgs =
  | [command: 'consent', action: 'default' | 'update', params: Record<string, unknown>]
  | [command: 'js', date: Date]
  | [command: 'config', targetId: string, params?: Record<string, unknown>]

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: GtagArgs) => void
  }
}

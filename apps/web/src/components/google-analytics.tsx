'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { CONSENT_CHANGE_EVENT, hasAnalyticsConsent } from '@/lib/consent'

/**
 * Native Google Analytics 4 install, wired to Google Consent Mode v2.
 *
 * No tag manager, no paid SDK — just gtag.js loaded directly.
 *
 * Consent Mode v2: every storage signal DEFAULTS TO DENIED before the
 * library loads, so GA4 only ever sends cookieless, modelled "pings" until
 * the visitor grants analytics consent in the cookie banner. The moment
 * consent flips we push a `consent update` and GA4 starts full measurement;
 * if it flips back we deny again — no page reload required.
 *
 * We have no advertising or remarketing, so the ad_* signals stay denied
 * permanently. If marketing/ads are ever added, give them their own banner
 * category and flip ad_storage / ad_user_data / ad_personalization here.
 */

const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??
  (process.env.NODE_ENV === 'production' ? 'G-XSRLKQR9JQ' : undefined)

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

export function GoogleAnalytics() {
  // Reconcile with whatever consent is already stored (returning visitor who
  // accepted previously) and keep GA in step with later banner changes. The
  // `consent default` in the inline script below has already run by the time
  // this effect fires, so an update here is correct ordering.
  useEffect(() => {
    if (!GA_ID) return

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

  if (!GA_ID) return null

  return (
    <>
      <Script
        id="ga-consent-mode"
        strategy="afterInteractive"
        // The default-denied consent state MUST be queued before `config`.
        // dataLayer is an ordered queue, so defining it here — ahead of the
        // async library script — guarantees the deny lands first.
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'granted',
              security_storage: 'granted',
              wait_for_update: 500
            });
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
          `,
        }}
      />
      <Script
        id="ga-gtag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
    </>
  )
}

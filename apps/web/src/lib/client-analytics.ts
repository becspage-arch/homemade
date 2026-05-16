'use client'

import posthog from 'posthog-js'
import { hasAnalyticsConsent } from './consent'
import { readStoredAcquisition } from './acquisition'

/**
 * Thin wrapper that:
 *  - is a no-op if PostHog hasn't initialised (e.g. dev with no key)
 *  - is a no-op if analytics consent hasn't been granted, EXCEPT for the
 *    `consent_*` events themselves which are necessary instrumentation of
 *    the legal flow and always allowed
 *  - automatically attaches `acquisitionChannel` if we have it on this
 *    device, so events made before the user signs up still carry it
 *  - dual-fires every successful capture to `/api/analytics/capture` so
 *    the event lands in our own `AnalyticsEvent` table for the admin
 *    dashboards under `/admin/analytics`. PostHog stays as the secondary
 *    sink for session recordings / heatmaps / ad-hoc event exploration.
 *
 * Use this from any client component that wants to fire an analytics event.
 * Server-side firing uses `lib/server-analytics.ts` (`captureEvent`) which
 * dual-fires the same way.
 */

const CONSENT_EXEMPT = new Set([
  'consent_banner_shown',
  'consent_accepted_all',
  'consent_necessary_only',
  'consent_customized',
  'consent_preferences_changed',
])

function dualFire(event: string, properties: Record<string, unknown>): void {
  // Best-effort beacon to our own ingest. Fire-and-forget — never block the
  // caller, never surface failures to the user.
  try {
    const body = JSON.stringify({
      event,
      properties,
      url: typeof window !== 'undefined' ? window.location.href : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    })
    // sendBeacon is the right tool — it survives `pagehide`, doesn't block
    // navigation, and won't keep the page alive longer than needed.
    const ok = typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function'
      ? navigator.sendBeacon('/api/analytics/capture', new Blob([body], { type: 'application/json' }))
      : false
    if (!ok) {
      void fetch('/api/analytics/capture', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // swallow — analytics never throws
      })
    }
  } catch {
    // swallow
  }
}

export function captureClientEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return
  if (!CONSENT_EXEMPT.has(event) && !hasAnalyticsConsent()) return
  const acquisition = readStoredAcquisition()
  const enriched = {
    ...properties,
    ...(acquisition?.acquisitionChannel
      ? { acquisitionChannel: acquisition.acquisitionChannel }
      : null),
  }
  try {
    posthog.capture(event, enriched)
  } catch {
    // analytics must never throw
  }
  dualFire(event, enriched)
}

'use client'

import posthog from 'posthog-js'
import { hasAnalyticsConsent } from './consent'
import { readStoredAcquisition } from './acquisition'

/**
 * Thin wrapper over `posthog.capture` that:
 *  - is a no-op if PostHog hasn't initialised (e.g. dev with no key)
 *  - is a no-op if analytics consent hasn't been granted, EXCEPT for the
 *    `consent_*` events themselves which are necessary instrumentation of
 *    the legal flow and always allowed
 *  - automatically attaches `acquisitionChannel` if we have it on this
 *    device, so events made before the user signs up still carry it
 *
 * Use this from any client component that wants to fire a PostHog event.
 * Server-side firing uses `lib/posthog.ts` and never gates on consent
 * (the server can't see localStorage — gating happens at the
 * `posthog-provider` level by virtue of `opt_in_capturing()` not having
 * been called).
 */

const CONSENT_EXEMPT = new Set([
  'consent_banner_shown',
  'consent_accepted_all',
  'consent_necessary_only',
  'consent_customized',
  'consent_preferences_changed',
])

export function captureClientEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return
  if (!CONSENT_EXEMPT.has(event) && !hasAnalyticsConsent()) return
  try {
    const acquisition = readStoredAcquisition()
    posthog.capture(event, {
      ...properties,
      ...(acquisition?.acquisitionChannel
        ? { acquisitionChannel: acquisition.acquisitionChannel }
        : null),
    })
  } catch {
    // analytics must never throw
  }
}

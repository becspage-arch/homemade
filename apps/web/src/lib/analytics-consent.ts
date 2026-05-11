/**
 * Consent-gated wrappers around PostHog + Sentry.
 *
 * The services-activation session may or may not have initialised PostHog
 * and Sentry. Either way, these helpers no-op gracefully when the SDK is
 * not present. They are the single point all banner-driven opt-in /
 * opt-out flows go through.
 *
 * PostHog: the SDK supports `opt_out_capturing()` / `opt_in_capturing()`.
 * We always call opt-out at startup; the banner flips it to opt-in only
 * after the user accepts analytics.
 *
 * Sentry: less amenable to runtime opt-out, so we use the `beforeSend`
 * hook to drop events when consent is missing. Services-activation's init
 * file imports `shouldSendSentryEvent` and wires it into `beforeSend`.
 */

import {
  CONSENT_CHANGE_EVENT,
  getConsent,
  hasAnalyticsConsent,
  hasErrorMonitoringConsent,
  type ConsentPreferences,
} from './consent'

interface PostHogLike {
  opt_in_capturing?: () => void
  opt_out_capturing?: () => void
  has_opted_out_capturing?: () => boolean
}

interface PostHogContainer {
  posthog?: PostHogLike
}

function getPostHog(): PostHogLike | null {
  if (typeof window === 'undefined') return null
  const container = window as unknown as PostHogContainer
  return container.posthog ?? null
}

/**
 * Apply the current consent state to PostHog. Safe to call on every page
 * load and whenever consent changes.
 */
export function applyAnalyticsConsent(): void {
  const ph = getPostHog()
  if (!ph) return
  if (hasAnalyticsConsent()) {
    ph.opt_in_capturing?.()
  } else {
    ph.opt_out_capturing?.()
  }
}

/**
 * Wire a one-shot listener so that consent changes propagate to PostHog
 * without a page reload. The services-activation PostHog init should call
 * this once it has loaded the SDK, OR you can call it from the banner —
 * it's idempotent.
 */
export function installAnalyticsConsentListener(): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => applyAnalyticsConsent()
  window.addEventListener(CONSENT_CHANGE_EVENT, handler)
  // Apply immediately for current state.
  applyAnalyticsConsent()
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler)
}

/**
 * Sentry `beforeSend` predicate. Returns the event when consent has been
 * granted, or null to drop the event.
 *
 * Services-activation's Sentry init should wire this in:
 *
 *   Sentry.init({
 *     ...
 *     beforeSend: (event) => shouldSendSentryEvent() ? event : null,
 *   })
 */
export function shouldSendSentryEvent(): boolean {
  // On the server we always send — Sentry on the server fires for server
  // errors which are not tied to a single user's consent.
  if (typeof window === 'undefined') return true
  return hasErrorMonitoringConsent()
}

/** Convenience for the banner / data-rights surfaces. */
export function readCurrentConsent(): ConsentPreferences | null {
  return getConsent()
}

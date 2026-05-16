import 'server-only'
import {
  captureServerEvent,
  capturePremiumServerEvent,
  flushPostHog,
  type PosthogEvent,
} from './posthog'

/**
 * Re-exports for code that wants to be explicit about analytics intent.
 *
 * - `captureEvent` — dual-fires to AnalyticsEvent + PostHog. Same shape
 *   as `captureServerEvent`; preferred for new code.
 * - `capturePremiumEvent` — premium-feature only; writes to AnalyticsEvent,
 *   skips PostHog.
 *
 * Existing `captureServerEvent` call sites continue to dual-fire as of
 * `phase_analytics_self_hosted_001`; no migration required.
 */

export interface CaptureEventArgs {
  event: PosthogEvent
  /** Clerk id when known. Falls back to anonymous session-scoped id. */
  distinctId: string
  properties?: Record<string, unknown>
}

export async function captureEvent(args: CaptureEventArgs): Promise<void> {
  await captureServerEvent(args)
}

export async function capturePremiumEvent(args: CaptureEventArgs): Promise<void> {
  await capturePremiumServerEvent(args)
}

export { flushPostHog }
export type { PosthogEvent }
export { categoryFor, ROLLUP_TOTAL_DIMENSION } from './analytics-events'

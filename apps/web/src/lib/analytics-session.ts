import 'server-only'
import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { CONSENT_COOKIE_NAME, CURRENT_CONSENT_VERSION } from './consent'

/**
 * Analytics session id — separate from Clerk's auth session and from
 * PostHog's distinct id. Tracks a coherent browsing session so funnel +
 * drop-off views can stitch events together regardless of whether the
 * user is signed in.
 *
 * Sliding 30-minute expiry on every event. Persists across visits within
 * the window. New id once the window lapses.
 *
 * PECR: the persistent session cookie is a non-essential analytics
 * identifier, so it is only ever stored once the visitor has granted
 * analytics consent. Without consent we return an ephemeral, non-persisted
 * id (`eph:…`) so the request still has a value to work with but nothing is
 * written to the visitor's device and no one is tracked across requests.
 */

type CookieStore = Awaited<ReturnType<typeof cookies>>

const COOKIE_NAME = 'homemade-session'
const COOKIE_MAX_AGE_SECONDS = 30 * 60 // 30 min sliding

/**
 * Read the consent cookie (written by the cookie banner) and report whether
 * analytics consent is currently granted for this device. Defaults to false
 * for anything missing, malformed, or from an older policy version.
 */
function hasAnalyticsConsent(store: CookieStore): boolean {
  const raw = store.get(CONSENT_COOKIE_NAME)?.value
  if (!raw) return false
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as {
      analytics?: unknown
      version?: unknown
    }
    return parsed.analytics === true && parsed.version === CURRENT_CONSENT_VERSION
  } catch {
    return false
  }
}

/**
 * Read (or create) the analytics session id from the request cookie. Server
 * components / API routes / server actions can call this freely — the
 * `next/headers` cookie writes are recorded against the current response.
 *
 * Returns the id string. Each call refreshes the cookie's expiry so an
 * actively-browsing user keeps the same id.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const store = await cookies()

  // No analytics consent → never store a persistent identifier on the device.
  // Hand back a fresh ephemeral id (not written anywhere) so the event still
  // records, but cookieless and un-stitchable across requests.
  if (!hasAnalyticsConsent(store)) {
    return `eph:${randomBytes(8).toString('hex')}`
  }

  const existing = store.get(COOKIE_NAME)?.value
  if (existing) {
    // Refresh the sliding window. Cookie write is a no-op in pure read
    // contexts (RSC outside a server action / route handler) — Next 16's
    // cookies() will just ignore the write rather than throw.
    try {
      store.set(COOKIE_NAME, existing, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE_SECONDS,
      })
    } catch {
      // Read-only context — fine, the existing cookie is still valid.
    }
    return existing
  }

  const fresh = randomBytes(16).toString('hex')
  try {
    store.set(COOKIE_NAME, fresh, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })
  } catch {
    // Read-only context. Return the fresh id anyway — the next mutation
    // call will persist it.
  }
  return fresh
}

/**
 * Cookie name + max age exposed for the capture API route and tests.
 */
export const ANALYTICS_SESSION_COOKIE = COOKIE_NAME
export const ANALYTICS_SESSION_MAX_AGE = COOKIE_MAX_AGE_SECONDS

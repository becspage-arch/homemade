import 'server-only'
import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'

/**
 * Analytics session id — separate from Clerk's auth session and from
 * PostHog's distinct id. Tracks a coherent browsing session so funnel +
 * drop-off views can stitch events together regardless of whether the
 * user is signed in.
 *
 * Sliding 30-minute expiry on every event. Persists across visits within
 * the window. New id once the window lapses.
 */

const COOKIE_NAME = 'homemade-session'
const COOKIE_MAX_AGE_SECONDS = 30 * 60 // 30 min sliding

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

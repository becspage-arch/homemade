/**
 * Cookie consent — shared between the banner, the analytics wrappers, and
 * the signed-in user persistence path.
 *
 * Storage:
 *  - localStorage key `homemade-consent` for signed-out users (or while the
 *    user hasn't been persisted yet)
 *  - When signed in, the same JSON is also pushed to `User.cookieConsent`
 *    via a server action so it survives across devices
 *
 * Version bumps:
 *  - Bump `CURRENT_CONSENT_VERSION` whenever a legal policy change shifts
 *    what consent covers. The banner will re-show on next page load for
 *    every user whose stored consent has an older version.
 */

// Bumped 2026-06-24: Google Analytics 4 added as an analytics processor
// (wired to Google Consent Mode v2, default-denied). Adding a new third-party
// analytics processor is a material change, so every existing visitor is
// re-prompted to make a fresh, informed choice.
export const CURRENT_CONSENT_VERSION = '2026-06-24'

export const CONSENT_STORAGE_KEY = 'homemade-consent'
/**
 * Mirror of the consent decision written as a real cookie (not httpOnly) so
 * server code can read it on the request. localStorage is the device source
 * of truth for the client; this cookie is what lets the server gate the
 * first-party analytics session identifier (PECR) without a round-trip.
 */
export const CONSENT_COOKIE_NAME = 'homemade-consent'
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 12 months — matches the cookie policy
/** Fired on the window when consent changes (banner -> wrappers). */
export const CONSENT_CHANGE_EVENT = 'homemade-consent-changed'

export interface ConsentPreferences {
  analytics: boolean
  errorMonitoring: boolean
  version: string
  decidedAt: string // ISO timestamp
}

export const DEFAULT_DENY: ConsentPreferences = {
  analytics: false,
  errorMonitoring: false,
  version: CURRENT_CONSENT_VERSION,
  decidedAt: '',
}

function isValid(value: unknown): value is ConsentPreferences {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.analytics === 'boolean' &&
    typeof v.errorMonitoring === 'boolean' &&
    typeof v.version === 'string' &&
    typeof v.decidedAt === 'string'
  )
}

/**
 * Read consent from localStorage. Returns null if the banner hasn't been
 * answered yet, or if the stored version is older than the current policy
 * version (in which case the caller should re-ask).
 */
export function getConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    // localStorage can throw outright when site data is blocked.
    raw = null
  }
  const fromLocal = parseConsent(raw)
  if (fromLocal) return fromLocal
  // Fall back to the cookie mirror. Without this, a browser that refuses
  // localStorage (private mode, blocked site data) loses the decision on
  // every navigation and the banner comes back on each page load.
  const fromCookie = parseConsent(readConsentCookie())
  if (fromCookie) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fromCookie))
    } catch {
      // Still fine — the cookie is doing the remembering.
    }
    return fromCookie
  }
  return null
}

/** Shared parse + version check for both stores. */
function parseConsent(raw: string | null): ConsentPreferences | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isValid(parsed)) return null
    if (parsed.version !== CURRENT_CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

/** Read the consent cookie mirror written by `writeConsentCookie`. */
function readConsentCookie(): string | null {
  if (typeof document === 'undefined') return null
  const prefix = `${CONSENT_COOKIE_NAME}=`
  for (const part of document.cookie.split(';')) {
    const entry = part.trim()
    if (!entry.startsWith(prefix)) continue
    try {
      return decodeURIComponent(entry.slice(prefix.length))
    } catch {
      return null
    }
  }
  return null
}

/**
 * Server-side read of the same cookie, so a page can decide before first
 * paint whether the banner needs to render at all. Takes the raw cookie
 * value from `cookies()` rather than importing anything Next-specific, so
 * this module stays usable from the client too.
 */
export function parseConsentCookieValue(value: string | undefined | null): ConsentPreferences | null {
  if (!value) return null
  try {
    return parseConsent(decodeURIComponent(value))
  } catch {
    return null
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true
}

export function hasErrorMonitoringConsent(): boolean {
  return getConsent()?.errorMonitoring === true
}

/**
 * Persist consent to localStorage and dispatch a window event so any open
 * analytics-consent wrappers can react. The signed-in persistence path is
 * separate (server action that writes to User.cookieConsent) and is fired
 * by the banner component, not from this helper, so the helper can stay
 * usable from anywhere on the client without importing server actions.
 */
export function setConsent(prefs: Omit<ConsentPreferences, 'version' | 'decidedAt'>): ConsentPreferences {
  const next: ConsentPreferences = {
    ...prefs,
    version: CURRENT_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  }
  if (typeof window === 'undefined') return next
  // The cookie goes first and gets its own try/catch. It used to sit behind
  // the localStorage write inside one try, so a browser that refused
  // localStorage never got the cookie either and the banner reappeared on
  // every page load.
  try {
    writeConsentCookie(next)
  } catch {
    // ignore
  }
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage may be unavailable in private mode; we still return the
    // intended state so the in-memory wrappers can opt in for the session.
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: next }))
  } catch {
    // ignore
  }
  return next
}

/**
 * Write the consent decision to a readable cookie so the server can gate the
 * first-party analytics session cookie. The cookie itself is "necessary"
 * (it records your choice), so it is always allowed.
 */
function writeConsentCookie(prefs: ConsentPreferences): void {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(JSON.stringify(prefs))
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Max-Age=${CONSENT_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`
}

function clearConsentCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`
}

/**
 * Clear the stored consent and force the banner to re-show on next visit.
 * Used by the data-rights centre's "manage cookie preferences" action.
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') return
  try {
    clearConsentCookie()
  } catch {
    // ignore
  }
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: null }))
  } catch {
    // ignore
  }
}

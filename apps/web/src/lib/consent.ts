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

export const CURRENT_CONSENT_VERSION = '2026-05-11'

export const CONSENT_STORAGE_KEY = 'homemade-consent'
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
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isValid(parsed)) return null
    if (parsed.version !== CURRENT_CONSENT_VERSION) return null
    return parsed
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
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: next }))
  } catch {
    // localStorage may be unavailable in private mode; we still return the
    // intended state so the in-memory wrappers can opt in for the session.
  }
  return next
}

/**
 * Clear the stored consent and force the banner to re-show on next visit.
 * Used by the data-rights centre's "manage cookie preferences" action.
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: null }))
  } catch {
    // ignore
  }
}

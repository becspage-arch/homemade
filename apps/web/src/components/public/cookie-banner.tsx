'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CONSENT_CHANGE_EVENT,
  CURRENT_CONSENT_VERSION,
  clearConsent,
  getConsent,
  setConsent,
  type ConsentPreferences,
} from '@/lib/consent'
import { persistConsent } from '@/lib/consent-actions'
import { installAnalyticsConsentListener } from '@/lib/analytics-consent'

import './cookie-banner.css'

const REOPEN_EVENT = 'homemade-open-cookie-banner'

type View = 'compact' | 'customise'

export function CookieBanner() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('compact')
  const [analytics, setAnalytics] = useState(true)
  const [errorMonitoring, setErrorMonitoring] = useState(true)
  const [saving, setSaving] = useState(false)

  // Decide on mount whether the banner should be open.
  useEffect(() => {
    const stored = getConsent()
    if (!stored) {
      setOpen(true)
      setView('compact')
    } else {
      setAnalytics(stored.analytics)
      setErrorMonitoring(stored.errorMonitoring)
    }
    const removeListener = installAnalyticsConsentListener()
    return removeListener
  }, [])

  // Listen for a "reopen" event so footer links can pop the banner.
  useEffect(() => {
    const onReopen = () => {
      const current = getConsent()
      if (current) {
        setAnalytics(current.analytics)
        setErrorMonitoring(current.errorMonitoring)
      }
      setView('customise')
      setOpen(true)
    }
    window.addEventListener(REOPEN_EVENT, onReopen)
    return () => window.removeEventListener(REOPEN_EVENT, onReopen)
  }, [])

  // If consent gets cleared elsewhere (data-rights centre), reopen.
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences | null>).detail
      if (detail === null) {
        setView('compact')
        setOpen(true)
      }
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange)
  }, [])

  const commit = useCallback(
    async (prefs: { analytics: boolean; errorMonitoring: boolean }) => {
      setSaving(true)
      const next = setConsent(prefs)
      try {
        // Sync to the user row when signed in. Failures don't block dismissal.
        await persistConsent(next)
      } finally {
        setSaving(false)
        setOpen(false)
      }
    },
    [],
  )

  if (!open) return null

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
    >
      <div className="cookie-banner-inner">
        {view === 'compact' ? (
          <>
            <h2 className="cookie-banner-title" id="cookie-banner-title">
              About cookies
            </h2>
            <p className="cookie-banner-body">
              Homemade uses cookies to keep you signed in and (with your
              permission) to measure how the site is used and to spot
              errors. Read the{' '}
              <Link href="/legal/cookies">Cookie Policy</Link> for the full
              list, or choose below.
            </p>
            <div className="cookie-banner-actions">
              <button
                type="button"
                className="cookie-banner-button primary"
                disabled={saving}
                onClick={() => commit({ analytics: true, errorMonitoring: true })}
              >
                Accept all
              </button>
              <button
                type="button"
                className="cookie-banner-button primary"
                disabled={saving}
                onClick={() => commit({ analytics: false, errorMonitoring: false })}
              >
                Necessary only
              </button>
              <button
                type="button"
                className="cookie-banner-button secondary"
                disabled={saving}
                onClick={() => setView('customise')}
              >
                Customise
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="cookie-banner-title" id="cookie-banner-title">
              Cookie preferences
            </h2>
            <p className="cookie-banner-body">
              You can switch categories on or off below. Necessary cookies
              keep the site working and can't be turned off.
            </p>
            <ul className="cookie-banner-categories">
              <li>
                <label className="cookie-banner-category">
                  <input type="checkbox" checked disabled aria-disabled="true" />
                  <span>
                    <strong>Necessary</strong>
                    <span className="cookie-banner-category-hint">
                      Sign-in session, splash gate, your cookie choice.
                    </span>
                  </span>
                </label>
              </li>
              <li>
                <label className="cookie-banner-category">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <span>
                    <strong>Analytics</strong>
                    <span className="cookie-banner-category-hint">
                      PostHog product analytics, pseudonymous.
                    </span>
                  </span>
                </label>
              </li>
              <li>
                <label className="cookie-banner-category">
                  <input
                    type="checkbox"
                    checked={errorMonitoring}
                    onChange={(e) => setErrorMonitoring(e.target.checked)}
                  />
                  <span>
                    <strong>Error monitoring</strong>
                    <span className="cookie-banner-category-hint">
                      Sentry crash reports so we can fix what breaks.
                    </span>
                  </span>
                </label>
              </li>
            </ul>
            <div className="cookie-banner-actions">
              <button
                type="button"
                className="cookie-banner-button primary"
                disabled={saving}
                onClick={() => commit({ analytics, errorMonitoring })}
              >
                Save preferences
              </button>
              <button
                type="button"
                className="cookie-banner-button secondary"
                disabled={saving}
                onClick={() => commit({ analytics: false, errorMonitoring: false })}
              >
                Necessary only
              </button>
            </div>
            <p className="cookie-banner-version">
              Policy version: {CURRENT_CONSENT_VERSION}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Footer-button friendly trigger — call this from a client component to
 * reopen the banner (or clear consent first if you want a fresh choice).
 */
export function reopenCookieBanner({ reset = false } = {}): void {
  if (typeof window === 'undefined') return
  if (reset) clearConsent()
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT))
}

/** Client-only button so footer / data-rights can reopen the banner. */
export function CookiePreferencesButton({
  className = 'site-footer-link',
  label = 'Cookie preferences',
}: {
  className?: string
  label?: string
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => reopenCookieBanner()}
    >
      {label}
    </button>
  )
}

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
import { captureClientEvent } from '@/lib/client-analytics'

import './cookie-banner.css'

const REOPEN_EVENT = 'homemade-open-cookie-banner'

type View = 'compact' | 'customise'

interface CookieBannerProps {
  /**
   * Server-read consent cookie: true when this request already carries a
   * decision at the current policy version. The banner then never enters
   * the tree, so an accepted banner cannot flash on the first paint of a
   * fresh page load.
   */
  alreadyDecided?: boolean
}

export function CookieBanner({ alreadyDecided = false }: CookieBannerProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('compact')
  // GDPR/PECR: non-essential categories must default OFF. First-time visitors
  // who open "Customise" see them unticked; returning visitors get their
  // stored choice synced in on mount (below).
  const [analytics, setAnalytics] = useState(false)
  const [errorMonitoring, setErrorMonitoring] = useState(false)
  const [saving, setSaving] = useState(false)

  // Decide on mount whether the banner should be open. The initial render
  // is SSR with no access to localStorage, so we sync the stored consent
  // (an external store) into React state here. Setting state in this effect
  // is the documented external-system-sync pattern.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = getConsent()
    if (stored) {
      setAnalytics(stored.analytics)
      setErrorMonitoring(stored.errorMonitoring)
    } else if (!alreadyDecided) {
      setOpen(true)
      setView('compact')
      captureClientEvent('consent_banner_shown', { reason: 'first_visit' })
    }
    const removeListener = installAnalyticsConsentListener()
    return removeListener
  }, [alreadyDecided])
  /* eslint-enable react-hooks/set-state-in-effect */

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
      captureClientEvent('consent_banner_shown', { reason: 'reopen' })
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
        captureClientEvent('consent_banner_shown', { reason: 'version_bump' })
      }
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange)
  }, [])

  const commit = useCallback(
    async (
      prefs: { analytics: boolean; errorMonitoring: boolean },
      decision: 'accept_all' | 'necessary_only' | 'customized',
    ) => {
      setSaving(true)
      const before = getConsent()
      const next = setConsent(prefs)

      // Banner events are necessary instrumentation of the legal flow — fire
      // before opt-in/opt-out so the decision itself is captured even when
      // the user opts out.
      if (decision === 'accept_all') {
        captureClientEvent('consent_accepted_all', {})
      } else if (decision === 'necessary_only') {
        captureClientEvent('consent_necessary_only', {})
      } else {
        captureClientEvent('consent_customized', {
          analytics: prefs.analytics,
          errorMonitoring: prefs.errorMonitoring,
        })
      }
      if (before) {
        captureClientEvent('consent_preferences_changed', {
          analyticsBefore: before.analytics,
          analyticsAfter: prefs.analytics,
          errorMonitoringBefore: before.errorMonitoring,
          errorMonitoringAfter: prefs.errorMonitoring,
        })
      }

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

  if (view === 'compact') {
    return (
      <div className="cookie-banner" role="dialog" aria-modal="false" aria-label="Cookies">
        <div className="cookie-banner-bar">
          <p className="cookie-banner-line">
            We use cookies to keep the site running and, with your permission,
            to improve it.
          </p>
          <div className="cookie-banner-bar-actions">
            <button
              type="button"
              className="cookie-banner-button primary"
              disabled={saving}
              onClick={() => commit({ analytics: true, errorMonitoring: true }, 'accept_all')}
            >
              Accept
            </button>
            <button
              type="button"
              className="cookie-banner-button secondary"
              disabled={saving}
              onClick={() => commit({ analytics: false, errorMonitoring: false }, 'necessary_only')}
            >
              Reject
            </button>
            <button
              type="button"
              className="cookie-banner-choices"
              disabled={saving}
              onClick={() => setView('customise')}
            >
              Choices
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
    >
      <div className="cookie-banner-inner">
            <h2 className="cookie-banner-title" id="cookie-banner-title">
              Cookie preferences
            </h2>
            <p className="cookie-banner-body">
              You can switch categories on or off below. Necessary cookies
              keep the site working and can&apos;t be turned off. The{' '}
              <Link href="/legal/cookies">Cookie Policy</Link> has the full
              list.
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
                      How the site gets used, so we can make it better.
                      PostHog and Google Analytics, both pseudonymous.
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
                onClick={() => commit({ analytics, errorMonitoring }, 'customized')}
              >
                Save preferences
              </button>
              <button
                type="button"
                className="cookie-banner-button secondary"
                disabled={saving}
                onClick={() => commit({ analytics: false, errorMonitoring: false }, 'necessary_only')}
              >
                Necessary only
              </button>
            </div>
            <p className="cookie-banner-version">
              Policy version: {CURRENT_CONSENT_VERSION}
            </p>
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

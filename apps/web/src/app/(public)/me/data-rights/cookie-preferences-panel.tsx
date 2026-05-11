'use client'

import { reopenCookieBanner } from '@/components/public/cookie-banner'

export function CookiePreferencesPanel() {
  return (
    <section>
      <span className="me-section-label">Section 3</span>
      <h2 className="me-section-title">Manage cookie preferences</h2>
      <p className="me-section-description">
        Re-opens the cookie banner so you can change your choices. Necessary
        cookies stay on; you can switch analytics and error monitoring on
        or off.
      </p>
      <button
        type="button"
        className="me-button secondary"
        onClick={() => reopenCookieBanner()}
      >
        Open cookie preferences
      </button>
    </section>
  )
}

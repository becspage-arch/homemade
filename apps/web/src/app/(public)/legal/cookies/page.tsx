import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { ContactBlock } from '../contact-block'

export const metadata: Metadata = {
  title: 'Cookie Policy — Homemade',
  description: 'What cookies Homemade sets and how to manage them.',
}

interface CookieRow {
  name: string
  purpose: string
  expiry: string
  party: 'First' | 'Third'
  category: 'Necessary' | 'Analytics' | 'Error monitoring' | 'Preferences'
}

const COOKIES: CookieRow[] = [
  {
    name: 'homemade_splash',
    purpose:
      'Records that you have entered the splash password and unlocked the site while we are still in private beta.',
    expiry: '30 days',
    party: 'First',
    category: 'Necessary',
  },
  {
    name: '__clerk_session, __session',
    purpose:
      'Authentication and session management. Set by Clerk when you sign in so we know which account is making each request.',
    expiry: 'Session and up to 7 days',
    party: 'Third',
    category: 'Necessary',
  },
  {
    name: 'homemade-consent',
    purpose:
      'Stores your choices in the cookie banner. Without this, we would have to ask you on every page.',
    expiry: '12 months',
    party: 'First',
    category: 'Necessary',
  },
  {
    name: 'ph_*',
    purpose:
      'PostHog product analytics. Records pseudonymous page views and feature use so we can see what works and what does not. Only set when you accept analytics cookies.',
    expiry: '12 months',
    party: 'Third',
    category: 'Analytics',
  },
  {
    name: 'sentry-replay-session',
    purpose:
      'Sentry session replay (if enabled). Records error context so we can debug crashes. Only set when you accept error monitoring.',
    expiry: 'Session',
    party: 'Third',
    category: 'Error monitoring',
  },
  {
    name: 'homemade-prefs',
    purpose:
      'Local-only storage of your reading preferences (beginner mode, sidebar state). Stays on your device — we never send it back to us.',
    expiry: 'Until cleared',
    party: 'First',
    category: 'Preferences',
  },
]

export default function CookiesPage() {
  return (
    <article className="legal-page">
      <LegalHeader eyebrow="Cookies" title="Cookie Policy" />

      <div className="legal-body">
        <h2>What cookies are</h2>
        <p>
          Cookies are small text files that a site stores on your device so
          it can recognise you between visits. We also use a couple of
          similar technologies — browser local storage and session storage —
          for the same kinds of things. This policy covers all of them
          together.
        </p>

        <h2>Categories we use</h2>
        <p>
          We group cookies into four categories. You can accept or refuse
          each category in the cookie banner; necessary cookies are the
          only ones you cannot turn off because the site cannot work
          without them.
        </p>

        <h3>Necessary</h3>
        <p>
          Keep you signed in, remember the splash password during private
          beta, and record your cookie choices so we do not ask you twice.
        </p>

        <h3>Analytics</h3>
        <p>
          Help us understand which tutorials are read, which features get
          used, and where readers get stuck. We use PostHog with IP
          truncation and a pseudonymous user ID. We never sell analytics
          data to anyone.
        </p>

        <h3>Error monitoring</h3>
        <p>
          If something goes wrong, Sentry sends us the error and a small
          amount of context so we can fix it. With session replay enabled,
          this can also include a redacted recording of the page leading up
          to the error.
        </p>

        <h3>Preferences</h3>
        <p>
          Remember small reader choices on your device, like whether
          beginner mode is on. These stay in browser storage and are not
          sent back to us.
        </p>

        <h2>The cookies we set</h2>

        <div style={{ overflowX: 'auto' }}>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Purpose</th>
                <th>Expiry</th>
                <th>Party</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.name}>
                  <td><code>{c.name}</code></td>
                  <td>{c.purpose}</td>
                  <td>{c.expiry}</td>
                  <td>{c.party}</td>
                  <td>{c.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Managing your preferences</h2>
        <p>
          The first time you visit Homemade we ask you to accept, customise
          or refuse non-necessary cookies. You can change your mind at any
          time:
        </p>
        <ul>
          <li>
            Click <strong>Cookie preferences</strong> in the footer of any
            page to open the banner again.
          </li>
          <li>
            Most browsers let you block or clear cookies from their
            settings — see your browser&apos;s help for instructions. Blocking
            necessary cookies will break the site.
          </li>
        </ul>

        <p>
          For everything else about how we look after data, see the{' '}
          <Link href="/legal/privacy">Privacy Policy</Link>.
        </p>
      </div>

      <ContactBlock topic="privacy" />
    </article>
  )
}

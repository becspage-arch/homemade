import Link from 'next/link'
import { UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import { CookiePreferencesButton } from './cookie-banner'

const SOCIAL_LINKS = [
  {
    label: 'Homemade on Instagram',
    href: 'https://www.instagram.com/homemade_education',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Homemade on Pinterest',
    href: 'https://pinterest.com/homemade_education/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 20c-.4-1.5-.3-3 .2-4.6l1.4-5.2" />
        <path d="M8.5 9.4a3.7 3.7 0 0 1 3.7-3.9c2.4 0 4.1 1.7 4.1 4.2 0 2.9-1.6 5.1-3.9 5.1-1 0-1.8-.8-1.5-1.9" />
      </svg>
    ),
  },
  {
    label: 'Homemade on TikTok',
    href: 'https://www.tiktok.com/@homemade_education',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11.5a3.5 3.5 0 1 0 3.5 3.5V4c.4 2.2 2 3.8 4.2 4" />
      </svg>
    ),
  },
  {
    label: 'Homemade on YouTube',
    href: 'https://www.youtube.com/@homemade_education1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
        <path d="M10.5 9.5l4 2.5-4 2.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Homemade on Facebook',
    href: 'https://www.facebook.com/hellohomemade',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 8.5V7c0-.8.4-1.2 1.3-1.2H17V3h-2c-2.1 0-3.3 1.2-3.3 3.4v2.1H10V11h1.7v10h2.8V11h2L17 8.5z" />
      </svg>
    ),
  },
]

export async function SiteFooter() {
  const dbUser = await getCurrentDbUser()
  const signedIn = !!dbUser
  // CREATOR / EDITOR / ADMIN — creators administer their own content via the
  // unified /admin surface, so they get the link too.
  const canSeeAdmin = hasRoleAtLeast(dbUser, UserRole.CREATOR)

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-wordmark">homemade</span>
          <span className="site-footer-tagline">
            The home of making things yourself.
          </span>
        </div>

        <nav className="site-footer-nav" aria-label="Legal">
          <Link href="/about" className="site-footer-link">About</Link>
          <Link href="/legal/privacy" className="site-footer-link">Privacy</Link>
          <Link href="/legal/terms" className="site-footer-link">Terms</Link>
          <Link href="/legal/cookies" className="site-footer-link">Cookies</Link>
          <Link href="/legal/acceptable-use" className="site-footer-link">Acceptable use</Link>
          <Link href="/legal/dmca" className="site-footer-link">DMCA</Link>
          <Link href="/legal/subscription-terms" className="site-footer-link">
            Subscription terms
          </Link>
          <Link href="/premium" className="site-footer-link">Premium</Link>
          <CookiePreferencesButton />
          {signedIn && (
            <Link href="/me/data-rights" className="site-footer-link">
              Data rights
            </Link>
          )}
          {canSeeAdmin && (
            <Link href="/admin" className="site-footer-link">
              Admin
            </Link>
          )}
        </nav>

        <ul className="site-footer-social" aria-label="Homemade on social media">
          {SOCIAL_LINKS.map((social) => (
            <li key={social.href}>
              <a
                href={social.href}
                className="site-footer-social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}

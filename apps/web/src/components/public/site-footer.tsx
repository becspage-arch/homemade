import Link from 'next/link'
import { UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import { LEGAL_ENTITY, legalField } from '@/lib/legal-entity'
import { CookiePreferencesButton } from './cookie-banner'

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
          <Link href="/legal/privacy" className="site-footer-link">Privacy</Link>
          <Link href="/legal/terms" className="site-footer-link">Terms</Link>
          <Link href="/legal/cookies" className="site-footer-link">Cookies</Link>
          <Link href="/legal/acceptable-use" className="site-footer-link">Acceptable use</Link>
          <Link href="/legal/dmca" className="site-footer-link">DMCA</Link>
          <Link href="/legal/subscription-terms" className="site-footer-link">
            Subscription terms
          </Link>
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

        <p className="site-footer-fineprint">
          {LEGAL_ENTITY.name}. {LEGAL_ENTITY.jurisdiction}. ICO registration:{' '}
          {legalField(LEGAL_ENTITY.icoRegistrationNumber, 'pending')}.
        </p>
      </div>
    </footer>
  )
}

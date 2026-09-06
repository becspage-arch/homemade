import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { prisma, UserProjectStatus } from '@homemade/db'
import { SiteHeader } from '@/components/public/site-header'
import { SiteFooter } from '@/components/public/site-footer'
import { CookieBanner } from '@/components/public/cookie-banner'
import { MobileTabBar } from '@/components/public/mobile-tab-bar'
import { OfflineBanner } from '@/components/public/offline-banner'
import { ServiceWorkerRegister } from '@/components/public/service-worker-register'
import { PushOptIn } from '@/components/public/push-opt-in'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { CONSENT_COOKIE_NAME, parseConsentCookieValue } from '@/lib/consent'
import { hasPremium } from '@/lib/entitlements'
import { PremiumProvider } from '@/components/premium/premium-context'
import '@/components/public/site-chrome.css'
import '@/components/public/mobile-tab-bar.css'
import '@/components/public/offline-banner.css'
import '@/components/public/mobile-tuning.css'

// Header reads the current user via Clerk + Prisma so the whole tree under
// (public) is per-request. Without this, Next picks the layout up as static
// (the previous version's auth() call was its dynamic signal) and tries to
// prerender legal pages at build time, which hits Prisma with no DATABASE_URL.
export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentDbUser()

  // Cookie consent, read on the server so an accepted banner is never part
  // of the first paint. The client still treats localStorage as the device
  // source of truth; this only decides whether the banner mounts at all.
  const consentCookie = (await cookies()).get(CONSENT_COOKIE_NAME)?.value
  const consentDecided = parseConsentCookieValue(consentCookie) !== null

  let hasActiveProject = false
  if (user && !user.pushNotificationsEnabled) {
    const count = await prisma.userProject.count({
      where: { userId: user.id, status: UserProjectStatus.IN_PROGRESS },
    })
    hasActiveProject = count > 0
  }

  return (
    <PremiumProvider isPremium={hasPremium(user)}>
      <SiteHeader />
      <OfflineBanner />
      <main className="public-main">{children}</main>
      <SiteFooter />
      <CookieBanner alreadyDecided={consentDecided} />
      <MobileTabBar signedIn={Boolean(user)} />
      <ServiceWorkerRegister />
      {user && (
        <PushOptIn
          alreadyEnabled={user.pushNotificationsEnabled}
          hasActiveProject={hasActiveProject}
        />
      )}
    </PremiumProvider>
  )
}

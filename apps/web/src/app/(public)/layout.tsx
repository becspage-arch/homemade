import type { ReactNode } from 'react'
import { prisma, UserProjectStatus } from '@homemade/db'
import { SiteHeader } from '@/components/public/site-header'
import { SiteFooter } from '@/components/public/site-footer'
import { CookieBanner } from '@/components/public/cookie-banner'
import { MobileTabBar } from '@/components/public/mobile-tab-bar'
import { OfflineBanner } from '@/components/public/offline-banner'
import { ServiceWorkerRegister } from '@/components/public/service-worker-register'
import { PushOptIn } from '@/components/public/push-opt-in'
import { getCurrentDbUser } from '@/lib/get-current-user'
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

  let hasActiveProject = false
  if (user && !user.pushNotificationsEnabled) {
    const count = await prisma.userProject.count({
      where: { userId: user.id, status: UserProjectStatus.IN_PROGRESS },
    })
    hasActiveProject = count > 0
  }

  return (
    <>
      <SiteHeader />
      <OfflineBanner />
      <main className="public-main">{children}</main>
      <SiteFooter />
      <CookieBanner />
      <MobileTabBar signedIn={Boolean(user)} />
      <ServiceWorkerRegister />
      {user && (
        <PushOptIn
          alreadyEnabled={user.pushNotificationsEnabled}
          hasActiveProject={hasActiveProject}
        />
      )}
    </>
  )
}

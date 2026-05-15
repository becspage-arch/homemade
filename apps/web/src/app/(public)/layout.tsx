import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/public/site-header'
import { SiteFooter } from '@/components/public/site-footer'
import { CookieBanner } from '@/components/public/cookie-banner'
import '@/components/public/site-chrome.css'

// Header reads the current user via Clerk + Prisma so the whole tree under
// (public) is per-request. Without this, Next picks the layout up as static
// (the previous version's auth() call was its dynamic signal) and tries to
// prerender legal pages at build time, which hits Prisma with no DATABASE_URL.
export const dynamic = 'force-dynamic'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="public-main">{children}</main>
      <SiteFooter />
      <CookieBanner />
    </>
  )
}

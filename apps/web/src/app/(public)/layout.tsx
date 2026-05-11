import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/public/site-header'
import { SiteFooter } from '@/components/public/site-footer'
import { CookieBanner } from '@/components/public/cookie-banner'
import '@/components/public/site-chrome.css'

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

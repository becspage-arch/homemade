import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { StudioTopNavSlot } from '@/components/studio/StudioTopNavSlot'
import '@/components/studio/chart/chart-viewport.css'
import '@/components/studio/shell/studio-shell.css'
import '@/components/studio/StudioTopNav.css'
import '@/components/studio/studio-landing.css'

/**
 * Studio layout — the editor surfaces own the entire viewport. We skip
 * the site header / footer / mobile tab bar so the chart canvas runs
 * edge-to-edge, Figma / Linear style. Per-Studio app brings its own
 * toolbar + status bar.
 *
 * A persistent top-nav (Homemade / Category / Studio + user menu) sits
 * above the per-Studio surfaces so the user can always navigate back
 * out. Without it the Studio felt stranded from the rest of the site.
 * The print routes opt out of the top-nav inside StudioTopNavSlot.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Studio · homemade',
  robots: { index: false, follow: false },
}

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentDbUser()
  return (
    <div className="studio-root">
      <StudioTopNavSlot signedIn={Boolean(user)} userName={user?.name ?? null} />
      <div className="studio-root-body">{children}</div>
    </div>
  )
}

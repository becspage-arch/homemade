import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import '@/components/studio/chart/chart-viewport.css'
import '@/components/studio/shell/studio-shell.css'

/**
 * Studio layout — the editor surfaces own the entire viewport. We skip
 * the site header / footer / mobile tab bar so the chart canvas runs
 * edge-to-edge, Figma / Linear style. Per-Studio app brings its own
 * toolbar + status bar.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Studio · homemade',
  robots: { index: false, follow: false },
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="studio-root">{children}</div>
}

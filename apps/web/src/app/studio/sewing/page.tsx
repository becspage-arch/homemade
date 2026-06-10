import type { Metadata } from 'next'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { SewingStudioShell } from '@/components/studio/sewing/SewingStudioShell'
import {
  loadDemoSewingPattern,
  loadSewingProjectsForUser,
} from '@/lib/sewing/load-pattern'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sewing Studio · homemade',
  description:
    'Open a sewing pattern. Check your fabric and notions, plan the cut, work the steps, print or project the pattern at 1:1.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{ demo?: string }>
}

/**
 * /studio/sewing - sewing category Studio root.
 *
 * URL state:
 *   no demo, no slug → empty state (signed-out hero + start cards;
 *                       signed-in users also see "Your projects")
 *   demo=1          → load the hand-crafted A-line skirt sample
 *
 * Loading a real pattern goes through /studio/sewing/[slug] so the URL
 * carries the slug - same shape as the cross-stitch / crochet Studios.
 */
export default async function SewingStudioPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const user = await getCurrentDbUser()

  const pattern = sp.demo === '1' ? loadDemoSewingPattern() : null
  const myProjects = user && !pattern ? await loadSewingProjectsForUser(user.id) : []

  const startMode: 'empty' | 'pattern' = pattern ? 'pattern' : 'empty'

  return (
    <SewingStudioShell
      startMode={startMode}
      signedIn={Boolean(user)}
      userName={user?.name ?? null}
      pattern={pattern}
      progress={null}
      myProjects={myProjects}
      measurementPreference={
        user?.measurementPreference === 'inches' ? 'inches' : 'cm'
      }
    />
  )
}

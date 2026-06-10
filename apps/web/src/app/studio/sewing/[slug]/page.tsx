import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { SewingStudioShell } from '@/components/studio/sewing/SewingStudioShell'
import {
  DEMO_SEWING_PATTERN_SLUG,
  loadDemoSewingPattern,
} from '@/lib/sewing/demo-pattern'
import {
  loadSewingPatternForStudio,
  loadSewingProjectForUser,
} from '@/lib/sewing/load-pattern'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sewing Studio · homemade',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function SewingPatternStudioPage({ params }: PageProps) {
  const { slug } = await params
  const user = await getCurrentDbUser()

  const pattern =
    slug === DEMO_SEWING_PATTERN_SLUG
      ? loadDemoSewingPattern()
      : await loadSewingPatternForStudio({ slug })
  if (!pattern) notFound()

  const progress =
    user && slug !== DEMO_SEWING_PATTERN_SLUG
      ? await loadSewingProjectForUser(user.id, pattern.id)
      : null

  return (
    <SewingStudioShell
      startMode="pattern"
      signedIn={Boolean(user)}
      userName={user?.name ?? null}
      pattern={pattern}
      progress={progress}
      myProjects={[]}
      measurementPreference={
        user?.measurementPreference === 'inches' ? 'inches' : 'cm'
      }
    />
  )
}

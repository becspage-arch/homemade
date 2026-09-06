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
import { getFreesewingShowcase } from '@/lib/sewing/grading/showcase'
import { MakerPhotos } from '@/components/public/maker-photos/maker-photos'
import { loadMakerPhotos } from '@/lib/maker-photos'

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

  // Enrich freesewing-backed patterns with a CYC-default showcase render.
  // Anonymous browse uses this; signed-in personalisation (S-5d) calls
  // POST /api/studio/sewing/draft directly from the Studio.
  if (pattern.isFreesewingDesign && pattern.freesewingDesignSlug) {
    const showcase = await getFreesewingShowcase(pattern.freesewingDesignSlug)
    if (showcase) {
      pattern.freesewingShowcaseSvg = showcase.svg
      pattern.freesewingShowcaseCacheKey = showcase.cacheKey
      if (!pattern.attributionText && showcase.attribution) {
        pattern.attributionText = showcase.attribution
      }
    }
  }

  const progress =
    user && slug !== DEMO_SEWING_PATTERN_SLUG
      ? await loadSewingProjectForUser(user.id, pattern.id)
      : null

  // The demo pattern is built in code, not a SewingPattern row, so there is
  // nothing for a photo to hang off it.
  const isRealPattern = slug !== DEMO_SEWING_PATTERN_SLUG
  const makerPhotos = isRealPattern
    ? await loadMakerPhotos({
        kind: 'pattern',
        patternId: pattern.id,
        patternType: 'SEWING',
      })
    : []

  return (
    <>
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
      {isRealPattern && (
        <MakerPhotos
          photos={makerPhotos}
          signedIn={Boolean(user)}
          patternId={pattern.id}
          patternType="SEWING"
          returnTo={`/studio/sewing/${slug}`}
          galleryHref="/sewing/makes"
        />
      )}
    </>
  )
}

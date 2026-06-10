import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SewingProjectorShell } from './shell'
import {
  DEMO_SEWING_PATTERN_SLUG,
  loadDemoSewingPattern,
} from '@/lib/sewing/demo-pattern'
import { loadSewingPatternForStudio } from '@/lib/sewing/load-pattern'
import { getFreesewingShowcase } from '@/lib/sewing/grading/showcase'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projector view · homemade',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ size?: string }>
}

/**
 * /studio/sewing/[slug]/projector - full-screen projector view at 1:1
 * scale. Calibration path #3 from the locked sewing decisions.
 */
export default async function SewingProjectorPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const pattern =
    slug === DEMO_SEWING_PATTERN_SLUG
      ? loadDemoSewingPattern()
      : await loadSewingPatternForStudio({ slug })
  if (!pattern) notFound()
  if (pattern.isFreesewingDesign && pattern.freesewingDesignSlug) {
    const showcase = await getFreesewingShowcase(pattern.freesewingDesignSlug)
    if (showcase) {
      pattern.freesewingShowcaseSvg = showcase.svg
      pattern.freesewingShowcaseCacheKey = showcase.cacheKey
    }
  }
  const size =
    sp.size && pattern.supportedSizes.some((s) => s.name === sp.size)
      ? sp.size
      : pattern.defaultSize
  return <SewingProjectorShell pattern={pattern} selectedSize={size} />
}

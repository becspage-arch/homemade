import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TiledPrintExporter } from '@/components/studio/sewing/printing/TiledPrintExporter'
import {
  DEMO_SEWING_PATTERN_SLUG,
  loadDemoSewingPattern,
} from '@/lib/sewing/demo-pattern'
import { loadSewingPatternForStudio } from '@/lib/sewing/load-pattern'
import { getFreesewingShowcase } from '@/lib/sewing/grading/showcase'
import '@/components/studio/sewing/sewing-studio.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Print sewing pattern · homemade',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * /studio/sewing/[slug]/print - tiled print exporter. Client-side PDF
 * build via pdf-lib (calibration path #1 from the locked sewing
 * decisions).
 */
export default async function SewingPrintPage({ params }: PageProps) {
  const { slug } = await params
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
      if (!pattern.attributionText && showcase.attribution) {
        pattern.attributionText = showcase.attribution
      }
    }
  }
  return (
    <div className="sewing-studio-surface" style={{ position: 'relative', overflow: 'auto' }}>
      <header style={{ padding: '1.5rem 2rem 0' }}>
        <h1 style={{ fontFamily: 'var(--studio-font-display, serif)', fontWeight: 500, margin: 0 }}>
          {pattern.name}
        </h1>
        <p style={{ color: 'var(--studio-ink-soft)', marginTop: '0.4rem' }}>
          Tiled print exporter. Pick a paper size, download the PDF, and print at 100%.
        </p>
      </header>
      <TiledPrintExporter pattern={pattern} />
    </div>
  )
}

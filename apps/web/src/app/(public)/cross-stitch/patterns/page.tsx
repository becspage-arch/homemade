import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma, Visibility } from '@homemade/db'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import { PatternLibraryGrid } from './pattern-library-grid'
import './patterns.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Cross-stitch patterns · homemade',
  description: 'Designed cross-stitch patterns from independent designers — ready to stitch in the Homemade Studio.',
  path: '/cross-stitch/patterns',
})

interface PageProps {
  searchParams: Promise<{
    sub?: string
    sort?: 'featured' | 'newest' | 'size' | 'popular'
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    size?: 's' | 'm' | 'l'
    minColour?: string
    maxColour?: string
    hasBackstitch?: '1'
    hasFrenchKnots?: '1'
  }>
}

const SIZE_RANGES: Record<string, { maxCells: number }> = {
  s: { maxCells: 4_000 },
  m: { maxCells: 12_000 },
  l: { maxCells: Number.POSITIVE_INFINITY },
}

export default async function CrossStitchPatternsLibraryPage({ searchParams }: PageProps) {
  const sp = await searchParams

  const where: Record<string, unknown> = {
    ownerUserId: null,
    type: 'CROSS_STITCH',
    visibility: Visibility.PUBLIC,
    publishedAt: { not: null },
  }
  if (sp.difficulty) where.difficulty = sp.difficulty
  if (sp.hasBackstitch === '1') where.hasBackstitch = true
  if (sp.hasFrenchKnots === '1') where.hasFrenchKnots = true
  if (sp.sub) where.subCategory = { slug: sp.sub }

  const sort = sp.sort ?? 'featured'
  const orderBy =
    sort === 'newest'
      ? { publishedAt: 'desc' as const }
      : sort === 'size'
      ? { totalStitches: 'asc' as const }
      : sort === 'popular'
      ? { updatedAt: 'desc' as const }
      : { publishedAt: 'desc' as const }

  const [patterns, subCategories] = await Promise.all([
    prisma.pattern.findMany({
      where,
      orderBy,
      take: 96,
      select: {
        id: true,
        slug: true,
        name: true,
        widthCells: true,
        heightCells: true,
        colourCount: true,
        totalStitches: true,
        difficulty: true,
        estimatedHours: true,
        hasBackstitch: true,
        hasFrenchKnots: true,
        premium: true,
        fabricCountSuggested: true,
        designer: { select: { displayName: true, slug: true } },
        subCategory: { select: { slug: true, name: true } },
        hero: { select: { cloudflareId: true, r2Key: true } },
      },
    }),
    prisma.subCategory.findMany({
      where: { category: { slug: 'cross-stitch' } },
      orderBy: { order: 'asc' },
      select: { slug: true, name: true },
    }),
  ])

  const sizeFilter = sp.size ? SIZE_RANGES[sp.size] : null
  const filtered = patterns.filter((p) => {
    if (sizeFilter && p.widthCells * p.heightCells > sizeFilter.maxCells) return false
    if (sp.minColour && p.colourCount < Number(sp.minColour)) return false
    if (sp.maxColour && p.colourCount > Number(sp.maxColour)) return false
    return true
  })

  return (
    <div className="cross-stitch-library">
      <header className="cross-stitch-library-header">
        <p className="cross-stitch-library-overline">Cross-stitch · pattern library</p>
        <h1 className="cross-stitch-library-title">Stitch something beautiful.</h1>
        <p className="cross-stitch-library-lede">
          Designed patterns from independent makers. Open one in the Studio, mark stitched as you go, print a clean PDF when you are ready.
        </p>
        <div className="cross-stitch-library-actions">
          <Link href="/studio/cross-stitch?new=photo" className="cross-stitch-library-action primary">
            Make one from a photo
          </Link>
          <Link href="/studio/cross-stitch?new=blank" className="cross-stitch-library-action ghost">
            Start with a blank canvas
          </Link>
        </div>
      </header>

      <PatternLibraryGrid
        patterns={filtered.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          widthCells: p.widthCells,
          heightCells: p.heightCells,
          colourCount: p.colourCount,
          totalStitches: p.totalStitches,
          difficulty: p.difficulty,
          estimatedHours: p.estimatedHours,
          hasBackstitch: p.hasBackstitch,
          hasFrenchKnots: p.hasFrenchKnots,
          premium: p.premium,
          fabricCountSuggested: p.fabricCountSuggested,
          designerName: p.designer?.displayName ?? null,
          designerSlug: p.designer?.slug ?? null,
          subCategorySlug: p.subCategory?.slug ?? null,
          subCategoryName: p.subCategory?.name ?? null,
          thumbnailUrl: patternHeroUrl({ id: p.id, hero: p.hero }, 'card'),
        }))}
        subCategories={subCategories}
        currentFilters={{
          sub: sp.sub ?? null,
          difficulty: sp.difficulty ?? null,
          size: sp.size ?? null,
          sort,
          hasBackstitch: sp.hasBackstitch === '1',
          hasFrenchKnots: sp.hasFrenchKnots === '1',
        }}
      />
    </div>
  )
}

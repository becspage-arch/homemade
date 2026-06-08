import { NextResponse } from 'next/server'
import { prisma, TutorialStatus } from '@homemade/db'

/**
 * Resolve a list of stitch slugs to the foundation tutorials that
 * teach them. Used by the Studio Crochet "Stitches in this pattern"
 * panel to give the user a one-click jump to "how do I do this".
 *
 *   GET /api/studio/crochet/stitch-help?slugs=crochet-treble,crochet-magic-ring
 *     -> [{ stitchSlug, canonicalName, tutorial: { slug, title, categorySlug } | null }, ...]
 *
 * Public route, no auth required. Returns null in the tutorial slot
 * when the stitch exists in the master Stitch table but has no
 * published tutorial yet.
 */

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawSlugs = url.searchParams.get('slugs') ?? ''
  const slugs = rawSlugs
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9][a-z0-9-]{0,79}$/.test(s))

  if (slugs.length === 0) return NextResponse.json([])

  // Look up each stitch in the master table for the canonical name.
  const stitches = await prisma.stitch.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, canonicalName: true, craft: true },
  })
  const stitchBySlug = new Map(stitches.map((s) => [s.slug, s]))

  // For each stitch, try to find a published STITCH tutorial. The
  // tutorial's craftStitchSlugs field links pattern -> stitches, but
  // for the STITCH-typed foundation tutorials we want the tutorial
  // whose craftStitchSlugs contains exactly that slug. We index the
  // craftStitchSlugs column as a GIN array, so an array-contains
  // filter is the right shape.
  const tutorials = await prisma.tutorial.findMany({
    where: {
      type: 'STITCH',
      status: TutorialStatus.PUBLISHED,
      craftStitchSlugs: { hasSome: slugs },
    },
    select: {
      slug: true,
      title: true,
      craftStitchSlugs: true,
      category: { select: { slug: true } },
    },
  })

  // First-match-wins: for each requested slug, find the first tutorial
  // whose craftStitchSlugs contains it. Order in `tutorials` is
  // database-default, so this is a small N anyway.
  const result = slugs.map((slug) => {
    const master = stitchBySlug.get(slug)
    const tutorial = tutorials.find((t) => t.craftStitchSlugs.includes(slug))
    return {
      stitchSlug: slug,
      canonicalName: master?.canonicalName ?? slug,
      tutorial: tutorial
        ? {
            slug: tutorial.slug,
            title: tutorial.title,
            categorySlug: tutorial.category.slug,
          }
        : null,
    }
  })

  return NextResponse.json(result)
}

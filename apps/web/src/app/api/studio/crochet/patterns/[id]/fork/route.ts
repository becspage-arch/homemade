import { NextResponse } from 'next/server'
import { prisma, Visibility } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { slugify } from '@/lib/slug'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

/**
 * POST /api/studio/crochet/patterns/[id]/fork — silent fork.
 *
 * The moment a maker changes something about a library crochet pattern, this
 * makes them their own copy and the Studio swaps `crochetPatternId=` for the new
 * one. No modal, no confirmation, exactly as the cross-stitch Studio forks.
 *
 * The copy carries the source's stitch program and both derived faces verbatim,
 * so it opens identically. The edit itself lands on the next PATCH, which is
 * where the audit gate runs.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!hasPremium(user)) {
    return NextResponse.json(
      { error: 'Homemade Premium is required to make a pattern your own and change it.' },
      { status: 402 },
    )
  }

  const { id } = await ctx.params
  const source = await prisma.crochetPattern.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      rowsStructured: true,
      chartData: true,
      loomProgram: true,
      loomYarnRadiusMm: true,
      format: true,
      construction: true,
      shapeCategory: true,
      constructionDirection: true,
      bodyShape: true,
      sizesGraded: true,
      yardageBySize: true,
      gaugeText: true,
      finishedSizeText: true,
      pieceCount: true,
      pieces: true,
      buildOrder: true,
      notions: true,
      safetyNotes: true,
      abbreviationsUsed: true,
      specialStitchesUsed: true,
      craftStitchSlugs: true,
      craftTechniqueTags: true,
      terminologyConvention: true,
      clusterCountByRound: true,
      repeatRowGroups: true,
      difficulty: true,
      estimatedHours: true,
      designerId: true,
      subCategoryId: true,
      visibility: true,
      ownerUserId: true,
    },
  })
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (source.ownerUserId !== null) {
    return NextResponse.json({ error: 'Source is not a library pattern' }, { status: 400 })
  }
  if (source.visibility === Visibility.PRIVATE) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  }

  const base = slugify(source.name).slice(0, 60)
  const forked = await prisma.crochetPattern.create({
    data: {
      name: source.name,
      slug: `${base}-${Math.random().toString(36).slice(2, 8)}`,
      description: source.description,
      rowsStructured: source.rowsStructured ?? [],
      chartData: source.chartData ?? undefined,
      loomProgram: source.loomProgram ?? undefined,
      loomYarnRadiusMm: source.loomYarnRadiusMm,
      format: source.format,
      construction: source.construction,
      shapeCategory: source.shapeCategory,
      constructionDirection: source.constructionDirection,
      bodyShape: source.bodyShape,
      sizesGraded: source.sizesGraded ?? undefined,
      yardageBySize: source.yardageBySize ?? undefined,
      gaugeText: source.gaugeText,
      finishedSizeText: source.finishedSizeText,
      pieceCount: source.pieceCount,
      pieces: source.pieces ?? undefined,
      buildOrder: source.buildOrder ?? undefined,
      notions: source.notions,
      safetyNotes: source.safetyNotes,
      abbreviationsUsed: source.abbreviationsUsed,
      specialStitchesUsed: source.specialStitchesUsed,
      craftStitchSlugs: source.craftStitchSlugs,
      craftTechniqueTags: source.craftTechniqueTags,
      terminologyConvention: source.terminologyConvention,
      clusterCountByRound: source.clusterCountByRound ?? undefined,
      repeatRowGroups: source.repeatRowGroups ?? undefined,
      difficulty: source.difficulty,
      estimatedHours: source.estimatedHours,
      designerId: source.designerId,
      subCategoryId: source.subCategoryId,
      forkedFromId: source.id,
      ownerUserId: user.id,
      visibility: Visibility.PRIVATE,
    },
    select: { id: true, slug: true },
  })

  return NextResponse.json({ id: forked.id, slug: forked.slug }, { status: 201 })
}

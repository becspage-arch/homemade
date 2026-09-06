import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  prisma,
  parsePatternData,
  computePatternMetrics,
  Visibility,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { isLibraryPattern } from '@/lib/studio/library-visibility'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

/**
 * POST /api/studio/patterns/[id]/fork — silent fork.
 *
 * Called the moment a signed-in viewer of a library pattern makes their
 * first edit. Creates a new owned Pattern row carrying the in-memory
 * edited data, sets forkedFromId, and returns the new id. The client
 * swaps `patternId=` in the URL and continues autosaving against the
 * fork.
 *
 * No modal, no confirmation. The status bar may show a brief "Saved to
 * your version" toast on first save against the fork.
 */
const Body = z.object({ data: z.unknown() })

export async function POST(req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id } = await ctx.params
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const source = await prisma.pattern.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      designerId: true,
      subCategoryId: true,
      difficulty: true,
      estimatedHours: true,
      visibility: true,
      ownerUserId: true,
    },
  })
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (source.ownerUserId !== null) {
    return NextResponse.json({ error: 'Source is not a library pattern' }, { status: 400 })
  }
  if (!isLibraryPattern(source)) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  }

  let data
  try {
    data = parsePatternData(parsed.data.data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Pattern data failed validation', detail: String(err) },
      { status: 400 },
    )
  }

  const metrics = computePatternMetrics(data)
  const forked = await prisma.pattern.create({
    data: {
      type: 'CROSS_STITCH',
      name: source.name,
      data: data as unknown as object,
      ownerUserId: user.id,
      visibility: Visibility.PRIVATE,
      forkedFromId: source.id,
      designerId: source.designerId,
      subCategoryId: source.subCategoryId,
      difficulty: source.difficulty,
      estimatedHours: source.estimatedHours,
      widthCells: metrics.widthCells,
      heightCells: metrics.heightCells,
      colourCount: metrics.colourCount,
      totalStitches: metrics.totalStitches,
      hasBackstitch: metrics.hasBackstitch,
      hasFrenchKnots: metrics.hasFrenchKnots,
      hasBeads: metrics.hasBeads,
      hasQuarterStitches: metrics.hasQuarterStitches,
      confettiShare: metrics.confettiShare,
      colourChangesPer100: metrics.colourChangesPer100,
      medianRunLength: metrics.medianRunLength,
      stitchability: metrics.stitchability,
      fabricCountSuggested: data.fabric.count,
    },
    select: { id: true },
  })
  return NextResponse.json({ id: forked.id }, { status: 201 })
}

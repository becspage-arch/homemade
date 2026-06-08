import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  prisma,
  parsePatternData,
  computePatternMetrics,
  Visibility,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

/**
 * POST /api/studio/patterns/[id]/brand-swap — switch a pattern's
 * palette to a different floss brand.
 *
 * The client sends the full target palette (with any per-colour
 * overrides already applied). We re-validate via parsePatternData,
 * then either update in place (owned pattern) or silent-fork into a
 * new owned Pattern row (library pattern). The cell grid + back-stitch
 * + french-knot layers are untouched; only the palette swap is
 * persisted.
 *
 * Brand-swap stays free in v1 per the locked premium philosophy.
 * (premium-gated in Phase X — config flag only, no refactor.)
 */
const Body = z.object({
  toBrand: z.enum(['DMC', 'ANCHOR', 'MADEIRA']),
  /** The full PatternData with the palette already swapped client-side. */
  data: z.unknown(),
})

export async function POST(req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id } = await ctx.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Body.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

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

  // Validate the incoming palette + grid.
  let data
  try {
    data = parsePatternData(parsed.data.data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Pattern data failed validation', detail: String(err) },
      { status: 400 },
    )
  }

  // Sanity: every palette entry should now carry the requested brand.
  if (data.palette.some((e) => e.brand !== parsed.data.toBrand)) {
    return NextResponse.json(
      { error: 'Palette contains entries not in the requested brand' },
      { status: 400 },
    )
  }

  const metrics = computePatternMetrics(data)

  // Library pattern → silent fork into a new owned row.
  if (source.ownerUserId === null) {
    if (source.visibility === Visibility.PRIVATE) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
    }
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
        fabricCountSuggested: data.fabric.count,
      },
      select: { id: true },
    })
    return NextResponse.json({ id: forked.id, forked: true }, { status: 201 })
  }

  // Owned pattern → in-place update.
  if (source.ownerUserId !== user.id) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  }
  await prisma.pattern.update({
    where: { id },
    data: {
      data: data as unknown as object,
      colourCount: metrics.colourCount,
    },
  })
  return NextResponse.json({ id, forked: false })
}

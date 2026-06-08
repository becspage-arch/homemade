import { NextResponse } from 'next/server'
import {
  prisma,
  PatternDataSchema,
  computePatternMetrics,
  parsePatternData,
  Visibility,
  type PatternData,
} from '@homemade/db'
import { z } from 'zod'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

const BlankSourceSchema = z.object({
  source: z.literal('blank'),
  name: z.string().min(1).max(120),
  width: z.number().int().min(4).max(400),
  height: z.number().int().min(4).max(400),
  fabricCount: z.number().int().min(6).max(40),
  palette: z.array(
    z.object({
      symbol: z.string().min(1),
      brand: z.enum(['DMC', 'ANCHOR', 'MADEIRA']),
      code: z.string().min(1),
      name: z.string().min(1),
      rgb: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      strandsFullCross: z.number().int().min(1).max(6).default(2),
      strandsBackstitch: z.number().int().min(1).max(6).default(1),
    }),
  ).min(1),
})

const PrebuiltSourceSchema = z.object({
  source: z.literal('prebuilt'),
  name: z.string().min(1).max(120),
  data: z.unknown(),
})

const CreateSchema = z.discriminatedUnion('source', [BlankSourceSchema, PrebuiltSourceSchema])

/**
 * GET /api/studio/patterns — list the signed-in user's patterns.
 */
export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const rows = await prisma.pattern.findMany({
    where: { ownerUserId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 200,
    select: {
      id: true,
      name: true,
      slug: true,
      updatedAt: true,
      widthCells: true,
      heightCells: true,
      colourCount: true,
      totalStitches: true,
      thumbnailMediaId: true,
    },
  })
  return NextResponse.json({ patterns: rows })
}

/**
 * POST /api/studio/patterns — create a new owned pattern.
 *
 * Two sources:
 *   - blank      → build a starter pattern from dimensions + palette
 *   - prebuilt   → validate a client-provided pattern JSON
 *                  (used by photo-to-chart save and fork-on-edit)
 */
export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  let data: PatternData
  let name: string

  if (parsed.data.source === 'blank') {
    name = parsed.data.name
    data = parsePatternData({
      schemaVersion: 1,
      type: 'CROSS_STITCH',
      grid: {
        width: parsed.data.width,
        height: parsed.data.height,
        cells: [],
        backstitch: [],
        frenchKnots: [],
        beads: [],
      },
      palette: parsed.data.palette,
      fabric: { count: parsed.data.fabricCount, colourRgb: '#F5EBD8', type: 'Aida' },
      metadata: {},
    })
  } else {
    name = parsed.data.name
    try {
      data = parsePatternData(parsed.data.data)
    } catch (err) {
      return NextResponse.json(
        { error: 'Pattern data failed validation', detail: String(err) },
        { status: 400 },
      )
    }
  }

  const metrics = computePatternMetrics(data)
  const row = await prisma.pattern.create({
    data: {
      type: 'CROSS_STITCH',
      name,
      data: data as unknown as object,
      ownerUserId: user.id,
      visibility: Visibility.PRIVATE,
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
    select: { id: true, slug: true },
  })

  return NextResponse.json({ id: row.id, slug: row.slug }, { status: 201 })
}

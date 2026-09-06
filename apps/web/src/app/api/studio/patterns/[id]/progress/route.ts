import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

/** Parking preferences ride the progress save: same per-project record,
 *  same beat, one write instead of two racing each other. Only the
 *  preferences persist; the parked squares are derived client-side from
 *  progress plus the working order. */
const Parking = z.object({
  enabled: z.boolean(),
  direction: z.enum(['rows', 'columns', 'blocks']),
  line: z.number().int().min(0).max(100000),
})

const Body = z.object({
  stitchedCells: z.record(z.string(), z.literal(true)),
  notes: z.string().nullable().optional(),
  parking: Parking.optional(),
})

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id: patternId } = await ctx.params
  const exists = await prisma.pattern.findUnique({ where: { id: patternId }, select: { id: true } })
  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  // A body without `parking` leaves the stored preferences alone, so an
  // older client saving progress can never switch parking off behind a
  // Maker's back.
  const parking = parsed.data.parking
    ? {
        parkingEnabled: parsed.data.parking.enabled,
        parkingDirection: parsed.data.parking.direction,
        parkingLine: parsed.data.parking.line,
      }
    : {}

  await prisma.userPatternProgress.upsert({
    where: { userId_patternId: { userId: user.id, patternId } },
    create: {
      userId: user.id,
      patternId,
      stitchedCells: parsed.data.stitchedCells,
      notes: parsed.data.notes ?? null,
      ...parking,
    },
    update: {
      stitchedCells: parsed.data.stitchedCells,
      notes: parsed.data.notes ?? null,
      lastStitchedAt: new Date(),
      ...parking,
    },
  })

  return NextResponse.json({ ok: true })
}

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id: patternId } = await ctx.params
  const row = await prisma.userPatternProgress.findUnique({
    where: { userId_patternId: { userId: user.id, patternId } },
    select: {
      stitchedCells: true,
      notes: true,
      startedAt: true,
      lastStitchedAt: true,
      parkingEnabled: true,
      parkingDirection: true,
      parkingLine: true,
    },
  })
  return NextResponse.json(
    row ?? {
      stitchedCells: {},
      notes: null,
      startedAt: null,
      lastStitchedAt: null,
      parkingEnabled: false,
      parkingDirection: 'rows',
      parkingLine: 0,
    },
  )
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ needleworkPatternId: string }>
}

const Body = z.object({
  completedCells: z.record(z.string(), z.literal(true)).optional(),
  completedRegions: z.record(z.string(), z.literal(true)).optional(),
  notes: z.string().nullable().optional(),
  currentPhase: z
    .enum(['DESIGN', 'TRANSFER', 'STITCHING', 'FINISHING'])
    .optional(),
})

export async function POST(req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { needleworkPatternId } = await ctx.params
  const exists = await prisma.needleworkPattern.findUnique({
    where: { id: needleworkPatternId },
    select: { id: true },
  })
  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Body.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const updateData: Record<string, unknown> = { lastWorkedAt: new Date() }
  if (parsed.data.completedCells !== undefined)
    updateData.completedCells = parsed.data.completedCells
  if (parsed.data.completedRegions !== undefined)
    updateData.completedRegions = parsed.data.completedRegions
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes ?? null
  if (parsed.data.currentPhase !== undefined)
    updateData.currentPhase = parsed.data.currentPhase

  await prisma.needleworkProjectProgress.upsert({
    where: { userId_needleworkPatternId: { userId: user.id, needleworkPatternId } },
    create: {
      userId: user.id,
      needleworkPatternId,
      completedCells: parsed.data.completedCells ?? {},
      completedRegions: parsed.data.completedRegions ?? {},
      notes: parsed.data.notes ?? null,
      currentPhase: parsed.data.currentPhase ?? 'STITCHING',
    },
    update: updateData,
  })

  return NextResponse.json({ ok: true })
}

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { needleworkPatternId } = await ctx.params
  const row = await prisma.needleworkProjectProgress.findUnique({
    where: { userId_needleworkPatternId: { userId: user.id, needleworkPatternId } },
    select: {
      currentPhase: true,
      completedCells: true,
      completedRegions: true,
      notes: true,
      startedAt: true,
      lastWorkedAt: true,
      completedAt: true,
    },
  })
  return NextResponse.json(
    row ?? {
      currentPhase: 'STITCHING',
      completedCells: {},
      completedRegions: {},
      notes: null,
      startedAt: null,
      lastWorkedAt: null,
      completedAt: null,
    },
  )
}

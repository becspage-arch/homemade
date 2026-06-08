import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

const Body = z.object({
  stitchedCells: z.record(z.string(), z.literal(true)),
  notes: z.string().nullable().optional(),
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

  await prisma.userPatternProgress.upsert({
    where: { userId_patternId: { userId: user.id, patternId } },
    create: {
      userId: user.id,
      patternId,
      stitchedCells: parsed.data.stitchedCells,
      notes: parsed.data.notes ?? null,
    },
    update: {
      stitchedCells: parsed.data.stitchedCells,
      notes: parsed.data.notes ?? null,
      lastStitchedAt: new Date(),
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
    select: { stitchedCells: true, notes: true, startedAt: true, lastStitchedAt: true },
  })
  return NextResponse.json(
    row ?? { stitchedCells: {}, notes: null, startedAt: null, lastStitchedAt: null },
  )
}

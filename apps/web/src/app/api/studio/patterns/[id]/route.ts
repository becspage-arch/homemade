import { NextResponse } from 'next/server'
import {
  prisma,
  parsePatternData,
  computePatternMetrics,
} from '@homemade/db'
import { z } from 'zod'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/studio/patterns/[id] — autosave entry point.
 *
 * Accepts a full pattern data payload (Zod-validated) or a partial
 * name update. Re-derives the denormalised counts on every save so
 * library cards never have to walk the JSON.
 */
const PatchSchema = z
  .object({
    data: z.unknown().optional(),
    name: z.string().min(1).max(120).optional(),
  })
  .refine((v) => v.data !== undefined || v.name !== undefined, {
    message: 'No fields to update',
  })

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id } = await ctx.params
  const existing = await prisma.pattern.findUnique({
    where: { id },
    select: { ownerUserId: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.ownerUserId !== user.id) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.name) updates.name = parsed.data.name
  if (parsed.data.data !== undefined) {
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
    updates.data = data
    updates.widthCells = metrics.widthCells
    updates.heightCells = metrics.heightCells
    updates.colourCount = metrics.colourCount
    updates.totalStitches = metrics.totalStitches
    updates.hasBackstitch = metrics.hasBackstitch
    updates.hasFrenchKnots = metrics.hasFrenchKnots
    updates.hasBeads = metrics.hasBeads
    updates.hasQuarterStitches = metrics.hasQuarterStitches
    updates.fabricCountSuggested = data.fabric.count
  }

  await prisma.pattern.update({ where: { id }, data: updates })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id } = await ctx.params
  const existing = await prisma.pattern.findUnique({
    where: { id },
    select: { ownerUserId: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.ownerUserId !== user.id) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  }
  await prisma.pattern.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

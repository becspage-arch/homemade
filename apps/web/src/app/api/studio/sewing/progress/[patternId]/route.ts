/**
 * Sewing project autosave endpoint. PATCH-only. The Studio's useAutosave
 * hook debounces state mutations into at-most-one PATCH per ~700ms
 * window.
 *
 * Body shape:
 *   { selectedSize?: string | null,
 *     stepsProgress?: Record<string, { completedAt, notes? }>,
 *     fabricChoice?: { widthCm, lengthCm, withNap } | null,
 *     notes?: string | null }
 *
 * Upserts the SewingPatternProject row keyed by (userId, patternId). Demo
 * patterns (id starts with "demo-") short-circuit because they don't
 * exist in the DB.
 */

import { NextResponse } from 'next/server'
import { prisma, Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

interface PatchBody {
  selectedSize?: string | null
  stepsProgress?: Record<string, { completedAt: string; notes?: string | null }>
  fabricChoice?: { widthCm?: number; lengthCm?: number; withNap?: boolean } | null
  notes?: string | null
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ patternId: string }> },
) {
  const { patternId } = await ctx.params
  if (patternId.startsWith('demo-')) {
    return NextResponse.json({ ok: true, skipped: 'demo' })
  }
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  let body: PatchBody
  try {
    body = (await req.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 })
  }

  const pattern = await prisma.sewingPattern.findUnique({ where: { id: patternId } })
  if (!pattern) return NextResponse.json({ error: 'not-found' }, { status: 404 })

  const update: Prisma.SewingPatternProjectUpdateInput = { lastWorkedAt: new Date() }
  if ('selectedSize' in body) update.selectedSize = body.selectedSize ?? null
  if ('stepsProgress' in body && body.stepsProgress) {
    update.stepsProgress = body.stepsProgress as Prisma.InputJsonValue
  }
  if ('fabricChoice' in body) {
    update.fabricChoice =
      body.fabricChoice === null
        ? Prisma.JsonNull
        : (body.fabricChoice as Prisma.InputJsonValue)
  }
  if ('notes' in body) update.notes = body.notes ?? null

  await prisma.sewingPatternProject.upsert({
    where: { userId_patternId: { userId: user.id, patternId } },
    create: {
      user: { connect: { id: user.id } },
      pattern: { connect: { id: patternId } },
      selectedSize: ('selectedSize' in body ? body.selectedSize : null) ?? null,
      stepsProgress: (body.stepsProgress ?? {}) as Prisma.InputJsonValue,
      fabricChoice:
        body.fabricChoice === null || body.fabricChoice === undefined
          ? Prisma.JsonNull
          : (body.fabricChoice as Prisma.InputJsonValue),
      notes: body.notes ?? null,
    },
    update,
  })

  return NextResponse.json({ ok: true })
}

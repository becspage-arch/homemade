import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { pickPlanUpdate } from '@/lib/sewing/plans'

/**
 *   GET    /api/me/sewing-plans/[id]
 *   PATCH  /api/me/sewing-plans/[id]
 *   DELETE /api/me/sewing-plans/[id]   (soft-delete: status = ARCHIVED)
 */

interface Ctx {
  params: Promise<{ id: string }>
}

async function loadOwnedPlan(userId: string, id: string) {
  return prisma.userSewingPlan.findFirst({ where: { id, userId } })
}

function serialise<T extends { startedAt: Date | null; completedAt: Date | null; createdAt: Date; updatedAt: Date }>(
  plan: T,
): Omit<T, 'startedAt' | 'completedAt' | 'createdAt' | 'updatedAt'> & {
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
} {
  return {
    ...plan,
    startedAt: plan.startedAt?.toISOString() ?? null,
    completedAt: plan.completedAt?.toISOString() ?? null,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }
}

export async function GET(_request: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const plan = await loadOwnedPlan(user.id, id)
  if (!plan) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json({ plan: serialise(plan) })
}

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const existing = await loadOwnedPlan(user.id, id)
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const update = pickPlanUpdate(body)

  const updated = await prisma.userSewingPlan.update({
    where: { id },
    data: update,
  })

  return NextResponse.json({ plan: serialise(updated) })
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const existing = await loadOwnedPlan(user.id, id)
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const updated = await prisma.userSewingPlan.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  })

  return NextResponse.json({ plan: serialise(updated) })
}

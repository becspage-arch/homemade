import { NextResponse } from 'next/server'

import { prisma, PlannerProjectStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

const STATUSES = new Set<string>(Object.values(PlannerProjectStatus))

interface PatchBody {
  status?: string
  position?: number
  notes?: string | null
  settings?: Record<string, unknown>
}

/**
 * Update or remove one planner project. Free signed-in: editing your own
 * queue (status, order, fabric-count settings, notes) is part of the saving
 * carrot. Ownership is enforced on every call.
 */
export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const existing = await prisma.plannerProject.findUnique({
    where: { id },
    select: { userId: true, startedAt: true, finishedAt: true },
  })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (body.status !== undefined) {
    if (!STATUSES.has(body.status)) {
      return NextResponse.json({ error: 'unknown status' }, { status: 400 })
    }
    data.status = body.status
    // Stamp the lifecycle timestamps the first time a maker moves a project on.
    if (body.status === 'IN_PROGRESS' && !existing.startedAt) data.startedAt = new Date()
    if (body.status === 'FINISHED' && !existing.finishedAt) data.finishedAt = new Date()
  }
  if (typeof body.position === 'number' && Number.isFinite(body.position)) {
    data.position = Math.max(0, Math.round(body.position))
  }
  if (body.notes !== undefined) {
    data.notes = typeof body.notes === 'string' ? body.notes : null
  }
  if (body.settings !== undefined && body.settings && typeof body.settings === 'object') {
    data.settings = body.settings
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  await prisma.plannerProject.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const existing = await prisma.plannerProject.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await prisma.plannerProject.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

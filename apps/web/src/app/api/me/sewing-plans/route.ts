import { NextResponse } from 'next/server'
import { prisma, type SewingPlanStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { asStatus, asTitle } from '@/lib/sewing/plans'

/**
 * Sewing plans. Saved + printable project plans. Free for any signed-in
 * user per the locked sign-in carrots.
 *
 *   GET  /api/me/sewing-plans?status=ACTIVE
 *     -> { plans: SewingPlanSummary[] }
 *
 *   POST /api/me/sewing-plans
 *     body: { title, patternSlug? }
 *     -> the newly-created plan row
 */

export async function GET(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const statusFilter = asStatus(url.searchParams.get('status'))

  const where: { userId: string; status?: SewingPlanStatus | { not: SewingPlanStatus } } = {
    userId: user.id,
  }
  if (statusFilter) {
    where.status = statusFilter
  } else {
    where.status = { not: 'ARCHIVED' }
  }

  const plans = await prisma.userSewingPlan.findMany({
    where,
    select: {
      id: true,
      title: true,
      status: true,
      patternSlug: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({
    plans: plans.map((p) => ({
      ...p,
      startedAt: p.startedAt?.toISOString() ?? null,
      completedAt: p.completedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const title = asTitle(body.title) ?? 'Untitled sewing plan'
  const patternSlug =
    typeof body.patternSlug === 'string' && body.patternSlug.trim()
      ? body.patternSlug.trim().slice(0, 200)
      : null

  const plan = await prisma.userSewingPlan.create({
    data: {
      userId: user.id,
      title,
      patternSlug,
    },
    select: {
      id: true,
      title: true,
      status: true,
      patternSlug: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({
    plan: {
      ...plan,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    },
  })
}

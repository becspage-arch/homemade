import { NextResponse } from 'next/server'
import { prisma, Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { canUseChartFeature } from '@/lib/feature-gates'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ tutorialId: string; chartIndex: string }>
}

interface PatchBody {
  markedCells?: string[]
  markedRows?: number[]
  markedSteps?: number[]
  viewMode?: string
  displayMode?: string
  paletteOverride?: unknown
  notes?: unknown
  timeSpentSecondsDelta?: number
}

const ALLOWED_VIEW_MODES = new Set(['symbol-on-colour', 'symbol-only', 'colour-only'])
const ALLOWED_DISPLAY_MODES = new Set(['all', 'stitched', 'remaining'])

/**
 * Read the signed-in user's progress for a single chart.
 *
 * Returns a fresh "empty" payload (no row exists yet) rather than 404
 * when the user has never touched the chart — the viewer treats both
 * shapes identically and avoiding a 404 makes the client simpler.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const { tutorialId, chartIndex: chartIndexStr } = await ctx.params
  const chartIndex = Number(chartIndexStr)
  if (!Number.isInteger(chartIndex) || chartIndex < 0) {
    return NextResponse.json({ error: 'Invalid chart index' }, { status: 400 })
  }

  const row = await prisma.chartProgress.findUnique({
    where: {
      userId_tutorialId_chartIndex: {
        userId: user.id,
        tutorialId,
        chartIndex,
      },
    },
  })

  return NextResponse.json({
    markedCells: row?.markedCells ?? [],
    markedRows: row?.markedRows ?? [],
    markedSteps: row?.markedSteps ?? [],
    viewMode: row?.viewMode ?? 'symbol-on-colour',
    displayMode: row?.displayMode ?? 'all',
    paletteOverride: row?.paletteOverride ?? null,
    notes: row?.notes ?? [],
    markedCount: row?.markedCount ?? 0,
    timeSpentSeconds: row?.timeSpentSeconds ?? 0,
    lastTouchedAt: row?.lastTouchedAt ?? null,
  })
}

/**
 * Patch the signed-in user's progress for a single chart. Upserts on
 * (userId, tutorialId, chartIndex). Fields omitted from the body are left
 * untouched.
 *
 * The client patches optimistically and the server is the durable store.
 * Concurrent device updates last-write-wins by `updatedAt`.
 */
export async function PATCH(req: Request, ctx: RouteContext) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  // The feature gate is a no-op today (any signed-in user is allowed)
  // but routing through it now means the Stripe / RBAC session can flip
  // mark-stitch / sync to premium-only in one place.
  if (!canUseChartFeature(user, 'chart.sync')) {
    return NextResponse.json({ error: 'Upgrade required' }, { status: 402 })
  }

  const { tutorialId, chartIndex: chartIndexStr } = await ctx.params
  const chartIndex = Number(chartIndexStr)
  if (!Number.isInteger(chartIndex) || chartIndex < 0) {
    return NextResponse.json({ error: 'Invalid chart index' }, { status: 400 })
  }

  let body: PatchBody
  try {
    body = (await req.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = { lastTouchedAt: new Date() }
  const createDefaults: Record<string, unknown> = {}

  if (Array.isArray(body.markedCells)) {
    const cells = body.markedCells.filter(
      (c): c is string => typeof c === 'string' && /^\d+,\d+$/.test(c),
    )
    update.markedCells = cells
    update.markedCount = cells.length
  }
  if (Array.isArray(body.markedRows)) {
    const rows = body.markedRows.filter(
      (r): r is number => Number.isInteger(r) && r >= 1 && r <= 100000,
    )
    update.markedRows = rows
    if (!Array.isArray(body.markedCells)) update.markedCount = rows.length
  }
  if (Array.isArray(body.markedSteps)) {
    const steps = body.markedSteps.filter(
      (s): s is number => Number.isInteger(s) && s >= 1 && s <= 1000,
    )
    update.markedSteps = steps
    if (!Array.isArray(body.markedCells) && !Array.isArray(body.markedRows)) {
      update.markedCount = steps.length
    }
  }
  if (typeof body.viewMode === 'string' && ALLOWED_VIEW_MODES.has(body.viewMode)) {
    update.viewMode = body.viewMode
  }
  if (typeof body.displayMode === 'string' && ALLOWED_DISPLAY_MODES.has(body.displayMode)) {
    update.displayMode = body.displayMode
  }
  if ('paletteOverride' in body) {
    update.paletteOverride = body.paletteOverride ?? Prisma.JsonNull
  }
  if (Array.isArray(body.notes)) {
    update.notes = body.notes as Prisma.InputJsonValue
  }
  if (typeof body.timeSpentSecondsDelta === 'number' && body.timeSpentSecondsDelta > 0) {
    // Increment relative to whatever the row currently holds; cap deltas
    // at one hour per patch to defend against runaway client timers.
    const delta = Math.min(Math.floor(body.timeSpentSecondsDelta), 3600)
    update.timeSpentSeconds = { increment: delta }
    createDefaults.timeSpentSeconds = delta
  }

  const row = await prisma.chartProgress.upsert({
    where: {
      userId_tutorialId_chartIndex: {
        userId: user.id,
        tutorialId,
        chartIndex,
      },
    },
    update,
    create: {
      userId: user.id,
      tutorialId,
      chartIndex,
      markedCells: (update.markedCells as string[]) ?? [],
      markedRows: (update.markedRows as number[]) ?? [],
      markedSteps: (update.markedSteps as number[]) ?? [],
      viewMode: (update.viewMode as string) ?? 'symbol-on-colour',
      displayMode: (update.displayMode as string) ?? 'all',
      paletteOverride:
        update.paletteOverride === null
          ? Prisma.JsonNull
          : (update.paletteOverride as Prisma.InputJsonValue | undefined),
      notes: (update.notes as Prisma.InputJsonValue | undefined) ?? [],
      markedCount: (update.markedCount as number) ?? 0,
      timeSpentSeconds: (createDefaults.timeSpentSeconds as number) ?? 0,
    },
  })

  return NextResponse.json({
    markedCells: row.markedCells,
    markedRows: row.markedRows,
    markedSteps: row.markedSteps,
    viewMode: row.viewMode,
    displayMode: row.displayMode,
    paletteOverride: row.paletteOverride,
    notes: row.notes,
    markedCount: row.markedCount,
    timeSpentSeconds: row.timeSpentSeconds,
    lastTouchedAt: row.lastTouchedAt,
  })
}

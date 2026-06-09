import { NextResponse } from 'next/server'

import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Per-user knitting project progress.
 *
 *   GET    /api/studio/knitting/progress/[knittingPatternId]
 *   PATCH  /api/studio/knitting/progress/[knittingPatternId]
 *
 * Persisted into KnittingProjectProgress (K-4 schema). Per
 * `feedback_free_signin_carrots`, server-side sync is a FREE feature so
 * the contract isn't gated behind premium. Signed-out users continue to
 * hit local-only storage via the Studio's autosave fallback; this route
 * 401s when there's no user.
 */

interface RouteContext {
  params: Promise<{ knittingPatternId: string }>
}

interface PatchBody {
  currentRow?: number
  currentRound?: number
  currentRepeat?: number
  currentStitchInRow?: number
  isOnRightSide?: boolean
  currentSection?: string | null
  completedRows?: Record<string, unknown>
  notes?: string | null
  perRowNotes?: Record<string, unknown>
  cableNeedles?: unknown[]
  cableNeedleNotes?: string | null
  selectedSize?: string | null
  selectedYarn?: string | null
  selectedNeedleSize?: number | null
  projectSetup?: Record<string, unknown> | null
  completedAt?: string | null
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { knittingPatternId } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const row = await prisma.knittingProjectProgress.findUnique({
    where: { userId_knittingPatternId: { userId: user.id, knittingPatternId } },
  })
  if (!row) {
    return NextResponse.json({
      knittingPatternId,
      currentRow: 1,
      currentRound: 1,
      currentRepeat: 1,
      currentStitchInRow: 1,
      isOnRightSide: true,
      currentSection: null,
      completedRows: {},
      notes: null,
      perRowNotes: {},
      cableNeedles: [],
      cableNeedleNotes: null,
      selectedSize: null,
      selectedYarn: null,
      selectedNeedleSize: null,
      projectSetup: null,
      lastWorkedAt: null,
      completedAt: null,
    })
  }
  return NextResponse.json({
    knittingPatternId,
    currentRow: row.currentRow,
    currentRound: row.currentRound,
    currentRepeat: row.currentRepeat,
    currentStitchInRow: row.currentStitchInRow,
    isOnRightSide: row.isOnRightSide,
    currentSection: row.currentSection,
    completedRows: row.completedRows,
    notes: row.notes,
    perRowNotes: row.perRowNotes,
    cableNeedles: row.cableNeedles,
    cableNeedleNotes: row.cableNeedleNotes,
    selectedSize: row.selectedSize,
    selectedYarn: row.selectedYarn,
    selectedNeedleSize: row.selectedNeedleSize ? Number(row.selectedNeedleSize) : null,
    projectSetup: row.projectSetup,
    lastWorkedAt: row.lastWorkedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { knittingPatternId } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const data: Record<string, unknown> = { lastWorkedAt: new Date() }
  if (typeof body.currentRow === 'number') data.currentRow = body.currentRow
  if (typeof body.currentRound === 'number') data.currentRound = body.currentRound
  if (typeof body.currentRepeat === 'number') data.currentRepeat = body.currentRepeat
  if (typeof body.currentStitchInRow === 'number') data.currentStitchInRow = body.currentStitchInRow
  if (typeof body.isOnRightSide === 'boolean') data.isOnRightSide = body.isOnRightSide
  if (body.currentSection !== undefined) data.currentSection = body.currentSection
  if (body.completedRows !== undefined) data.completedRows = body.completedRows
  if (body.notes !== undefined) data.notes = body.notes
  if (body.perRowNotes !== undefined) data.perRowNotes = body.perRowNotes
  if (body.cableNeedles !== undefined) data.cableNeedles = body.cableNeedles
  if (body.cableNeedleNotes !== undefined) data.cableNeedleNotes = body.cableNeedleNotes
  if (body.selectedSize !== undefined) data.selectedSize = body.selectedSize
  if (body.selectedYarn !== undefined) data.selectedYarn = body.selectedYarn
  if (body.selectedNeedleSize !== undefined) data.selectedNeedleSize = body.selectedNeedleSize
  if (body.projectSetup !== undefined) data.projectSetup = body.projectSetup
  if (body.completedAt !== undefined) {
    data.completedAt = body.completedAt ? new Date(body.completedAt) : null
  }

  const row = await prisma.knittingProjectProgress.upsert({
    where: { userId_knittingPatternId: { userId: user.id, knittingPatternId } },
    create: {
      userId: user.id,
      knittingPatternId,
      currentRow: typeof body.currentRow === 'number' ? body.currentRow : 1,
      currentRound: typeof body.currentRound === 'number' ? body.currentRound : 1,
      currentRepeat: typeof body.currentRepeat === 'number' ? body.currentRepeat : 1,
      currentStitchInRow:
        typeof body.currentStitchInRow === 'number' ? body.currentStitchInRow : 1,
      isOnRightSide: typeof body.isOnRightSide === 'boolean' ? body.isOnRightSide : true,
      currentSection: body.currentSection ?? null,
      completedRows: (body.completedRows ?? {}) as object,
      notes: body.notes ?? null,
      perRowNotes: (body.perRowNotes ?? {}) as object,
      cableNeedles: (body.cableNeedles ?? []) as object,
      cableNeedleNotes: body.cableNeedleNotes ?? null,
      selectedSize: body.selectedSize ?? null,
      selectedYarn: body.selectedYarn ?? null,
      selectedNeedleSize: body.selectedNeedleSize ?? null,
      projectSetup: body.projectSetup === undefined ? undefined : (body.projectSetup as object),
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
    },
    update: data,
  })

  return NextResponse.json({
    ok: true,
    lastWorkedAt: row.lastWorkedAt.toISOString(),
  })
}

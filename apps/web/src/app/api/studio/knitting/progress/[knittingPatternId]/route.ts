import { NextResponse } from 'next/server'

import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Per-user knitting project progress.
 *
 *   GET    /api/studio/knitting/progress/[knittingPatternId]
 *   PATCH  /api/studio/knitting/progress/[knittingPatternId]
 *
 * v1 status: the KnittingProjectProgress Prisma model is K-4
 * follow-on (lands alongside the dedicated KnittingPattern model).
 * The Studio's autosave path is wired now — once the model arrives,
 * this route persists; until then it accepts the payload and replies
 * 204 No Content so signed-in makers never see a sync error.
 *
 * Per the locked free-tier-sign-in-carrots memory rule, server-side
 * sync is a FREE feature; the contract here doesn't gate behind
 * premium. Today the body is accepted, persistence pending K-4.
 */

interface RouteContext {
  params: Promise<{ knittingPatternId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { knittingPatternId } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  // v1: persistence lands with K-4. Until then, return the empty
  // shape so the client treats it as a brand-new project.
  return NextResponse.json({
    knittingPatternId,
    currentRow: 0,
    currentSection: null,
    completedRows: {},
    notes: null,
    perRowNotes: {},
    currentRound: 0,
    currentRepeat: 0,
    currentStitch: 1,
    rightSide: true,
    cableNeedles: [],
    lastWorkedAt: null,
    completedAt: null,
    projectSetup: null,
  })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  // Drain the body so the client doesn't see a stalled connection.
  try {
    await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  // K-4 follow-on persists into KnittingProjectProgress here. Until
  // then, 204 No Content tells the client "accepted, nothing to
  // echo back".
  return new NextResponse(null, { status: 204 })
}

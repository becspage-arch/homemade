import { NextResponse } from 'next/server'
import { prisma, type Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Per-user crochet project progress.
 *
 *   GET    /api/studio/crochet/progress/[crochetPatternId]
 *     → { currentRow, currentSection, completedRows, notes, perRowNotes,
 *         gradedSize, customMeasurements, leftHandedOverride,
 *         terminologyOverride, preferredView, countByCluster,
 *         lastWorkedAt, completedAt }
 *
 *   PATCH  /api/studio/crochet/progress/[crochetPatternId]
 *     Body — any subset of the GET shape. The server upserts into
 *     CrochetProjectProgress keyed by (userId, crochetPatternId).
 *
 * Returns 401 when the user isn't signed in. Returns 404 when the
 * CrochetPattern doesn't exist or isn't visible to the user.
 */

interface RouteContext {
  params: Promise<{ crochetPatternId: string }>
}

interface ProgressPayload {
  currentRow?: number
  currentSection?: string | null
  completedRows?: Record<string, number[]>
  notes?: string | null
  perRowNotes?: Record<string, string>
  gradedSize?: string | null
  customMeasurements?: Record<string, number> | null
  leftHandedOverride?: boolean | null
  terminologyOverride?: 'uk' | 'us' | null
  preferredView?: 'written' | 'chart' | 'schematic' | null
  countByCluster?: boolean
  completedAt?: string | null
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { crochetPatternId } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const pattern = await prisma.crochetPattern.findUnique({
    where: { id: crochetPatternId },
    select: { id: true, ownerUserId: true, visibility: true, publishedAt: true },
  })
  if (!pattern) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const progress = await prisma.crochetProjectProgress.findUnique({
    where: { userId_crochetPatternId: { userId: user.id, crochetPatternId } },
    select: {
      currentRow: true,
      currentSection: true,
      completedRows: true,
      notes: true,
      perRowNotes: true,
      gradedSize: true,
      customMeasurements: true,
      leftHandedOverride: true,
      terminologyOverride: true,
      preferredView: true,
      countByCluster: true,
      lastWorkedAt: true,
      completedAt: true,
    },
  })

  if (!progress) {
    return NextResponse.json({
      currentRow: 0,
      currentSection: null,
      completedRows: {},
      notes: null,
      perRowNotes: {},
      gradedSize: null,
      customMeasurements: null,
      leftHandedOverride: null,
      terminologyOverride: null,
      preferredView: null,
      countByCluster: false,
      lastWorkedAt: null,
      completedAt: null,
    })
  }

  return NextResponse.json({
    ...progress,
    lastWorkedAt: progress.lastWorkedAt.toISOString(),
    completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
  })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { crochetPatternId } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const pattern = await prisma.crochetPattern.findUnique({
    where: { id: crochetPatternId },
    select: { id: true },
  })
  if (!pattern) return NextResponse.json({ error: 'not found' }, { status: 404 })

  let payload: ProgressPayload
  try {
    payload = (await request.json()) as ProgressPayload
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const updateData: Prisma.CrochetProjectProgressUncheckedUpdateInput = {
    lastWorkedAt: new Date(),
  }
  if (payload.currentRow !== undefined) updateData.currentRow = payload.currentRow
  if (payload.currentSection !== undefined) updateData.currentSection = payload.currentSection
  if (payload.completedRows !== undefined) updateData.completedRows = payload.completedRows
  if (payload.notes !== undefined) updateData.notes = payload.notes
  if (payload.perRowNotes !== undefined) updateData.perRowNotes = payload.perRowNotes
  if (payload.gradedSize !== undefined) updateData.gradedSize = payload.gradedSize
  if (payload.customMeasurements !== undefined) updateData.customMeasurements = payload.customMeasurements ?? undefined
  if (payload.leftHandedOverride !== undefined) updateData.leftHandedOverride = payload.leftHandedOverride
  if (payload.terminologyOverride !== undefined) updateData.terminologyOverride = payload.terminologyOverride
  if (payload.preferredView !== undefined) updateData.preferredView = payload.preferredView
  if (payload.countByCluster !== undefined) updateData.countByCluster = payload.countByCluster
  if (payload.completedAt !== undefined) {
    updateData.completedAt = payload.completedAt ? new Date(payload.completedAt) : null
  }

  const createData: Prisma.CrochetProjectProgressUncheckedCreateInput = {
    userId: user.id,
    crochetPatternId,
    currentRow: payload.currentRow ?? 0,
    currentSection: payload.currentSection ?? null,
    completedRows: payload.completedRows ?? {},
    notes: payload.notes ?? null,
    perRowNotes: payload.perRowNotes ?? {},
    gradedSize: payload.gradedSize ?? null,
    customMeasurements: payload.customMeasurements ?? undefined,
    leftHandedOverride: payload.leftHandedOverride ?? null,
    terminologyOverride: payload.terminologyOverride ?? null,
    preferredView: payload.preferredView ?? null,
    countByCluster: payload.countByCluster ?? false,
    completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
  }

  await prisma.crochetProjectProgress.upsert({
    where: { userId_crochetPatternId: { userId: user.id, crochetPatternId } },
    update: updateData,
    create: createData,
  })

  return NextResponse.json({ ok: true })
}

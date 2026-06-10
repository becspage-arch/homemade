/**
 * Server-side loaders for the sewing Studio. Mirrors the knitting
 * load-pattern split: load by slug for the real DB rows, hand-crafted
 * demo for ?demo=1.
 *
 * The DB row's pieces, fabric requirements, and cutting layouts are
 * Prisma Json. The loader sanitises them into the strongly-typed shape
 * the client surfaces consume. Bad shapes are dropped silently so a
 * partly-authored row still renders something rather than crashing.
 */

import { prisma } from '@homemade/db'

import type {
  MySewingProjectListItem,
  SewingCuttingLayout,
  SewingFabricRequirement,
  SewingNotion,
  SewingPatternData,
  SewingPiece,
  SewingProjectProgressData,
  SewingSize,
  SewingTipTapDoc,
} from '@/components/studio/sewing/types'
import { loadDemoSewingPattern } from './demo-pattern'

interface LoadArgs {
  slug?: string
  id?: string
}

interface PrismaDecimalLike {
  toString(): string
}
function decimalToNumber(value: PrismaDecimalLike | null | undefined): number | null {
  if (value === null || value === undefined) return null
  return Number(value.toString())
}

export async function loadSewingPatternForStudio(
  args: LoadArgs,
): Promise<SewingPatternData | null> {
  if (!args.slug && !args.id) return null
  const row = await prisma.sewingPattern.findFirst({
    where: args.slug ? { slug: args.slug } : { id: args.id },
    include: { designer: { select: { displayName: true } } },
  })
  if (!row) return null
  return sanitiseRow(row)
}

export { loadDemoSewingPattern }

export async function loadSewingProjectsForUser(
  userId: string,
): Promise<MySewingProjectListItem[]> {
  const rows = await prisma.sewingPatternProject.findMany({
    where: { userId, status: { not: 'ARCHIVED' } },
    include: {
      pattern: { select: { id: true, name: true, slug: true, instructionsBody: true } },
    },
    orderBy: { lastWorkedAt: 'desc' },
    take: 60,
  })
  return rows.map((r) => {
    const stepsTotal = countInstructionSteps(r.pattern.instructionsBody as unknown)
    const stepsCompleted = countCompletedSteps(r.stepsProgress as unknown)
    return {
      id: r.id,
      patternId: r.pattern.id,
      patternName: r.pattern.name,
      patternSlug: r.pattern.slug,
      status: r.status,
      selectedSize: r.selectedSize,
      lastWorkedAt: r.lastWorkedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      stepsCompleted,
      stepsTotal,
    }
  })
}

export async function loadSewingProjectForUser(
  userId: string,
  patternId: string,
): Promise<SewingProjectProgressData | null> {
  const row = await prisma.sewingPatternProject.findUnique({
    where: { userId_patternId: { userId, patternId } },
  })
  if (!row) return null
  const stepsProgress = (row.stepsProgress as unknown) as Record<
    string,
    { completedAt: string; notes?: string | null }
  >
  return {
    projectId: row.id,
    selectedSize: row.selectedSize,
    stepsProgress: stepsProgress && typeof stepsProgress === 'object' ? stepsProgress : {},
    fabricChoice: (row.fabricChoice as unknown) as SewingProjectProgressData['fabricChoice'],
    notes: row.notes,
  }
}

function countInstructionSteps(body: unknown): number {
  if (!body || typeof body !== 'object') return 0
  const doc = body as { content?: Array<{ type?: string; attrs?: { level?: number } }> }
  if (!Array.isArray(doc.content)) return 0
  let count = 0
  for (const node of doc.content) {
    if (node.type === 'heading' && node.attrs?.level === 3) count++
  }
  return count
}

function countCompletedSteps(progress: unknown): number {
  if (!progress || typeof progress !== 'object') return 0
  return Object.keys(progress).length
}

// ───── Sanitisers ─────────────────────────────────────────────────────

interface PatternRow {
  id: string
  slug: string
  name: string
  description: string | null
  designerId: string | null
  designer: { displayName: string } | null
  garmentCategory: string
  garmentType: string | null
  skillLevel: string
  seamAllowanceIncluded: boolean
  seamAllowanceCm: PrismaDecimalLike | null
  supportedSizes: unknown
  pieceList: unknown
  instructionsBody: unknown
  recommendedNotions: unknown
  fabricRequirementsCm: unknown
  cuttingLayouts: unknown
  attributionText: string | null
}

function sanitiseRow(row: PatternRow): SewingPatternData {
  const supportedSizes = sanitiseSizes(row.supportedSizes)
  const pieces = sanitisePieces(row.pieceList)
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    designerName: row.designer?.displayName ?? null,
    garmentCategory: row.garmentCategory,
    garmentType: row.garmentType,
    skillLevel: row.skillLevel,
    seamAllowanceIncluded: row.seamAllowanceIncluded,
    seamAllowanceCm: decimalToNumber(row.seamAllowanceCm),
    supportedSizes,
    defaultSize: supportedSizes[0]?.name ?? 'M',
    pieces,
    instructionsBody: sanitiseTipTap(row.instructionsBody),
    recommendedNotions: sanitiseNotions(row.recommendedNotions),
    fabricRequirements: sanitiseFabricRequirements(row.fabricRequirementsCm),
    cuttingLayouts: sanitiseCuttingLayouts(row.cuttingLayouts),
    attributionText: row.attributionText,
  }
}

function sanitiseSizes(raw: unknown): SewingSize[] {
  if (!Array.isArray(raw)) return []
  const out: SewingSize[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    if (typeof obj.name !== 'string') continue
    const body = obj.body && typeof obj.body === 'object' ? (obj.body as Record<string, number>) : {}
    out.push({ name: obj.name, body })
  }
  return out
}

function sanitisePieces(raw: unknown): SewingPiece[] {
  if (!Array.isArray(raw)) return []
  const out: SewingPiece[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    if (typeof obj.name !== 'string') continue
    const pathPoints = sanitiseVertices(obj.pathPoints)
    if (pathPoints.length < 3) continue
    out.push({
      name: obj.name,
      cut: typeof obj.cut === 'number' ? obj.cut : 1,
      fold: obj.fold === 'on-fold' ? 'on-fold' : null,
      grainDirection:
        obj.grainDirection === 'crosswise'
          ? 'crosswise'
          : obj.grainDirection === 'bias'
          ? 'bias'
          : 'lengthwise',
      pathPoints,
      grainline: sanitiseLine(obj.grainline, pathPoints),
      notchPoints: sanitiseVertices(obj.notchPoints),
      onFoldEdge: obj.onFoldEdge ? sanitiseLine(obj.onFoldEdge, pathPoints) : null,
      label: typeof obj.label === 'string' ? obj.label : null,
    })
  }
  return out
}

function sanitiseVertices(raw: unknown): { x: number; y: number }[] {
  if (!Array.isArray(raw)) return []
  const out: { x: number; y: number }[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    if (typeof obj.x !== 'number' || typeof obj.y !== 'number') continue
    out.push({ x: obj.x, y: obj.y })
  }
  return out
}

function sanitiseLine(
  raw: unknown,
  fallback: { x: number; y: number }[],
): { from: { x: number; y: number }; to: { x: number; y: number } } {
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    const from = obj.from && typeof obj.from === 'object' ? (obj.from as Record<string, unknown>) : null
    const to = obj.to && typeof obj.to === 'object' ? (obj.to as Record<string, unknown>) : null
    if (
      from &&
      to &&
      typeof from.x === 'number' &&
      typeof from.y === 'number' &&
      typeof to.x === 'number' &&
      typeof to.y === 'number'
    ) {
      return {
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
      }
    }
  }
  return {
    from: fallback[0] ?? { x: 0, y: 0 },
    to: fallback[1] ?? { x: 0, y: 0 },
  }
}

function sanitiseTipTap(raw: unknown): SewingTipTapDoc | null {
  if (!raw || typeof raw !== 'object') return null
  const doc = raw as { type?: string; content?: unknown }
  if (doc.type !== 'doc') return null
  return doc as SewingTipTapDoc
}

function sanitiseNotions(raw: unknown): SewingNotion[] {
  if (!Array.isArray(raw)) return []
  const out: SewingNotion[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    if (typeof obj.name !== 'string') continue
    out.push({
      name: obj.name,
      spec: typeof obj.spec === 'string' ? obj.spec : null,
      quantity: typeof obj.quantity === 'number' ? obj.quantity : 1,
      notes: typeof obj.notes === 'string' ? obj.notes : null,
    })
  }
  return out
}

function sanitiseFabricRequirements(
  raw: unknown,
): Record<string, SewingFabricRequirement[]> {
  if (!raw || typeof raw !== 'object') return {}
  const obj = raw as Record<string, unknown>
  const out: Record<string, SewingFabricRequirement[]> = {}
  for (const [size, value] of Object.entries(obj)) {
    if (!Array.isArray(value)) continue
    const reqs: SewingFabricRequirement[] = []
    for (const v of value) {
      if (!v || typeof v !== 'object') continue
      const r = v as Record<string, unknown>
      if (typeof r.widthCm !== 'number') continue
      reqs.push({
        widthCm: r.widthCm,
        lengthCmNoNap:
          typeof r.lengthCmNoNap === 'number'
            ? r.lengthCmNoNap
            : typeof r.lengthCm === 'number'
            ? r.lengthCm
            : 0,
        lengthCmWithNap:
          typeof r.lengthCmWithNap === 'number'
            ? r.lengthCmWithNap
            : typeof r.lengthCm === 'number'
            ? r.lengthCm * 1.2
            : 0,
      })
    }
    if (reqs.length) out[size] = reqs
  }
  return out
}

function sanitiseCuttingLayouts(raw: unknown): Record<string, SewingCuttingLayout[]> {
  if (!raw || typeof raw !== 'object') return {}
  const obj = raw as Record<string, unknown>
  const out: Record<string, SewingCuttingLayout[]> = {}
  for (const [size, value] of Object.entries(obj)) {
    if (!Array.isArray(value)) continue
    const layouts: SewingCuttingLayout[] = []
    for (const v of value) {
      if (!v || typeof v !== 'object') continue
      const r = v as Record<string, unknown>
      if (typeof r.widthCm !== 'number') continue
      const placements = Array.isArray(r.placements)
        ? r.placements
            .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === 'object'))
            .map((p) => ({
              pieceIndex: typeof p.pieceIndex === 'number' ? p.pieceIndex : 0,
              x: typeof p.x === 'number' ? p.x : 0,
              y: typeof p.y === 'number' ? p.y : 0,
              rotation: typeof p.rotation === 'number' ? p.rotation : 0,
              onFold: p.onFold === true,
            }))
        : []
      layouts.push({
        widthCm: r.widthCm,
        withNap: r.withNap === true,
        totalLengthCm: typeof r.totalLengthCm === 'number' ? r.totalLengthCm : 0,
        placements,
      })
    }
    if (layouts.length) out[size] = layouts
  }
  return out
}

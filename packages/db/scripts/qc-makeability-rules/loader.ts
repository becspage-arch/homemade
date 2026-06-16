/**
 * Prisma-aware loader for the makeability gate. The rule files in this
 * directory are pure; this module is the one place that touches Prisma to:
 *   1. pull the row + its linked craft-pattern rows, and
 *   2. resolve chart-rendering body nodes (patternInset/craftChart) to the
 *      Pattern row they reference, so "has a real chart" is a fact, not a guess.
 *
 * `MAKEABILITY_SELECT` is the canonical select; `buildContexts` turns a batch of
 * selected rows into ready-to-audit `MakeabilityContext` objects (resolving all
 * inset patternIds in one extra query). `buildContextForRow` does the same for a
 * single row on the publish path.
 */
import type { PrismaClient } from '@prisma/client'
import { EMPTY_CHART_FACTS, type ChartFacts, type MakeabilityContext } from './shared.js'

export const MAKEABILITY_SELECT = {
  id: true, slug: true, title: true, type: true, body: true,
  servings: true, yieldDescription: true, totalMinutes: true,
  timeMinutes: true, prepMinutes: true, cookMinutes: true,
  gaugeText: true, finishedSizeText: true, chartDefinition: true, difficulty: true,
  practiceType: true, requiresMedicalDisclaimer: true, sourceNotes: true,
  category: { select: { slug: true } },
  subCategory: { select: { slug: true } },
  pattern: { select: { id: true, data: true, totalStitches: true, designerId: true } },
  patternsSourced: { select: { id: true, data: true, totalStitches: true, designerId: true } },
  crochetPattern: { select: { id: true, chartData: true } },
  crochetPatternsSourced: { select: { id: true, chartData: true } },
  needleworkPattern: { select: { id: true, chartData: true } },
  needleworkPatternsSourced: { select: { id: true, chartData: true } },
  needleworkPatternsInset: { select: { id: true, chartData: true } },
  knittingPatternsInset: { select: { id: true, chartData: true } },
} as const

type Row = {
  slug: string; title: string; type: string; body: unknown
  servings: number | null; yieldDescription: string | null
  totalMinutes: number | null; timeMinutes: number | null
  prepMinutes: number | null; cookMinutes: number | null
  gaugeText: string | null; finishedSizeText: string | null
  chartDefinition: unknown; difficulty: string | null; practiceType: string | null
  requiresMedicalDisclaimer: boolean; sourceNotes: string | null
  category: { slug: string }; subCategory: { slug: string } | null
  pattern: { id: string; data: unknown; totalStitches: number; designerId: string | null } | null
  patternsSourced: { id: string; data: unknown; totalStitches: number; designerId: string | null }[]
  crochetPattern: { id: string; chartData: unknown } | null
  crochetPatternsSourced: { id: string; chartData: unknown }[]
  needleworkPattern: { id: string; chartData: unknown } | null
  needleworkPatternsSourced: { id: string; chartData: unknown }[]
  needleworkPatternsInset: { id: string; chartData: unknown }[]
  knittingPatternsInset: { id: string; chartData: unknown }[]
}

const CHART_NODE_TYPES = new Set([
  'craftChart', 'crochetPatternInset', 'patternInset', 'needleworkPatternInset',
  'knittingChart', 'chartGrid', 'chart',
])

interface AnyNode { type?: string; attrs?: Record<string, unknown>; content?: unknown[] }

/** Collect chart-node presence + any patternId a chart node references. */
function scanChartNodes(body: unknown): { hasChartNode: boolean; patternIds: string[] } {
  let hasChartNode = false
  const patternIds: string[] = []
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const node = n as AnyNode
    if (node.type && CHART_NODE_TYPES.has(node.type)) {
      hasChartNode = true
      const pid = node.attrs?.patternId
      if (typeof pid === 'string' && pid.trim()) patternIds.push(pid.trim())
    }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return { hasChartNode, patternIds }
}

/** Cross-stitch / counted-pattern data facts read off a Pattern.data blob.
 *  Shape (verified against live rows): { grid: { cells[], backstitch[],
 *  frenchKnots[], width, height }, fabric: { type, count }, palette: [{ symbol,
 *  brand, code, name, rgb }], metadata: { designer } }. */
export function crossStitchDataFacts(
  data: unknown,
  flags?: { hasBackstitch?: boolean; hasFrenchKnots?: boolean },
): Pick<ChartFacts,
  'crossStitchChart' | 'stitchKeyValid' | 'fabricSpecified' | 'gridDimensions' |
  'backstitchUsed' | 'backstitchData' | 'frenchKnotsUsed' | 'frenchKnotsData'> {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const grid = (d.grid && typeof d.grid === 'object' ? d.grid : {}) as Record<string, unknown>
  const fabric = (d.fabric && typeof d.fabric === 'object' ? d.fabric : {}) as Record<string, unknown>
  const palette = Array.isArray(d.palette) ? (d.palette as Record<string, unknown>[]) : []

  const cells = Array.isArray(grid.cells) ? grid.cells : []
  const backstitch = Array.isArray(grid.backstitch) ? grid.backstitch : []
  const frenchKnots = Array.isArray(grid.frenchKnots) ? grid.frenchKnots : []
  const w = typeof grid.width === 'number' ? grid.width : 0
  const h = typeof grid.height === 'number' ? grid.height : 0

  const stitchKeyValid =
    palette.length > 0 &&
    palette.every((p) =>
      p && typeof p === 'object' &&
      typeof p.symbol === 'string' && (p.symbol as string).trim().length > 0 &&
      typeof p.brand === 'string' && (p.brand as string).trim().length > 0 &&
      typeof p.code === 'string' && (p.code as string).trim().length > 0 &&
      (typeof p.name === 'string' && (p.name as string).trim().length > 0 ||
        typeof p.rgb === 'string' && (p.rgb as string).trim().length > 0))

  const fabricSpecified =
    typeof fabric.type === 'string' && (fabric.type as string).trim().length > 0 &&
    typeof fabric.count === 'number' && (fabric.count as number) > 0

  return {
    crossStitchChart: cells.length > 0,
    stitchKeyValid,
    fabricSpecified,
    gridDimensions: w > 0 && h > 0,
    backstitchUsed: !!flags?.hasBackstitch || backstitch.length > 0,
    backstitchData: backstitch.length > 0,
    frenchKnotsUsed: !!flags?.hasFrenchKnots || frenchKnots.length > 0,
    frenchKnotsData: frenchKnots.length > 0,
  }
}

function chartFacts(row: Row, insetSymbolById: Map<string, boolean>): ChartFacts {
  const crossLinked = row.pattern ?? row.patternsSourced[0] ?? null
  const crochetLinked = row.crochetPattern ?? row.crochetPatternsSourced[0] ?? null
  const nwLinked = row.needleworkPattern ?? row.needleworkPatternsSourced[0] ?? row.needleworkPatternsInset[0] ?? null
  const knitLinked = row.knittingPatternsInset[0] ?? null

  const { hasChartNode, patternIds } = scanChartNodes(row.body)
  const insetChartWithSymbols = patternIds.some((id) => insetSymbolById.get(id) === true)
  const xs = crossLinked ? crossStitchDataFacts(crossLinked.data) : null

  return {
    ...EMPTY_CHART_FACTS,
    tutorialChartDefinition: row.chartDefinition != null,
    crochetChartData: !!(crochetLinked && crochetLinked.chartData != null),
    knittingChartData: !!(knitLinked && knitLinked.chartData != null),
    needleworkChartData: !!(nwLinked && nwLinked.chartData != null),
    crossStitchChart: !!(crossLinked && crossLinked.data != null && crossLinked.totalStitches > 0),
    insetChartWithSymbols,
    hasChartNode,
    ...(xs ?? {}),
  }
}

function hasDesigner(row: Row): boolean {
  return !!(row.pattern?.designerId || row.patternsSourced[0]?.designerId)
}

function toContext(row: Row, facts: ChartFacts): MakeabilityContext {
  return {
    slug: row.slug,
    title: row.title,
    categorySlug: row.category.slug,
    subCategorySlug: row.subCategory?.slug ?? null,
    type: row.type,
    body: row.body,
    servings: row.servings,
    yieldDescription: row.yieldDescription,
    totalMinutes: row.totalMinutes,
    timeMinutes: row.timeMinutes,
    prepMinutes: row.prepMinutes,
    cookMinutes: row.cookMinutes,
    gaugeText: row.gaugeText,
    finishedSizeText: row.finishedSizeText,
    difficulty: row.difficulty,
    practiceType: row.practiceType,
    requiresMedicalDisclaimer: row.requiresMedicalDisclaimer,
    sourceNotes: row.sourceNotes,
    hasDesigner: hasDesigner(row),
    chart: facts,
  }
}

/** Resolve which of the given Pattern ids carry a real chart (data + stitches). */
async function loadInsetSymbolMap(prisma: PrismaClient, ids: string[]): Promise<Map<string, boolean>> {
  const map = new Map<string, boolean>()
  if (ids.length === 0) return map
  const patterns = await prisma.pattern.findMany({
    where: { id: { in: Array.from(new Set(ids)) } },
    select: { id: true, data: true, totalStitches: true },
  })
  for (const p of patterns) {
    map.set(p.id, p.data != null && (p.totalStitches > 0 || isNonEmptyData(p.data)))
  }
  return map
}

function isNonEmptyData(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  // cross-stitch / chart grids carry cells / stitches / grid arrays
  for (const key of ['cells', 'stitches', 'grid', 'rows', 'symbols']) {
    const v = obj[key]
    if (Array.isArray(v) && v.length > 0) return true
    if (v && typeof v === 'object' && Object.keys(v).length > 0) return true
  }
  return Object.keys(obj).length > 0
}

/** Build audit contexts for a batch of selected rows (one extra query). */
export async function buildContexts(prisma: PrismaClient, rows: Row[]): Promise<MakeabilityContext[]> {
  const allInsetIds: string[] = []
  for (const r of rows) allInsetIds.push(...scanChartNodes(r.body).patternIds)
  const insetSymbolById = await loadInsetSymbolMap(prisma, allInsetIds)
  return rows.map((r) => toContext(r, chartFacts(r, insetSymbolById)))
}

/** Build a single audit context (publish path). */
export async function buildContextForRow(prisma: PrismaClient, row: Row): Promise<MakeabilityContext> {
  const insetSymbolById = await loadInsetSymbolMap(prisma, scanChartNodes(row.body).patternIds)
  return toContext(row, chartFacts(row, insetSymbolById))
}

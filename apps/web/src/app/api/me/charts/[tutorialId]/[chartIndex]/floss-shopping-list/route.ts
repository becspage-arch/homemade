import { NextResponse } from 'next/server'
import { prisma, TutorialStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ tutorialId: string; chartIndex: string }>
}

/**
 * Floss-shopping-list export — currently a stub that returns the
 * palette + per-key cell totals so the UI can build against a real
 * shape. The real generator (skein estimate per colour, brand-aware
 * cross-reference, paper / PDF export) ships in a follow-up worker.
 *
 * Phase location_climate_paper_001 — Part 5 stub.
 *
 * Premium-gated in a later phase via config flag only; no UI gating
 * built in. The endpoint is callable for any signed-in user.
 *
 * Sign-in required: charts as a whole require sign-in to view, and
 * the export endpoint inherits that gate so we don't accidentally
 * publish the palette via an unauthenticated URL.
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

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
    select: { id: true, slug: true, status: true, body: true },
  })
  if (!tutorial || tutorial.status !== TutorialStatus.PUBLISHED) {
    return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
  }

  const chart = findCrossStitchChart(tutorial.body, chartIndex)
  if (!chart) {
    return NextResponse.json({ error: 'Chart not found at that index' }, { status: 404 })
  }

  // Stub: count cells per palette key + echo the palette entries. A
  // future worker will turn this into a paper-sized PDF + skein
  // estimate including waste allowance + brand cross-references.
  const counts = new Map<string, number>()
  for (const cell of chart.cells ?? []) {
    counts.set(cell.paletteKey, (counts.get(cell.paletteKey) ?? 0) + 1)
  }

  const items = (chart.palette ?? []).map((entry) => ({
    key: entry.key,
    name: entry.name,
    hex: entry.hex,
    dmcCode: entry.dmcCode ?? null,
    anchorCode: entry.anchorCode ?? null,
    skeinEstimate: entry.skeinEstimate ?? null,
    stitchCount: counts.get(entry.key) ?? 0,
  }))

  return NextResponse.json({
    stub: true,
    tutorialId,
    tutorialSlug: tutorial.slug,
    chartIndex,
    title: chart.title ?? null,
    fabricCount: chart.fabricCount ?? null,
    finishedSizeText: chart.finishedSizeText ?? null,
    items,
  })
}

interface CrossStitchChartShape {
  title?: string
  fabricCount?: number
  finishedSizeText?: string
  palette?: Array<{
    key: string
    name: string
    hex: string
    dmcCode?: string
    anchorCode?: string
    skeinEstimate?: string
  }>
  cells?: Array<{ paletteKey: string }>
}

interface TipTapNode {
  type?: string
  attrs?: { definition?: unknown }
  content?: TipTapNode[]
}

/**
 * Walk the tutorial body's top-level nodes, count the crossStitchChart
 * occurrences, return the one at the requested index.
 */
function findCrossStitchChart(body: unknown, chartIndex: number): CrossStitchChartShape | null {
  if (!body || typeof body !== 'object') return null
  const doc = body as TipTapNode
  if (!Array.isArray(doc.content)) return null
  let i = 0
  for (const node of doc.content) {
    if (node.type === 'crossStitchChart') {
      if (i === chartIndex) {
        const def = node.attrs?.definition
        if (def && typeof def === 'object') return def as CrossStitchChartShape
        return null
      }
      i += 1
    }
  }
  return null
}

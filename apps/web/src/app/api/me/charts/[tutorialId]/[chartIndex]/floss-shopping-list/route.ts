import { NextResponse } from 'next/server'
import { prisma, TutorialStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ tutorialId: string; chartIndex: string }>
}

/**
 * Floss-shopping-list export — palette + per-colour cell count + skein
 * estimate. The reader hits this when they want to buy the floss for a
 * pattern without scrolling the chart.
 *
 * Phase location_climate_paper_001 — Part 5.
 *
 * Premium-gated in a later phase via config flag only; no UI gating
 * built in. The endpoint is callable for any signed-in user.
 *
 * Sign-in required: charts as a whole require sign-in to view, and the
 * export endpoint inherits that gate so we don't accidentally publish
 * the palette via an unauthenticated URL.
 *
 * PDF + brand-aware cross-reference (DMC ↔ Anchor full snap, Madeira,
 * Sullivans) ships in a follow-up. For now the response carries DMC +
 * Anchor codes verbatim from the palette so the UI can render them.
 */

/**
 * Stitches per skein, indexed by fabric count. Standard rule of thumb:
 * a DMC skein is 8m / 6 strands; most cross-stitch uses 2 strands per
 * stitch, which covers roughly:
 *   11-count Aida  → ~700 stitches per skein
 *   14-count Aida  → ~900 stitches per skein  (the default)
 *   16-count Aida  → ~1100 stitches per skein
 *   18-count Aida  → ~1400 stitches per skein
 *   22-count linen → ~1800 stitches per skein (over-two on 32-count evenweave)
 *   25-count linen → ~1100 stitches per skein (over-two on 25-count)
 *   28-count linen → ~1400 stitches per skein
 *   32-count linen → ~1800 stitches per skein
 *
 * Round up + add one skein waste allowance, capped at +20% so very
 * small palettes don't over-buy. Bigger palettes already buffer well.
 */
function stitchesPerSkein(fabricCount: number | null | undefined): number {
  if (!fabricCount || !Number.isFinite(fabricCount)) return 900
  if (fabricCount <= 11) return 700
  if (fabricCount <= 14) return 900
  if (fabricCount <= 16) return 1100
  if (fabricCount <= 18) return 1400
  if (fabricCount <= 25) return 1100
  if (fabricCount <= 28) return 1400
  return 1800
}

function estimateSkeins(stitches: number, perSkein: number): number {
  if (stitches <= 0) return 0
  const raw = stitches / perSkein
  // Always at least one skein per colour you actually stitch.
  const rounded = Math.max(1, Math.ceil(raw))
  // Waste allowance: +1 skein up to 5, otherwise +20% rounded up.
  if (rounded <= 5) return rounded + 1
  return rounded + Math.ceil(rounded * 0.2)
}
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

  // Count cells per palette key and compute skein estimate per colour.
  const counts = new Map<string, number>()
  for (const cell of chart.cells ?? []) {
    counts.set(cell.paletteKey, (counts.get(cell.paletteKey) ?? 0) + 1)
  }
  const perSkein = stitchesPerSkein(chart.fabricCount)

  const items = (chart.palette ?? []).map((entry) => {
    const stitchCount = counts.get(entry.key) ?? 0
    return {
      key: entry.key,
      name: entry.name,
      hex: entry.hex,
      dmcCode: entry.dmcCode ?? null,
      anchorCode: entry.anchorCode ?? null,
      stitchCount,
      estimatedSkeins: estimateSkeins(stitchCount, perSkein),
      // Authored skein note (if any) — kept for display when the
      // pattern's author already wrote a per-colour buy guide.
      authoredSkeinNote: entry.skeinEstimate ?? null,
    }
  })

  const totalStitches = items.reduce((acc, item) => acc + item.stitchCount, 0)
  const totalSkeins = items.reduce((acc, item) => acc + item.estimatedSkeins, 0)

  return NextResponse.json({
    tutorialId,
    tutorialSlug: tutorial.slug,
    chartIndex,
    title: chart.title ?? null,
    fabricCount: chart.fabricCount ?? null,
    finishedSizeText: chart.finishedSizeText ?? null,
    totalStitches,
    totalSkeins,
    stitchesPerSkeinAssumption: perSkein,
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

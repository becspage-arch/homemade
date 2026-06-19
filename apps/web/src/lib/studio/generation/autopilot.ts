import { prisma, computePatternMetrics, Visibility, type PatternData } from '@homemade/db'
import { imageToChart, crispChart, type ImageToChartOptions } from './convert'
import type { SourcedImage } from './sources'
import type { ProceduralDesign } from './procedural'
import { structuralQc, licenceQc, type LicenceInput } from './qc'

/**
 * Cross-stitch autopilot runner. Generates a batch of patterns across the
 * source tiers, runs the deterministic gates (structural + licence), and
 * saves each into the REVIEW state (visibility UNLISTED) with its QC verdict
 * recorded in the description. The Claude vision pass then works the REVIEW
 * queue: it promotes clean, on-style charts to PUBLIC and discards/holds the
 * rest. The runner never auto-publishes — nothing goes public without a
 * vision check (Rebecca's "see its work before it goes live" rule).
 */

export type PatternSpec =
  | { slug: string; name: string; theme: string; kind: 'image'; acquire: () => Promise<SourcedImage>; convert: ImageToChartOptions }
  | { slug: string; name: string; theme: string; kind: 'procedural'; design: () => ProceduralDesign; width: number; height: number }

export interface BatchResult {
  slug: string
  name: string
  theme: string
  ok: boolean
  held: boolean
  reasons: string[]
  confettiRatio?: number
  colours?: number
  size?: string
  id?: string
  error?: string
}

async function buildOne(spec: PatternSpec): Promise<{ data: PatternData; licence: LicenceInput['licence']; credit: string }> {
  if (spec.kind === 'image') {
    const src = await spec.acquire()
    const data = await imageToChart(src.buffer, spec.convert)
    return { data, licence: src.licence, credit: src.credit }
  }
  const d = spec.design()
  const data = await crispChart(d.svg, { width: spec.width, height: spec.height, palette: d.palette, background: d.background })
  return { data, licence: 'HOMEMADE-ORIGINAL', credit: 'Homemade-original (procedural)' }
}

export async function runBatch(designerId: string, specs: PatternSpec[]): Promise<BatchResult[]> {
  const results: BatchResult[] = []
  for (const spec of specs) {
    try {
      const { data, licence, credit } = await buildOne(spec)
      const m = computePatternMetrics(data)
      const sq = structuralQc(data)
      const lq = licenceQc({ licence, credit, designerId })
      const held = !(sq.pass && lq.pass)
      const reasons = [...sq.reasons, ...lq.reasons]
      const verdict = held ? `HOLD: ${reasons.join('; ')}` : 'clean'
      const description = `${spec.theme} · ${credit} · QC ${verdict}`
      const common = {
        name: spec.name,
        data: data as unknown as object,
        ownerUserId: null,
        designerId,
        visibility: Visibility.UNLISTED,
        publishedAt: null,
        widthCells: m.widthCells,
        heightCells: m.heightCells,
        colourCount: m.colourCount,
        totalStitches: m.totalStitches,
        hasBackstitch: m.hasBackstitch,
        hasFrenchKnots: m.hasFrenchKnots,
        hasBeads: m.hasBeads,
        hasQuarterStitches: m.hasQuarterStitches,
        fabricCountSuggested: data.fabric.count,
        description,
      }
      const row = await prisma.pattern.upsert({
        where: { slug: spec.slug },
        update: common,
        create: { type: 'CROSS_STITCH', slug: spec.slug, ...common },
        select: { id: true },
      })
      results.push({
        slug: spec.slug, name: spec.name, theme: spec.theme, ok: true, held, reasons,
        confettiRatio: sq.confettiRatio, colours: m.colourCount, size: `${m.widthCells}x${m.heightCells}`, id: row.id,
      })
    } catch (e) {
      results.push({ slug: spec.slug, name: spec.name, theme: spec.theme, ok: false, held: true, reasons: [], error: (e as Error).message })
    }
  }
  return results
}

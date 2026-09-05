/**
 * RENDER-ON-PUBLISH — a stored CrochetPattern heroes ITSELF from its stitch
 * program. This is the build-time step that makes "the hero IS the exact pattern"
 * true: when a pattern's `loomProgram` is stored/published, run this to compile
 * that program → the exact deterministic render → the fidelity-gated photoreal
 * hero, persist it, and write back:
 *   - loomHeroMediaId + heroMediaId  (the persisted exact-pattern hero)
 *   - loomRenderStatus / loomRenderedAt / loomFidelityScore / loomGeometryHash
 *   - loomYarnRadiusMm
 *   - chartData     (regenerated from the SAME program — never hand-kept)
 *   - rowsStructured (the written instructions from the SAME program)
 * so the pattern's three faces (geometry, chart, words) can never drift.
 *
 * Build-time ONLY (Blender + Fal): run on a worker / local box, NEVER the live
 * ECS server (STITCH_ENGINE.md §8e). The public site serves the persisted image.
 *
 *   cd apps/web && npx tsx scripts/render-pattern-on-publish.ts <crochetPatternId> [yr] [--no-hero] [--dry]
 *
 * `--dry` renders + gates but does NOT touch the DB or R2 (a safe local proof).
 */

import { readFileSync } from 'node:fs'
import { prisma, r2Upload } from '@homemade/db'
import { renderProgram, renderComposition } from './loom-pattern'
import { writeInstructions, programToChart, type CrochetProgram } from '../src/lib/loom/crochet/engine/program'
import type { CompositionProgram } from '../src/lib/loom/crochet/engine/composition'
import { compositionRowsStructured } from '../src/lib/loom/crochet/engine/compositionPattern'

export interface RenderOnPublishOptions {
  yr?: number
  hero?: boolean
  /** Render + gate but skip all DB / R2 writes (local proof). */
  dryRun?: boolean
  /** Where the scene JSON + PNGs land. Defaults to the local scratch
   *  directory; the server job passes a temp directory it can write to. */
  outDir?: string
}

export interface RenderOnPublishResult {
  patternId: string
  status: 'RENDERED' | 'SKIPPED_UNCHANGED' | 'AUDIT_FAILED' | 'NO_PROGRAM'
  geometryHash?: string
  fidelityScore?: number | null
  heroUrl?: string
  problems?: string[]
}

/**
 * Render + persist one stored pattern's exact hero from its loomProgram.
 * Idempotent by geometry hash: if the program compiles to the same settled
 * geometry as the last successful render, the existing hero is still exact and
 * we skip the (expensive) re-render.
 */
export async function renderPatternOnPublish(
  patternId: string,
  options: RenderOnPublishOptions = {},
): Promise<RenderOnPublishResult> {
  const pattern = await prisma.crochetPattern.findUnique({
    where: { id: patternId },
    select: { id: true, name: true, slug: true, loomProgram: true, loomGeometryHash: true },
  })
  if (!pattern) throw new Error(`CrochetPattern ${patternId} not found`)
  if (!pattern.loomProgram) return { patternId, status: 'NO_PROGRAM' }

  // Two program shapes are stored on a pattern: a single crocheted piece
  // (`CrochetProgram`) and an assembled amigurumi (`CompositionProgram`, which
  // carries `parts`). Both render through the same gate; only the entry point
  // and the derived faces differ.
  const stored = pattern.loomProgram as unknown as CrochetProgram | CompositionProgram
  const isComposition = Array.isArray((stored as CompositionProgram).parts)
  const renderName = pattern.slug ?? pattern.name
  const renderOptions = { name: renderName, yr: options.yr, hero: options.hero, outDir: options.outDir }
  const res = isComposition
    ? await renderComposition(stored as CompositionProgram, renderOptions)
    : await renderProgram(stored as CrochetProgram, renderOptions)

  if (res.problems.length) {
    if (!options.dryRun) {
      await prisma.crochetPattern.update({
        where: { id: patternId },
        data: { loomRenderStatus: 'FAILED_VERIFICATION', loomGeometryHash: res.geometryHash },
      })
    }
    return { patternId, status: 'AUDIT_FAILED', geometryHash: res.geometryHash, problems: res.problems }
  }

  // Idempotent skip: same settled geometry as last time → the hero is still exact.
  if (pattern.loomGeometryHash === res.geometryHash && !options.dryRun) {
    return { patternId, status: 'SKIPPED_UNCHANGED', geometryHash: res.geometryHash }
  }

  if (options.dryRun) {
    return { patternId, status: 'RENDERED', geometryHash: res.geometryHash, fidelityScore: res.fidelityScore }
  }

  // Persist the chosen hero (fidelity-passed photoreal, else the exact base).
  const heroPath = res.heroPng ?? res.basePng
  if (!heroPath) throw new Error(`${patternId}: no render produced`)
  const bytes = readFileSync(heroPath)
  const { key, publicUrl } = await r2Upload(bytes, 'image/png', {
    filename: `${pattern.slug ?? pattern.name}-loom-hero.png`,
    prefix: 'patterns/loom',
  })
  const media = await prisma.media.create({
    data: {
      type: 'PHOTO',
      mimeType: 'image/png',
      filename: `${pattern.slug ?? pattern.name}-loom-hero.png`,
      r2Key: key,
      status: 'READY',
      source: 'loom-pattern-engine',
      alt: `${pattern.name} — crocheted from the exact pattern`,
    },
  })

  // Regenerate the OTHER faces from the SAME program so they can't drift. An
  // amigurumi is a written pattern (charting one piece of nine and calling it
  // the pattern's chart would mislead), so it keeps whatever chart it has —
  // none — and only its words are rewritten.
  const chart = isComposition ? null : programToChart(stored as CrochetProgram)
  const rowsStructured = isComposition
    ? (compositionRowsStructured(stored as CompositionProgram) as unknown as object)
    : writeInstructions(stored as CrochetProgram).map((line, i) => ({
        section: 'Body',
        rowNumber: i,
        rowLabel: line.split(':')[0] ?? `Line ${i + 1}`,
        instruction: line,
      }))

  await prisma.crochetPattern.update({
    where: { id: patternId },
    data: {
      loomHeroMediaId: media.id,
      heroMediaId: media.id, // the exact-pattern hero is the pattern's hero
      loomRenderStatus: 'SUCCESS',
      loomRenderedAt: new Date(),
      loomFidelityScore: res.fidelityScore,
      loomGeometryHash: res.geometryHash,
      loomYarnRadiusMm: res.yr,
      ...(chart ? { chartData: chart } : {}),
      rowsStructured,
    },
  })

  return { patternId, status: 'RENDERED', geometryHash: res.geometryHash, fidelityScore: res.fidelityScore, heroUrl: publicUrl }
}

async function main(): Promise<void> {
  const id = process.argv[2]
  if (!id) { console.error('usage: render-pattern-on-publish.ts <crochetPatternId> [yr] [--no-hero] [--dry]'); process.exit(2) }
  const yrArg = process.argv[3] && !process.argv[3]!.startsWith('--') ? Number(process.argv[3]) : undefined
  const result = await renderPatternOnPublish(id, {
    yr: yrArg,
    hero: !process.argv.includes('--no-hero'),
    dryRun: process.argv.includes('--dry'),
  })
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.status === 'AUDIT_FAILED' ? 1 : 0)
}

if (process.argv[1] && /render-pattern-on-publish\.ts$/.test(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
}

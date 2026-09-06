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
 *
 * MANY patterns at once: scripts/render-patterns-on-publish-batch.ts, which
 * reuses the three exported steps below (plan → render → persist) so the batch
 * and the single-pattern path can never diverge.
 */

import { readFileSync } from 'node:fs'
import { prisma, r2Upload } from '@homemade/db'
import { renderProgram, renderComposition } from './loom-pattern'
import { writeInstructions, programToChart, type CrochetProgram } from '../src/lib/loom/crochet/engine/program'
import { compileRelaxAudit, geometryHash } from '../src/lib/loom/crochet/engine/programScene'
import type { BuiltContinuous } from '../src/lib/loom/crochet/engine/yarnPath'
import {
  compileComposition,
  compositionYarnRadiusMm,
  type CompositionProgram,
  type CompiledComposition,
} from '../src/lib/loom/crochet/engine/composition'
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
  slug?: string | null
  status: 'RENDERED' | 'SKIPPED_UNCHANGED' | 'AUDIT_FAILED' | 'NO_PROGRAM' | 'RENDER_FAILED'
  geometryHash?: string
  fidelityScore?: number | null
  heroUrl?: string
  problems?: string[]
}

/**
 * The COMPILE + AUDIT half of render-on-publish, done before anything expensive
 * runs. A batch needs this on its own: a Fargate task and a Fal call cost real
 * money, so the decision to render — audit clean, and the geometry actually
 * changed — has to be made before a single task is launched, not after.
 */
export interface PatternRenderPlan {
  patternId: string
  slug: string | null
  name: string
  kind: 'flat' | 'composition' | 'none'
  program: CrochetProgram | CompositionProgram | null
  /** Compiled + relaxed geometry, ready to stage into a scene. */
  built: BuiltContinuous | null
  compiled: CompiledComposition | null
  yr: number | null
  geometryHash: string | null
  /** The hash of the last successful render — equal means the hero is still exact. */
  storedHash: string | null
  problems: string[]
  /** What the batch should do with this row. */
  action: 'RENDER' | 'SKIPPED_UNCHANGED' | 'AUDIT_FAILED' | 'NO_PROGRAM'
}

interface StoredPatternRow {
  id: string
  name: string
  slug: string | null
  loomProgram: unknown
  loomGeometryHash: string | null
}

/** Two program shapes are stored on a pattern: a single crocheted piece
 *  (`CrochetProgram`) and an assembled amigurumi (`CompositionProgram`, which
 *  carries `parts`). Both render through the same gate; only the entry point
 *  and the derived faces differ. */
export function isCompositionProgram(p: unknown): p is CompositionProgram {
  return Array.isArray((p as CompositionProgram | null)?.parts)
}

/** Compile + audit + hash one stored row. No render, no DB write. */
export function planStoredPattern(row: StoredPatternRow, yrOverride?: number): PatternRenderPlan {
  const base: PatternRenderPlan = {
    patternId: row.id,
    slug: row.slug,
    name: row.name,
    kind: 'none',
    program: null,
    built: null,
    compiled: null,
    yr: null,
    geometryHash: null,
    storedHash: row.loomGeometryHash,
    problems: [],
    action: 'NO_PROGRAM',
  }
  if (!row.loomProgram) return base

  if (isCompositionProgram(row.loomProgram)) {
    const program = row.loomProgram as CompositionProgram
    const compiled = compileComposition(program, yrOverride)
    const plan: PatternRenderPlan = {
      ...base,
      kind: 'composition',
      program,
      compiled,
      yr: compositionYarnRadiusMm(program, yrOverride),
      geometryHash: compiled.geometryHash,
      problems: compiled.problems,
      action: compiled.problems.length ? 'AUDIT_FAILED' : 'RENDER',
    }
    if (plan.action === 'RENDER' && row.loomGeometryHash === compiled.geometryHash) {
      plan.action = 'SKIPPED_UNCHANGED'
    }
    return plan
  }

  const program = row.loomProgram as CrochetProgram
  const { built, yr, problems } = compileRelaxAudit(program, yrOverride)
  const plan: PatternRenderPlan = {
    ...base,
    kind: 'flat',
    program,
    built,
    yr,
    geometryHash: geometryHash(built),
    problems,
    action: problems.length ? 'AUDIT_FAILED' : 'RENDER',
  }
  if (plan.action === 'RENDER' && row.loomGeometryHash === plan.geometryHash) {
    plan.action = 'SKIPPED_UNCHANGED'
  }
  return plan
}

/** Load + plan one stored pattern by id. */
export async function planPatternRender(patternId: string, yrOverride?: number): Promise<PatternRenderPlan> {
  const pattern = await prisma.crochetPattern.findUnique({
    where: { id: patternId },
    select: { id: true, name: true, slug: true, loomProgram: true, loomGeometryHash: true },
  })
  if (!pattern) throw new Error(`CrochetPattern ${patternId} not found`)
  return planStoredPattern(pattern as StoredPatternRow, yrOverride)
}

/** Record a failed audit against the row (so the state is visible in the DB and
 *  a broken pattern is never silently left looking PENDING for ever). */
export async function markAuditFailed(plan: PatternRenderPlan): Promise<void> {
  await prisma.crochetPattern.update({
    where: { id: plan.patternId },
    data: { loomRenderStatus: 'FAILED_VERIFICATION', loomGeometryHash: plan.geometryHash },
  })
}

/**
 * Upload the chosen hero to R2, create its Media row, and write back every
 * derived face. Shared by the single-pattern path and the batch so the two can
 * never write a row differently.
 */
export async function persistPatternRender(
  plan: PatternRenderPlan,
  art: {
    heroPath: string
    fidelityScore: number | null
    yr: number
    /**
     * Richer faces the CALLER derived from the same program, used instead of
     * re-deriving them below.
     *
     * The plain writer sees the stitches and not the yarn: it cannot say "join
     * the teal and work rows 5 and 6", because colour lives beside the stitch
     * list rather than in it. The bulk publisher does know, and a striped cloth
     * whose instructions never say when to change colour is not a makeable
     * pattern. When it passes its own rows here, they are what the row stores;
     * when nobody passes anything (the CLI, the batch, the maker's own render)
     * the derivation below is unchanged.
     */
    rowsStructured?: unknown
    chartData?: unknown
  },
): Promise<string> {
  const filename = `${plan.slug ?? plan.name}-loom-hero.png`
  const bytes = readFileSync(art.heroPath)
  const { key, publicUrl } = await r2Upload(bytes, 'image/png', { filename, prefix: 'patterns/loom' })
  const media = await prisma.media.create({
    data: {
      type: 'PHOTO',
      mimeType: 'image/png',
      filename,
      r2Key: key,
      status: 'READY',
      source: 'loom-pattern-engine',
      alt: `${plan.name} — crocheted from the exact pattern`,
    },
  })

  // Regenerate the OTHER faces from the SAME program so they can't drift. An
  // amigurumi is a written pattern (charting one piece of nine and calling it
  // the pattern's chart would mislead), so it keeps whatever chart it has —
  // none — and only its words are rewritten.
  const composed = plan.kind === 'composition'
  const chart =
    art.chartData !== undefined
      ? art.chartData
      : composed
        ? null
        : programToChart(plan.program as CrochetProgram)
  const rowsStructured =
    art.rowsStructured !== undefined
      ? (art.rowsStructured as unknown as object)
      : composed
        ? (compositionRowsStructured(plan.program as CompositionProgram) as unknown as object)
        : writeInstructions(plan.program as CrochetProgram).map((line, i) => ({
            section: 'Body',
            rowNumber: i,
            rowLabel: line.split(':')[0] ?? `Line ${i + 1}`,
            instruction: line,
          }))

  await prisma.crochetPattern.update({
    where: { id: plan.patternId },
    data: {
      loomHeroMediaId: media.id,
      heroMediaId: media.id, // the exact-pattern hero is the pattern's hero
      loomRenderStatus: 'SUCCESS',
      loomRenderedAt: new Date(),
      loomFidelityScore: art.fidelityScore,
      loomGeometryHash: plan.geometryHash,
      loomYarnRadiusMm: art.yr,
      ...(chart ? { chartData: chart as object } : {}),
      rowsStructured,
    },
  })

  return publicUrl
}

/**
 * Render + persist one stored pattern's exact hero from its loomProgram.
 * Idempotent by geometry hash: if the program compiles to the same settled
 * geometry as the last successful render, the existing hero is still exact and
 * we skip the (expensive) re-render — the hash is checked BEFORE the render, so
 * a no-op publish costs a compile, not a Fargate task and a Fal call.
 */
export async function renderPatternOnPublish(
  patternId: string,
  options: RenderOnPublishOptions = {},
): Promise<RenderOnPublishResult> {
  const plan = await planPatternRender(patternId, options.yr)
  if (plan.action === 'NO_PROGRAM') return { patternId, slug: plan.slug, status: 'NO_PROGRAM' }
  if (plan.action === 'AUDIT_FAILED') {
    if (!options.dryRun) await markAuditFailed(plan)
    return {
      patternId,
      slug: plan.slug,
      status: 'AUDIT_FAILED',
      geometryHash: plan.geometryHash ?? undefined,
      problems: plan.problems,
    }
  }
  if (plan.action === 'SKIPPED_UNCHANGED' && !options.dryRun) {
    return { patternId, slug: plan.slug, status: 'SKIPPED_UNCHANGED', geometryHash: plan.geometryHash ?? undefined }
  }

  const renderName = plan.slug ?? plan.name
  const renderOptions = {
    name: renderName,
    yr: options.yr,
    hero: options.hero,
    outDir: options.outDir,
    // A stored pattern carries its own finished-object staging.
    staging: (plan.program as CrochetProgram).staging,
  }
  const res =
    plan.kind === 'composition'
      ? await renderComposition(plan.program as CompositionProgram, renderOptions)
      : await renderProgram(plan.program as CrochetProgram, renderOptions)

  if (res.problems.length) {
    if (!options.dryRun) await markAuditFailed(plan)
    return { patternId, slug: plan.slug, status: 'AUDIT_FAILED', geometryHash: res.geometryHash, problems: res.problems }
  }

  if (options.dryRun) {
    return { patternId, slug: plan.slug, status: 'RENDERED', geometryHash: res.geometryHash, fidelityScore: res.fidelityScore }
  }

  // Persist the chosen hero (fidelity-passed photoreal, else the exact base).
  const heroPath = res.heroPng ?? res.basePng
  if (!heroPath) throw new Error(`${patternId}: no render produced`)
  const heroUrl = await persistPatternRender(plan, {
    heroPath,
    fidelityScore: res.fidelityScore,
    yr: res.yr,
  })

  return {
    patternId,
    slug: plan.slug,
    status: 'RENDERED',
    geometryHash: res.geometryHash,
    fidelityScore: res.fidelityScore,
    heroUrl,
  }
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

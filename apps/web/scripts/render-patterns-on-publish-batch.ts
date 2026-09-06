/**
 * BATCH RENDER-ON-PUBLISH — the bulk path the site actually uses.
 *
 *   cd apps/web && npx tsx scripts/render-patterns-on-publish-batch.ts --slug-prefix loom-signoff-
 *   cd apps/web && npx tsx scripts/render-patterns-on-publish-batch.ts <id> [id ...]
 *
 * Stored `CrochetPattern` rows carrying a `loomProgram` render their OWN exact
 * heroes, straight from the database, and the results are written back to the
 * same rows. This is `render-pattern-on-publish.ts` (which does one) turned into
 * the shape a library of hundreds needs — it imports that file's three steps
 * (plan → render → persist) rather than reimplementing them, so the single and
 * bulk paths cannot diverge.
 *
 * Order of work, and why:
 *   1. PLAN every row first — compile, relax, numeric audit, geometry hash, and
 *      the idempotency check against `loomGeometryHash`. Nothing expensive has
 *      run yet, so a row that fails its audit or is already up to date costs a
 *      compile, not a Fargate task and a Fal call. Unlike the proof batch, ONE
 *      bad row does not abort the run: it is recorded AUDIT_FAILED against its
 *      own row and the rest of the library still lands.
 *   2. Launch every base render AT ONCE (the Fargate cost is per task, not per
 *      pattern — a cold task is 7-8 minutes either way).
 *   3. Per pattern: the Fal photoreal hero + our fidelity gate, then R2 + the
 *      Media row + the DB write-back (hero ids, loom* fields, regenerated
 *      chartData and rowsStructured).
 *   4. One table: slug, hash, fidelity, hero URL, status.
 *
 * Flags:
 *   --slug-prefix <s>  render every row whose slug starts with <s>
 *   --no-hero          skip the Fal step; the exact base render is the hero
 *   --dry              plan + render + gate, but touch neither R2 nor the DB
 *   --force            re-render even when the geometry hash is unchanged
 *   --concurrency=N    cap simultaneous base renders (default: all of them)
 *   --out=<dir>        scratch directory for scene JSON + PNGs
 *   --plan-only        stop after step 1 and print the plan table
 *
 * Build-time only (Blender + Fal): a worker box or a cloud session, never the
 * live server. `LOOM_RENDER=fargate` renders from anywhere.
 */

import { resolve } from 'node:path'
import { mkdirSync } from 'node:fs'

import { prisma } from '@homemade/db'
import { loadCredentials } from './loom-hybrid-fal'
import { STRUCT_MIN_DEFAULT } from './loom-fidelity-gate'
import { OUT, renderSceneBase, photorealHero } from './loom-pattern'
import { loomRenderMode } from './loom-base-render'
import { programScene, type Staging } from '../src/lib/loom/crochet/engine/programScene'
import { compositionScene, type CompositionProgram, type BlenderScene } from '../src/lib/loom/crochet/engine/composition'
import type { CrochetProgram } from '../src/lib/loom/crochet/engine/program'
import {
  planStoredPattern,
  markAuditFailed,
  persistPatternRender,
  type PatternRenderPlan,
} from './render-pattern-on-publish'

loadCredentials()

type Status = 'RENDERED' | 'SKIPPED_UNCHANGED' | 'AUDIT_FAILED' | 'NO_PROGRAM' | 'RENDER_FAILED'

interface Row {
  plan: PatternRenderPlan
  scene: BlenderScene | null
  basePng: string | null
  heroPng: string | null
  fidelityScore: number | null
  heroUrl: string | null
  seconds: number | null
  status: Status
  error: string | null
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

async function loadRows(argv: string[]): Promise<
  { id: string; name: string; slug: string | null; loomProgram: unknown; loomGeometryHash: string | null }[]
> {
  const select = { id: true, name: true, slug: true, loomProgram: true, loomGeometryHash: true }
  const prefixFlagIndex = argv.indexOf('--slug-prefix')
  const prefix =
    prefixFlagIndex >= 0
      ? argv[prefixFlagIndex + 1]
      : argv.find((a) => a.startsWith('--slug-prefix='))?.slice('--slug-prefix='.length)
  if (prefix) {
    return prisma.crochetPattern.findMany({
      where: { slug: { startsWith: prefix } },
      orderBy: { slug: 'asc' },
      select,
    })
  }
  const ids = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--slug-prefix')
  if (ids.length === 0) return []
  return prisma.crochetPattern.findMany({ where: { id: { in: ids } }, orderBy: { slug: 'asc' }, select })
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  const noHero = argv.includes('--no-hero')
  const dryRun = argv.includes('--dry')
  const force = argv.includes('--force')
  const planOnly = argv.includes('--plan-only')
  const concFlag = argv.find((a) => a.startsWith('--concurrency='))
  const outFlag = argv.find((a) => a.startsWith('--out='))
  const outDir = outFlag ? resolve(process.cwd(), outFlag.slice('--out='.length)) : OUT
  const yrFlag = argv.find((a) => a.startsWith('--yr='))
  const yrOverride = yrFlag ? Number(yrFlag.slice('--yr='.length)) : undefined

  const stored = await loadRows(argv)
  if (stored.length === 0) {
    console.error(
      'usage: render-patterns-on-publish-batch.ts --slug-prefix <prefix> | <crochetPatternId> [id ...]  ' +
        '[--no-hero] [--dry] [--force] [--plan-only] [--concurrency=N] [--out=DIR]',
    )
    process.exit(2)
  }
  mkdirSync(outDir, { recursive: true })

  // ── 1. plan EVERYTHING first: compile + audit + hash, before anything costs ──
  console.log(`[1/4] plan — compile + relax + numeric audit + idempotency, ${stored.length} stored patterns`)
  const rows: Row[] = []
  for (const row of stored) {
    const plan = planStoredPattern(row, yrOverride)
    const status: Status =
      plan.action === 'RENDER' || (force && plan.action === 'SKIPPED_UNCHANGED') ? 'RENDERED' : plan.action
    rows.push({
      plan,
      scene: null,
      basePng: null,
      heroPng: null,
      fidelityScore: null,
      heroUrl: null,
      seconds: null,
      status,
      error: null,
    })
    const label = pad(plan.slug ?? plan.patternId, 30)
    if (plan.action === 'AUDIT_FAILED') {
      console.log(`      AUDIT_FAILED      ${label} hash=${plan.geometryHash}`)
      for (const p of plan.problems) console.log(`                          - ${p}`)
    } else if (plan.action === 'NO_PROGRAM') {
      console.log(`      NO_PROGRAM        ${label}`)
    } else if (plan.action === 'SKIPPED_UNCHANGED' && !force) {
      console.log(`      SKIPPED_UNCHANGED ${label} hash=${plan.geometryHash}`)
    } else {
      console.log(`      RENDER            ${label} ${plan.kind === 'flat' ? 'flat ' : 'compo'} yr=${plan.yr} hash=${plan.geometryHash}`)
    }
  }

  // A broken program is recorded against its own row rather than left looking
  // PENDING for ever, but it never stops the rest of the batch.
  if (!dryRun) {
    for (const r of rows) if (r.status === 'AUDIT_FAILED') await markAuditFailed(r.plan)
  }

  const toRender = rows.filter((r) => r.status === 'RENDERED')
  if (planOnly || toRender.length === 0) {
    if (toRender.length === 0) console.log('\nNothing to render.')
    report(rows, dryRun)
    return
  }

  // ── 2. every base render at once ──
  const where = loomRenderMode()
  console.log(`\n[2/4] base renders — ${toRender.length} ${where === 'fargate' ? 'Fargate tasks, all launched now' : 'local Blender runs'}`)
  if (where !== 'fargate') {
    console.log('      NOTE: LOOM_RENDER is not "fargate", so these run on the local Blender back to back.')
  }
  for (const r of toRender) {
    r.scene =
      r.plan.kind === 'composition'
        ? compositionScene(r.plan.program as CompositionProgram, r.plan.compiled!)
        : programScene(
            r.plan.program as CrochetProgram,
            r.plan.built!,
            r.plan.yr!,
            0.08,
            ((r.plan.program as CrochetProgram).staging ?? 'swatch') as Staging,
          )
  }
  const batchStart = Date.now()
  const limit = concFlag ? Math.max(1, Number(concFlag.slice('--concurrency='.length))) : toRender.length
  const queue = [...toRender]
  const runOne = async (r: Row): Promise<void> => {
    const name = r.plan.slug ?? r.plan.patternId
    const started = Date.now()
    try {
      const { basePng } = await renderSceneBase(r.scene!, name, outDir)
      r.basePng = basePng
      r.seconds = Math.round((Date.now() - started) / 1000)
      console.log(`      done  ${pad(name, 30)} ${r.seconds}s  ${basePng}`)
    } catch (e) {
      r.seconds = Math.round((Date.now() - started) / 1000)
      r.error = (e as Error).message
      r.status = 'RENDER_FAILED'
      console.error(`      FAIL  ${pad(name, 30)} ${r.seconds}s  ${r.error}`)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      for (let r = queue.shift(); r; r = queue.shift()) await runOne(r)
    }),
  )
  console.log(`      batch wall-clock ${Math.round((Date.now() - batchStart) / 1000)}s`)

  // ── 3. photoreal hero + fidelity gate, per pattern ──
  if (noHero || !process.env.FAL_KEY) {
    console.log(`\n[3/4] photoreal hero SKIPPED (${noHero ? '--no-hero' : 'no FAL_KEY'}) — the base render is the exact-pattern hero`)
  } else {
    console.log('\n[3/4] photoreal hero + fidelity gate')
    for (const r of toRender) {
      if (!r.basePng) continue
      const promptKey = r.plan.kind === 'composition' ? 'amigurumi' : 'sc'
      const { heroPng, fidelityScore } = await photorealHero(r.basePng, true, promptKey)
      r.heroPng = heroPng
      r.fidelityScore = fidelityScore
      console.log(
        `      ${pad(r.plan.slug ?? r.plan.patternId, 30)} ${heroPng ? 'PASS' : 'no hero'}` +
          (fidelityScore != null ? `  structure ${fidelityScore.toFixed(3)} / min ${STRUCT_MIN_DEFAULT}` : ''),
      )
    }
  }

  // ── 4. R2 + Media + the DB write-back, per pattern ──
  if (dryRun) {
    console.log('\n[4/4] --dry: no R2 upload, no Media row, no DB write')
  } else {
    console.log('\n[4/4] R2 upload + Media row + write-back (hero ids, loom* fields, chartData, rowsStructured)')
    for (const r of toRender) {
      const heroPath = r.heroPng ?? r.basePng
      if (!heroPath) continue
      try {
        r.heroUrl = await persistPatternRender(r.plan, {
          heroPath,
          fidelityScore: r.fidelityScore,
          yr: r.plan.yr!,
        })
        console.log(`      ${pad(r.plan.slug ?? r.plan.patternId, 30)} ${r.heroUrl}`)
      } catch (e) {
        r.error = (e as Error).message
        r.status = 'RENDER_FAILED'
        console.error(`      FAIL  ${pad(r.plan.slug ?? r.plan.patternId, 30)} ${r.error}`)
      }
    }
  }

  report(rows, dryRun)
  if (rows.some((r) => r.status === 'RENDER_FAILED')) process.exit(1)
}

function report(rows: Row[], dryRun: boolean): void {
  console.log('\n===================== BATCH REPORT =====================')
  console.log(`${pad('slug', 30)} ${pad('hash', 10)} ${pad('fidelity', 9)} ${pad('status', 18)} hero URL`)
  for (const r of rows) {
    console.log(
      `${pad(r.plan.slug ?? r.plan.patternId, 30)} ${pad(r.plan.geometryHash ?? '-', 10)} ` +
        `${pad(r.fidelityScore != null ? r.fidelityScore.toFixed(3) : '-', 9)} ${pad(r.status, 18)} ` +
        `${r.heroUrl ?? (dryRun ? '(dry run)' : r.error ? `ERROR ${r.error}` : '-')}`,
    )
  }
  console.log('========================================================')
  const failed = rows.filter((r) => r.status === 'AUDIT_FAILED')
  if (failed.length) {
    console.log('\nAUDIT_FAILED rows (not rendered — the geometry is not genuinely stitched):')
    for (const r of failed) {
      console.log(`  ${r.plan.slug ?? r.plan.patternId}`)
      for (const p of r.plan.problems) console.log(`    - ${p}`)
    }
  }
  console.log(`
NOT DONE until a human LOOKS at these beside real reference photos. The gates
above prove the geometry is genuinely stitched and the hero did not drift from
it; they say nothing about whether the piece is worth selling.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

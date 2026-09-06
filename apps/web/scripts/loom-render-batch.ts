/**
 * BATCH crochet pattern renders — the way patterns are rendered on Fargate.
 *
 *   cd apps/web && npx tsx scripts/loom-render-batch.ts <name> [name ...] [flags]
 *   cd apps/web && npx tsx scripts/loom-render-batch.ts --set=signoff
 *
 * A cold Fargate task is 7-8 minutes of image pull + Cycles, and that cost is
 * per TASK, not per pattern — so patterns are never rendered one at a time.
 * This launches every render at once and waits for the lot.
 *
 * Order of work (each phase gates the next):
 *   1. COMPILE + NUMERIC AUDIT every program first, before a single task is
 *      launched. Fails fast and loud: one un-stitched program stops the batch
 *      rather than burning ten task-minutes to find out at the end.
 *   2. write every scene.json, launch every base render CONCURRENTLY (one
 *      `ecs run-task` each) and await them all. A failed render is recorded
 *      against its own row; the rest of the batch still lands.
 *   3. per pattern, the Fal photoreal hero + our fidelity gate — unchanged
 *      from the single-pattern pipeline, and still the thing that decides
 *      whether the hero or the exact base render is the deliverable.
 *   4. for flat programs, the other two faces (written instructions +
 *      ChartDefinition + chart SVG) from the SAME program.
 *   5. one table: name, geometry hash, base PNG, hero PNG, fidelity, verdict,
 *      and the render wall-clock per pattern.
 *
 * Flags:
 *   --no-hero          skip step 3 (base renders only)
 *   --compile-only     stop after step 1 and print the geometry hashes. The
 *                      merge/refactor guard for whole PATTERNS, the way
 *                      loom-geom-hash.ts is the guard for dictionary swatches:
 *                      run it either side of a change and the hashes must not
 *                      move (STITCH_ENGINE.md §8e-3 lists the expected ones).
 *   --out=<dir>        output directory (default .loom-scratch/crochet/patterns)
 *   --concurrency=N    cap how many renders run at once. Default: all of them.
 *                      The account's Fargate On-Demand vCPU quota is the real
 *                      ceiling (this task is 4 vCPU), so drop it to 3 and
 *                      re-run the stragglers if run-task reports no capacity.
 *   --set=signoff      the six-sample sign-off set (STITCH_ENGINE.md §8e-3)
 *                      plus both amigurumi composition proofs
 *
 * Geometry, staging and samples are exactly the single-pattern pipeline's — this
 * script only changes WHEN renders run, never WHAT is rendered.
 */

import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, statSync } from 'node:fs'

import { programYarnRadiusMm, type CrochetProgram } from '../src/lib/loom/crochet/engine/program'
import { compileRelaxAudit, programScene, geometryHash } from '../src/lib/loom/crochet/engine/programScene'
import {
  compileComposition,
  compositionScene,
  compositionYarnRadiusMm,
  type CompositionProgram,
  type BlenderScene,
} from '../src/lib/loom/crochet/engine/composition'
import { loadCredentials } from './loom-hybrid-fal'
import { STRUCT_MIN_DEFAULT } from './loom-fidelity-gate'
import { PATTERN_PROOFS } from './loom-pattern-proofs'
import { COMPOSITION_PROOFS } from './loom-composition-proofs'
import { OUT, proofStaging, renderSceneBase, photorealHero, writePatternFaces } from './loom-pattern'
import { loomRenderMode } from './loom-base-render'
import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { auditProblems } from '../src/lib/loom/crochet/engine/auditChecks'
import { SWATCH_RECIPES } from '../src/lib/loom/crochet/engine/dictionary'
import { pliedFilaments, smooth, type V3 } from '../src/lib/loom/crochet/yarnLoop'

loadCredentials()

/** The six-sample sign-off set (§8e-3) + both amigurumi composition proofs. */
const SIGNOFF_SET = [
  'simple-coaster',
  'stripe-dishcloth',
  'flat-texture-panel',
  'post-rib-headband',
  'cottage-tapestry',
  'amigurumi-ball',
  'amigurumi-creature',
]

interface Job {
  name: string
  kind: 'flat' | 'composition' | 'swatch'
  program: CrochetProgram | CompositionProgram | null
  scene: BlenderScene
  yr: number
  geometryHash: string
  heroPromptKey: string
  basePng: string | null
  heroPng: string | null
  fidelityScore: number | null
  seconds: number | null
  error: string | null
}

/**
 * A dictionary SWATCH as a batch job (§8f-3). A cold Fargate task costs the same
 * whether it renders a pattern or a stitch swatch, and a look pass needs both in
 * front of the same eye at the same time — so the batch takes either. The scene
 * is exactly the one `loom-stitch.ts` builds (same ply recipe, same per-recipe
 * view), and the same numeric audit gates it.
 */
function compileSwatch(name: string, yrOverride?: number): Job {
  const recipe = SWATCH_RECIPES[name as keyof typeof SWATCH_RECIPES]
  const yr = yrOverride ?? 2.4
  const hex = '#c98a5e'
  const W = recipe.auditW
  const swatch = buildRelaxedSwatch(name as never, W, yr)
  const problems = auditProblems(swatch, name, W, yr)
  if (problems.length) throw new Error(`${name} is NOT genuinely stitched:\n  - ${problems.join('\n  - ')}`)
  const { built } = swatch
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  const center = smooth(ctrl, 4)
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.85, 3, recipe.twist)
  const h = createHash('sha256')
  for (const n of nodes) h.update(`${n.x.toFixed(9)},${n.y.toFixed(9)},${n.z.toFixed(9)},${n.w};`)
  return {
    name: `stitch-${name}`,
    kind: 'swatch',
    program: null,
    scene: {
      fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex },
      strokes: [{ hex, sheen: 0.85, radiusMm, filaments }],
      view: {
        bgHex: '#6f5440',
        marginFactor: recipe.viewMargin ?? 0.12,
        tiltDeg: recipe.tiltDeg,
        resY: 1200,
        openFabric: recipe.openFabric ?? false,
      },
    } as unknown as BlenderScene,
    yr,
    geometryHash: h.digest('hex').slice(0, 16),
    heroPromptKey: recipe.stitch,
    basePng: null, heroPng: null, fidelityScore: null, seconds: null, error: null,
  }
}

/** Compile + relax + AUDIT one proof by name. Throws with the audit problems. */
function compile(name: string): Job {
  const composition = COMPOSITION_PROOFS[name]
  if (composition) {
    const compiled = compileComposition(composition)
    if (compiled.problems.length) {
      throw new Error(`${name} is NOT genuinely stitched:\n  - ${compiled.problems.join('\n  - ')}`)
    }
    return {
      name,
      kind: 'composition',
      program: composition,
      scene: compositionScene(composition, compiled),
      yr: compositionYarnRadiusMm(composition),
      geometryHash: compiled.geometryHash,
      heroPromptKey: 'amigurumi',
      basePng: null, heroPng: null, fidelityScore: null, seconds: null, error: null,
    }
  }

  const program = PATTERN_PROOFS[name]
  if (!program) {
    if (isSwatchArg(name)) return compileSwatch(name)
    throw new Error(
      `unknown program '${name}' — proofs: ${Object.keys(PATTERN_PROOFS).join(', ')}; ` +
        `compositions: ${Object.keys(COMPOSITION_PROOFS).join(', ')}`,
    )
  }
  const { built, yr, problems } = compileRelaxAudit(program)
  if (problems.length) {
    throw new Error(`${name} is NOT genuinely stitched:\n  - ${problems.join('\n  - ')}`)
  }
  return {
    name,
    kind: 'flat',
    program,
    scene: programScene(program, built, yr, 0.08, program.staging ?? proofStaging(program.name)),
    yr: programYarnRadiusMm(program),
    geometryHash: geometryHash(built),
    heroPromptKey: 'sc',
    basePng: null, heroPng: null, fidelityScore: null, seconds: null, error: null,
  }
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  const noHero = argv.includes('--no-hero')
  const compileOnly = argv.includes('--compile-only')
  const concFlag = argv.find((a) => a.startsWith('--concurrency='))
  const outFlag = argv.find((a) => a.startsWith('--out='))
  const outDir = outFlag ? resolve(process.cwd(), outFlag.slice('--out='.length)) : OUT
  const names = argv.includes('--set=signoff')
    ? SIGNOFF_SET
    : argv.filter((a) => !a.startsWith('--'))

  if (names.length === 0) {
    console.error('usage: loom-render-batch.ts <name> [name ...] | --set=signoff  [--no-hero] [--out=DIR]')
    process.exit(2)
  }
  mkdirSync(outDir, { recursive: true })

  // ── 1. compile + audit EVERYTHING first (fail fast, before any task runs) ──
  console.log(`[1/4] compile + relax + numeric audit — ${names.length} programs (nothing renders until all pass)`)
  const jobs: Job[] = []
  for (const name of names) {
    try {
      const job = compile(name)
      jobs.push(job)
      console.log(
        `      PASS  ${pad(job.name, 22)} ${job.kind === 'flat' ? 'flat  ' : job.kind === 'swatch' ? 'swatch' : 'compo '}  yr=${job.yr}  hash=${job.geometryHash}`,
      )
    } catch (e) {
      console.error(`      FAIL  ${name}`)
      console.error(`      ${(e as Error).message}`)
      console.error('\nBATCH ABORTED — fix the program/construction; nothing was rendered.')
      process.exit(1)
    }
  }

  if (compileOnly) {
    console.log('\n--compile-only: geometry hashes (nothing rendered)')
    for (const job of jobs) console.log(`${pad(job.name, 22)} ${job.geometryHash}`)
    return
  }

  // ── 2. every base render at once ──
  const where = loomRenderMode()
  console.log(`\n[2/4] base renders — ${jobs.length} ${where === 'fargate' ? 'Fargate tasks, all launched now' : 'local Blender runs'}`)
  if (where !== 'fargate') {
    console.log('      NOTE: LOOM_RENDER is not "fargate", so these run on the local Blender back to back.')
  }
  const batchStart = Date.now()
  const limit = concFlag ? Math.max(1, Number(concFlag.slice('--concurrency='.length))) : jobs.length
  const queue = [...jobs]
  const runOne = async (job: Job): Promise<void> => {
    const started = Date.now()
    try {
      const { basePng } = await renderSceneBase(job.scene, job.name, outDir)
      job.basePng = basePng
      job.seconds = Math.round((Date.now() - started) / 1000)
      console.log(`      done  ${pad(job.name, 22)} ${job.seconds}s  ${basePng}`)
    } catch (e) {
      job.seconds = Math.round((Date.now() - started) / 1000)
      job.error = (e as Error).message
      console.error(`      FAIL  ${pad(job.name, 22)} ${job.seconds}s  ${job.error}`)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) await runOne(job)
    }),
  )
  console.log(`      batch wall-clock ${Math.round((Date.now() - batchStart) / 1000)}s`)

  // ── 3. photoreal hero + fidelity gate, per pattern ──
  if (noHero || !process.env.FAL_KEY) {
    console.log(`\n[3/4] photoreal hero SKIPPED (${noHero ? '--no-hero' : 'no FAL_KEY'}) — the base render is the exact-pattern deliverable`)
  } else {
    console.log('\n[3/4] photoreal hero + fidelity gate')
    for (const job of jobs) {
      if (!job.basePng) continue
      const { heroPng, fidelityScore } = await photorealHero(job.basePng, true, job.heroPromptKey)
      job.heroPng = heroPng
      job.fidelityScore = fidelityScore
      console.log(
        `      ${pad(job.name, 22)} ${heroPng ? 'PASS' : 'no hero'}` +
          (fidelityScore != null ? `  structure ${fidelityScore.toFixed(3)} / min ${STRUCT_MIN_DEFAULT}` : ''),
      )
    }
  }

  // ── 4. the other two faces, for the flat programs ──
  console.log('\n[4/4] written instructions + ChartDefinition + chart SVG (flat programs)')
  for (const job of jobs) {
    if (job.kind !== 'flat' || !job.basePng) continue
    const faces = writePatternFaces(job.program as CrochetProgram, outDir)
    console.log(`      ${pad(job.name, 22)} ${faces.chart.layout}  ${faces.chartSvgPath}`)
  }

  // ── the table ──
  const size = (p: string | null): string => {
    if (!p || !existsSync(p)) return '-'
    return `${Math.round(statSync(p).size / 1024)}kB`
  }
  console.log('\n================ BATCH REPORT ================')
  console.log(
    `${pad('pattern', 22)} ${pad('hash', 10)} ${pad('secs', 6)} ${pad('base', 9)} ${pad('hero', 9)} ${pad('fidelity', 9)} verdict`,
  )
  let failed = 0
  for (const job of jobs) {
    const verdict = job.error ? 'RENDER FAILED' : job.heroPng ? 'PASS (hero)' : job.basePng ? 'PASS (base only)' : 'FAIL'
    if (job.error || !job.basePng) failed += 1
    console.log(
      `${pad(job.name, 22)} ${pad(job.geometryHash, 10)} ${pad(String(job.seconds ?? '-'), 6)} ` +
        `${pad(size(job.basePng), 9)} ${pad(size(job.heroPng), 9)} ` +
        `${pad(job.fidelityScore != null ? job.fidelityScore.toFixed(3) : '-', 9)} ${verdict}`,
    )
  }
  console.log('----------------------------------------------')
  for (const job of jobs) {
    console.log(`${job.name}`)
    console.log(`  base: ${job.basePng ?? `(none — ${job.error ?? 'not rendered'})`}`)
    console.log(`  hero: ${job.heroPng ?? '(none — the base render is the deliverable)'}`)
  }
  console.log('==============================================')
  console.log(`
NOT DONE until a human LOOKS at these beside real reference photos. The gates
above prove the geometry is genuinely stitched and the hero did not drift from
it; they say nothing about whether the piece is worth selling.`)
  if (failed) process.exit(1)
}

main()

/**
 * THE crochet PATTERN pipeline — one command that turns a stored stitch PROGRAM
 * into its rendered, chart-bearing, self-heroing pattern. The program-level
 * analog of scripts/loom-stitch.ts (which renders a single dictionary stitch):
 *
 *   cd apps/web && npx tsx scripts/loom-pattern.ts <proof-name | program.json> [yr] [--no-hero]
 *
 * Steps (each gate refuses to continue past a failure):
 *   1. compile the program → one continuous yarn path (engine/program.ts)
 *   2. relax + NUMERIC AUDIT GATE — genuinely stitched, in data. Fails → STOPS.
 *   3. Blender base render (deterministic — the hero IS the exact pattern)
 *   4. photoreal hero + fidelity gate (loom-aspen-hero; skipped without FAL_KEY)
 *   5. write the pattern's OTHER two faces from the SAME program so they can't
 *      drift: the written instructions + the product ChartDefinition (+ a
 *      standalone chart SVG to eyeball), then print the report block.
 *
 * The Blender base render runs wherever LOOM_RENDER says (scripts/loom-base-render.ts):
 * the local Blender by default, or the Fargate container with LOOM_RENDER=fargate —
 * same pinned Blender, same loom_render_crochet.py, same scene.json + samples, so
 * the PNG is the same either side. A cold Fargate task is 7-8 minutes, so render
 * MANY patterns at once with scripts/loom-render-batch.ts rather than one at a time.
 *
 * `renderProgram()` (exported) is the reusable render-on-publish engine: a
 * publish path (scripts/render-pattern-on-publish.ts) calls it to make a stored
 * pattern hero itself. Build-time tooling — Blender + Fal run on a worker / local
 * box, NEVER the live server (see STITCH_ENGINE.md §8e + the loom brief).
 *
 * The human-judgment half this can't do: LOOK at the render beside a real
 * reference photo, and post the links to Rebecca for her verdict.
 */

import { resolve, isAbsolute } from 'node:path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

import {
  writeInstructions,
  programToChart,
  programYarnRadiusMm,
  type CrochetProgram,
} from '../src/lib/loom/crochet/engine/program'
import { compileRelaxAudit, programScene, geometryHash, type Staging } from '../src/lib/loom/crochet/engine/programScene'
import {
  compileComposition,
  compositionScene,
  compositionYarnRadiusMm,
  type CompositionProgram,
  type BlenderScene,
} from '../src/lib/loom/crochet/engine/composition'
import { getChartSymbol } from '../src/lib/craft-charts/chart-symbols'
import { loadCredentials } from './loom-hybrid-fal'
import { renderBase, loomRenderMode } from './loom-base-render'
import { fidelityGate, STRUCT_MIN_DEFAULT } from './loom-fidelity-gate'
import { PATTERN_PROOFS } from './loom-pattern-proofs'
import { COMPOSITION_PROOFS } from './loom-composition-proofs'

loadCredentials()

export const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet/patterns')
// The scratch directory is a local-tooling convenience. On the deployed server
// the working directory's parent is not writable and callers pass their own
// `outDir`, so a failure here is not a reason to refuse to load the module.
try {
  mkdirSync(OUT, { recursive: true })
} catch {
  // no scratch directory here; every render path takes an explicit outDir
}

/** Cycles samples for the deterministic base render — the same number local and
 *  on Fargate, so the two machines produce the same PNG. */
export const BASE_SAMPLES = 150

export interface RenderProgramResult {
  name: string
  problems: string[]
  scenePath: string
  basePng: string | null
  /** The fidelity-PASSED photoreal hero, or null (no FAL_KEY, or the gate
   *  rejected the upscale → fall back to the exact base render). */
  heroPng: string | null
  geometryHash: string
  yr: number
  /** Fidelity structure score when the hero step ran (0..1), else null. */
  fidelityScore: number | null
}

export interface RenderProgramOptions {
  /** Output basename (defaults to the program name). */
  name?: string
  /** Yarn radius override (mm); else the program's yarn weight. */
  yr?: number
  /** Run the photoreal hero + fidelity gate (needs FAL_KEY). Default true. */
  hero?: boolean
  /** Where PNGs/scene land. Default .loom-scratch/crochet/patterns. */
  outDir?: string
  /** Finished-object staging (Part C). Default 'swatch' (the stitch-proof crop). */
  staging?: Staging
}

/**
 * The render-on-publish ENGINE: compile → audit gate → Blender base → photoreal
 * hero + fidelity gate. Returns the artifacts + the geometry hash (the render
 * cache key). Throws only on a broken audit (never render un-stitched geometry);
 * a missing FAL_KEY / failed upscale degrades to the deterministic base render,
 * which is itself the exact pattern.
 */
export async function renderProgram(program: CrochetProgram, options: RenderProgramOptions = {}): Promise<RenderProgramResult> {
  const outDir = options.outDir ?? OUT
  mkdirSync(outDir, { recursive: true })
  const name = options.name ?? program.name
  const { built, yr, problems } = compileRelaxAudit(program, options.yr)
  const ghash = geometryHash(built)

  const result: RenderProgramResult = {
    name, problems, scenePath: '', basePng: null, heroPng: null, geometryHash: ghash, yr, fidelityScore: null,
  }
  if (problems.length) return result // audit gate — caller decides; do NOT render

  const scene = programScene(program, built, yr, 0.08, options.staging ?? 'swatch')
  const art = await blenderHero(scene, name, outDir, options.hero !== false)
  return { ...result, ...art }
}

/**
 * Shared render tail: write the Blender scene JSON, render the deterministic base
 * (the exact geometry), then the fidelity-gated photoreal hero. `heroPromptKey`
 * picks the aspen-hero prompt (flat swatch vs amigurumi). Reused by the flat
 * program path and the composed-amigurumi path so both stage identically.
 */
async function blenderHero(
  scene: BlenderScene,
  name: string,
  outDir: string,
  hero: boolean,
  heroPromptKey = 'sc',
): Promise<{ scenePath: string; basePng: string; heroPng: string | null; fidelityScore: number | null }> {
  const { scenePath, basePng } = await renderSceneBase(scene, name, outDir)
  const { heroPng, fidelityScore } = await photorealHero(basePng, hero, heroPromptKey)
  return { scenePath, basePng, heroPng, fidelityScore }
}

/**
 * Write the scene JSON and render the deterministic base PNG (local Blender or
 * the Fargate container — see loom-base-render.ts). Exported so a BATCH can
 * write every scene, fire every render at once, and await them together.
 */
export async function renderSceneBase(
  scene: BlenderScene,
  name: string,
  outDir: string,
): Promise<{ scenePath: string; basePng: string }> {
  mkdirSync(outDir, { recursive: true })
  const scenePath = resolve(outDir, `${name}.json`)
  writeFileSync(scenePath, JSON.stringify(scene))
  const basePng = resolve(outDir, `${name}.png`)
  await renderBase(scenePath, basePng, BASE_SAMPLES, 'loom_render_crochet.py')
  return { scenePath, basePng }
}

/**
 * The photoreal FINISH: Fal creative-upscale, then our own fidelity gate so a
 * drifted hero is REJECTED and the exact base render stands as the deliverable
 * (the hero is a promise the customer gets exactly this). No FAL_KEY → base only.
 */
export async function photorealHero(
  basePng: string,
  hero: boolean,
  heroPromptKey = 'sc',
): Promise<{ heroPng: string | null; fidelityScore: number | null }> {
  if (!hero || !process.env.FAL_KEY) return { heroPng: null, fidelityScore: null }
  const heroOut = basePng.replace(/\.png$/, '-hero.png')
  const h = spawnSync('npx', ['tsx', 'scripts/loom-aspen-hero.ts', basePng, '0.55', '0.82', heroPromptKey], {
    stdio: ['ignore', 'inherit', 'inherit'], shell: true,
  })
  if (h.status !== 0 || !existsSync(heroOut)) return { heroPng: null, fidelityScore: null }
  const verdict = await fidelityGate(basePng, heroOut)
  return { heroPng: verdict.pass ? heroOut : null, fidelityScore: verdict.structureScore }
}

/**
 * The composed-amigurumi render engine: build + relax + AUDIT every part (a
 * broken part stops the render), stage them into one 3D scene, then the same
 * Blender base + fidelity-gated hero as the flat path. The hero IS the exact
 * assembled object.
 */
export async function renderComposition(program: CompositionProgram, options: RenderProgramOptions = {}): Promise<RenderProgramResult> {
  const outDir = options.outDir ?? OUT
  mkdirSync(outDir, { recursive: true })
  const name = options.name ?? program.name
  const compiled = compileComposition(program, options.yr)
  const result: RenderProgramResult = {
    name, problems: compiled.problems, scenePath: '', basePng: null, heroPng: null,
    geometryHash: compiled.geometryHash, yr: compiled.yr, fidelityScore: null,
  }
  if (compiled.problems.length) return result // audit gate — do NOT render

  const scene = compositionScene(program, compiled)
  const art = await blenderHero(scene, name, outDir, options.hero !== false, 'amigurumi')
  return { ...result, ...art }
}

// ── Standalone chart SVG (eyeball the forward map) ────────────────────────────
type ChartDef = ReturnType<typeof programToChart>

/** A compact, self-contained SVG of a ChartDefinition using the product's own
 *  crochet glyphs (chart-symbols.ts). Not the in-product renderer (svg-chart.tsx
 *  — React) — just a proof artifact so the derived chart can be looked at. */
function programChartSvg(chart: ChartDef): string {
  const cell = 26
  const padL = 44
  const padTop = 44
  const padBot = 60
  const glyph = (key: string, cx: number, cy: number): string => {
    const s = getChartSymbol('crochet', key)
    const inner = s?.svg ?? '<circle r="3" fill="currentColor"/>'
    return `<g transform="translate(${cx},${cy}) scale(1.1)" color="#2a2a2a">${inner}</g>`
  }
  const parts: string[] = []
  let W = 0
  let H = 0

  if (chart.layout === 'flat') {
    const rows = chart.rows!
    const maxCells = Math.max(...rows.map((r) => r.stitches.reduce((a, _s) => a + 1, 0)))
    W = padL + maxCells * cell + 24
    H = padTop + rows.length * cell + padBot
    // Row 1 at the bottom; RS rows read right-to-left.
    rows.forEach((r) => {
      const y = padTop + (rows.length - r.rowNumber) * cell + cell / 2
      parts.push(`<text x="${padL - 12}" y="${y + 4}" text-anchor="end" font-family="system-ui" font-size="11" fill="#888">R${r.rowNumber}</text>`)
      const cells = r.stitches
      cells.forEach((s, i) => {
        const col = r.rightSide === false ? i : cells.length - 1 - i // RS right-to-left
        const cx = padL + col * cell + cell / 2
        parts.push(glyph(s.symbol, cx, y))
      })
    })
  } else {
    const rounds = chart.rounds!
    const maxR = rounds.length
    const size = padTop * 2 + maxR * cell * 2
    W = size
    H = size + padBot
    const cxC = size / 2
    const cyC = size / 2
    rounds.forEach((rnd) => {
      const radius = rnd.roundNumber * cell
      const flat = rnd.stitches.flatMap((s) => Array.from({ length: s.count ?? 1 }, () => s.symbol))
      flat.forEach((sym, i) => {
        const a = (i / flat.length) * Math.PI * 2 - Math.PI / 2
        parts.push(glyph(sym, cxC + Math.cos(a) * radius, cyC + Math.sin(a) * radius))
      })
    })
  }

  const title = `<text x="${padL}" y="26" font-family="system-ui" font-size="15" font-weight="700" fill="#2a2a2a">${chart.title} — symbol chart (UK)</text>`
  const cap = chart.caption ? `<text x="${padL}" y="${H - 30}" font-family="system-ui" font-size="11" fill="#888">${chart.caption}</text>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fbfaf7"/>${title}${parts.join('')}${cap}</svg>`
}

/**
 * Write a flat pattern's OTHER TWO FACES from the SAME program so they can't
 * drift from the geometry: the written instructions, the product
 * ChartDefinition, and a standalone chart SVG to eyeball. Shared by the single
 * -pattern CLI and the batch.
 */
export function writePatternFaces(
  program: CrochetProgram,
  outDir: string = OUT,
): { instructions: string[]; chart: ChartDef; chartJsonPath: string; chartSvgPath: string; instrPath: string } {
  mkdirSync(outDir, { recursive: true })
  const instructions = writeInstructions(program)
  const chart = programToChart(program)
  const chartJsonPath = resolve(outDir, `${program.name}.chart.json`)
  const chartSvgPath = resolve(outDir, `${program.name}.chart.svg`)
  const instrPath = resolve(outDir, `${program.name}.instructions.txt`)
  writeFileSync(chartJsonPath, JSON.stringify(chart, null, 2))
  writeFileSync(chartSvgPath, programChartSvg(chart))
  writeFileSync(instrPath, instructions.join('\n'))
  return { instructions, chart, chartJsonPath, chartSvgPath, instrPath }
}

// ── CLI ───────────────────────────────────────────────────────────────────────
/** Per-proof finished-object staging (Part C). A dishcloth / panel lays flat; a
 *  headband loops into a ring. Override on the command line with
 *  `--staging=flatlay|loop|swatch`. Default (unlisted programs) = 'swatch'. */
const PROOF_STAGING: Record<string, Staging> = {
  'simple-coaster': 'flatlay',
  'stripe-dishcloth': 'flatlay',
  'texture-sampler-panel': 'flatlay',
  'flat-texture-panel': 'flatlay',
  'post-rib-headband': 'loop',
  'cottage-tapestry': 'flatlay',
}
/** The proof's default finished-object staging (no CLI flags involved) — what a
 *  batch run uses. */
export function proofStaging(name: string): Staging {
  return PROOF_STAGING[name] ?? 'swatch'
}
function resolveStaging(name: string): Staging {
  const flag = process.argv.find((a) => a.startsWith('--staging='))
  if (flag) return flag.split('=')[1] as Staging
  return proofStaging(name)
}

function resolveProgram(arg: string): CrochetProgram {
  if (PATTERN_PROOFS[arg]) return PATTERN_PROOFS[arg]!
  const path = isAbsolute(arg) ? arg : resolve(process.cwd(), arg)
  if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8')) as CrochetProgram
  console.error(`unknown program '${arg}' — proofs: ${Object.keys(PATTERN_PROOFS).join(', ')}, or a path to a *.program.json`)
  process.exit(2)
}

async function mainComposition(program: CompositionProgram, noHero: boolean, yrArg?: number): Promise<void> {
  const yr = compositionYarnRadiusMm(program, yrArg)
  console.log(`[1-2/4] compile + relax + audit (per part)  ${program.name}  (${program.parts.length} parts, yr=${yr})`)
  const res = await renderComposition(program, { yr: yrArg, hero: !noHero }).catch((e) => {
    console.error(`\nPIPELINE FAILED — ${(e as Error).message}`); process.exit(1)
  })
  console.log(`        geometry hash ${res.geometryHash}`)
  if (res.problems.length) {
    for (const p of res.problems) console.error(`  - ${p}`)
    console.error('\nPIPELINE FAILED — a part is NOT genuinely stitched. Fix the part; do not render.')
    process.exit(1)
  }
  console.log('        audit PASS (every part genuinely stitched)')
  console.log(`[3/4] Blender base (staged 3D object, ${loomRenderMode()}) → ${res.basePng}`)
  console.log(res.heroPng ? `[4/4] photoreal hero → ${res.heroPng}${res.fidelityScore != null ? ` (structure ${res.fidelityScore.toFixed(3)} / min ${STRUCT_MIN_DEFAULT})` : ''}` : `[4/4] hero SKIPPED or rejected by the fidelity gate — the base render is the exact-object deliverable${res.fidelityScore != null ? ` (structure ${res.fidelityScore.toFixed(3)} < ${STRUCT_MIN_DEFAULT})` : ''}`)
  console.log('\n================ REPORT (paste-ready) ================')
  console.log(`amigurumi: ${program.name}  [${program.parts.map((p) => p.name).join('+')}]  yr=${yr}  hash=${res.geometryHash}`)
  console.log(`base:      ${res.basePng}`)
  console.log(`hero:      ${res.heroPng ?? '(none — base render is the deliverable)'}`)
  console.log('======================================================')
  console.log(`\nNOT DONE until: find a real amigurumi photo, Read it beside the render, compare plainly, post links to Rebecca.`)
}

async function main(): Promise<void> {
  const arg = process.argv[2] ?? ''
  if (!arg) { console.error('usage: loom-pattern.ts <proof-name | program.json> [yr] [--no-hero]'); process.exit(2) }
  const yrArgTop = process.argv[3] && !process.argv[3]!.startsWith('--') ? Number(process.argv[3]) : undefined
  if (COMPOSITION_PROOFS[arg]) { await mainComposition(COMPOSITION_PROOFS[arg]!, process.argv.includes('--no-hero'), yrArgTop); return }
  const program = resolveProgram(arg)
  const yrArg = process.argv[3] && !process.argv[3]!.startsWith('--') ? Number(process.argv[3]) : undefined
  const noHero = process.argv.includes('--no-hero')
  const yr = programYarnRadiusMm(program, yrArg)
  const staging = resolveStaging(program.name)

  console.log(`[1-2/5] compile + relax + audit  ${program.name}  (form=${program.form}, yr=${yr}, staging=${staging})`)
  const res = await renderProgramGuarded(program, { yr: yrArg, hero: !noHero, staging })
  console.log(`        geometry hash ${res.geometryHash}`)
  if (res.problems.length) {
    for (const p of res.problems) console.error(`  - ${p}`)
    console.error('\nPIPELINE FAILED — the program is NOT genuinely stitched. Fix the program/construction; do not render.')
    process.exit(1)
  }
  console.log('        audit PASS')
  console.log(`[3/5] Blender base (${loomRenderMode()}) → ${res.basePng}`)
  console.log(res.heroPng ? `[4/5] photoreal hero → ${res.heroPng}${res.fidelityScore != null ? ` (structure ${res.fidelityScore.toFixed(3)} / min ${STRUCT_MIN_DEFAULT})` : ''}` : '[4/5] hero SKIPPED (no FAL_KEY or --no-hero) — the base render is the exact-pattern deliverable')

  // 5. The other two faces, from the SAME program.
  const { instructions, chart, chartJsonPath, chartSvgPath, instrPath } = writePatternFaces(program)
  console.log(`[5/5] wrote written instructions, ChartDefinition (${chart.layout}), + chart SVG`)

  console.log('\n--- written instructions (locked template, UK) ---')
  for (const line of instructions) console.log(`  ${line}`)

  console.log('\n================ REPORT (paste-ready) ================')
  console.log(`pattern:   ${program.name}  [${program.form}]  yr=${yr}  hash=${res.geometryHash}`)
  console.log(`base:      ${res.basePng}`)
  console.log(`hero:      ${res.heroPng ?? '(none — base render is the deliverable)'}`)
  console.log(`chart svg: ${chartSvgPath}`)
  console.log(`chart json:${chartJsonPath}`)
  console.log(`instr:     ${instrPath}`)
  console.log('======================================================')
  console.log(`
NOT DONE until: find a real reference photo of this kind of flat crochet, Read it
beside the render, compare plainly, and post the links to Rebecca for her verdict.`)
}

/** Wrap renderProgram so a Blender/render failure is reported cleanly by the CLI
 *  rather than a raw throw (the audit-gate 'problems' path is separate). */
async function renderProgramGuarded(program: CrochetProgram, opts: RenderProgramOptions): Promise<RenderProgramResult> {
  try {
    return await renderProgram(program, opts)
  } catch (e) {
    console.error(`\nPIPELINE FAILED — ${(e as Error).message}`)
    process.exit(1)
  }
}

// Run as a CLI only (importing renderProgram elsewhere must not execute main).
if (process.argv[1] && /loom-pattern\.ts$/.test(process.argv[1])) main()

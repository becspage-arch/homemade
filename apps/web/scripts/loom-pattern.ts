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
import { compileRelaxAudit, programScene, geometryHash } from '../src/lib/loom/crochet/engine/programScene'
import { getChartSymbol } from '../src/lib/craft-charts/chart-symbols'
import { loadCredentials } from './loom-hybrid-fal'
import { fidelityGate, STRUCT_MIN_DEFAULT } from './loom-fidelity-gate'
import { PATTERN_PROOFS } from './loom-pattern-proofs'

loadCredentials()

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet/patterns')
mkdirSync(OUT, { recursive: true })
const BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

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

  const scene = programScene(program, built, yr)
  const scenePath = resolve(outDir, `${name}.json`)
  writeFileSync(scenePath, JSON.stringify(scene))
  result.scenePath = scenePath

  const basePng = resolve(outDir, `${name}.png`)
  const r = spawnSync(
    BLENDER,
    ['--background', '--factory-startup', '--python', resolve(process.cwd(), 'scripts/loom_render_crochet.py'), '--', scenePath, basePng, '150'],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
  if (r.status !== 0 || !existsSync(basePng)) throw new Error(`Blender render did not produce ${basePng}`)
  result.basePng = basePng

  if (options.hero !== false && process.env.FAL_KEY) {
    const heroPng = basePng.replace(/\.png$/, '-hero.png')
    const h = spawnSync('npx', ['tsx', 'scripts/loom-aspen-hero.ts', basePng, '0.55', '0.82'], {
      stdio: ['ignore', 'inherit', 'inherit'], shell: true,
    })
    if (h.status === 0 && existsSync(heroPng)) {
      // Gate the upscale ourselves so a drifted hero is REJECTED (fall back to the
      // exact base) — the hero is a promise the customer gets exactly this.
      const verdict = await fidelityGate(basePng, heroPng)
      result.fidelityScore = verdict.structureScore
      result.heroPng = verdict.pass ? heroPng : null
    }
  }
  return result
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
    const maxCells = Math.max(...rows.map((r) => r.stitches.reduce((a, s) => a + 1, 0)))
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

// ── CLI ───────────────────────────────────────────────────────────────────────
function resolveProgram(arg: string): CrochetProgram {
  if (PATTERN_PROOFS[arg]) return PATTERN_PROOFS[arg]!
  const path = isAbsolute(arg) ? arg : resolve(process.cwd(), arg)
  if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8')) as CrochetProgram
  console.error(`unknown program '${arg}' — proofs: ${Object.keys(PATTERN_PROOFS).join(', ')}, or a path to a *.program.json`)
  process.exit(2)
}

async function main(): Promise<void> {
  const arg = process.argv[2] ?? ''
  if (!arg) { console.error('usage: loom-pattern.ts <proof-name | program.json> [yr] [--no-hero]'); process.exit(2) }
  const program = resolveProgram(arg)
  const yrArg = process.argv[3] && !process.argv[3]!.startsWith('--') ? Number(process.argv[3]) : undefined
  const noHero = process.argv.includes('--no-hero')
  const yr = programYarnRadiusMm(program, yrArg)

  console.log(`[1-2/5] compile + relax + audit  ${program.name}  (form=${program.form}, yr=${yr})`)
  const res = await renderProgramGuarded(program, { yr: yrArg, hero: !noHero })
  console.log(`        geometry hash ${res.geometryHash}`)
  if (res.problems.length) {
    for (const p of res.problems) console.error(`  - ${p}`)
    console.error('\nPIPELINE FAILED — the program is NOT genuinely stitched. Fix the program/construction; do not render.')
    process.exit(1)
  }
  console.log('        audit PASS')
  console.log(`[3/5] Blender base → ${res.basePng}`)
  console.log(res.heroPng ? `[4/5] photoreal hero → ${res.heroPng}${res.fidelityScore != null ? ` (structure ${res.fidelityScore.toFixed(3)} / min ${STRUCT_MIN_DEFAULT})` : ''}` : '[4/5] hero SKIPPED (no FAL_KEY or --no-hero) — the base render is the exact-pattern deliverable')

  // 5. The other two faces, from the SAME program.
  const instructions = writeInstructions(program)
  const chart = programToChart(program)
  const chartJsonPath = resolve(OUT, `${program.name}.chart.json`)
  const chartSvgPath = resolve(OUT, `${program.name}.chart.svg`)
  const instrPath = resolve(OUT, `${program.name}.instructions.txt`)
  writeFileSync(chartJsonPath, JSON.stringify(chart, null, 2))
  writeFileSync(chartSvgPath, programChartSvg(chart))
  writeFileSync(instrPath, instructions.join('\n'))
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

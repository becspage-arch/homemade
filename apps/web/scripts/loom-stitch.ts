/**
 * THE per-stitch pipeline — one command that runs every mechanical step of the
 * stitch process WITH ITS GATES, in order, and refuses to continue past a
 * failure. Made for handing stitch work to any model/session: the steps that
 * used to be skippable are now one atomic command.
 *
 *   cd apps/web && npx tsx scripts/loom-stitch.ts <stitch> [yarnRadiusMm] [hex]
 *
 * Steps:
 *   1. build + relax the standard swatch (engine/buildSwatch, dictionary recipe)
 *   2. NUMERIC AUDIT GATE — genuinely stitched, in data (engine/auditChecks).
 *      Fails → STOPS. Fix the CONSTRUCTION; never tweak the look to pass.
 *   3. Blender render (runs inline; takes ~5–20 min; run ONE at a time)
 *   4. photoreal hero + fidelity gate (loom-aspen-hero)
 *   5. prints the report block: our PNGs + the reference photo to compare against
 *
 * What it CANNOT do for you (the human-judgment half):
 *   - LOOK at the render beside the reference photo and honestly compare
 *   - post BOTH clickable links to Rebecca and STOP for her verdict
 * A stitch is not done until Rebecca has seen that comparison. See the
 * loom-stitch skill + STITCH_ENGINE.md §5/§6.
 */

import { resolve } from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { auditProblems } from '../src/lib/loom/crochet/engine/auditChecks'
import { SWATCH_RECIPES } from '../src/lib/loom/crochet/engine/dictionary'
import { pliedFilaments, smooth, type V3 } from '../src/lib/loom/crochet/yarnLoop'
import { loadCredentials } from './loom-hybrid-fal'

// Populate FAL_KEY etc. from .env.credentials if present, so the hero step below
// can detect whether the photoreal finish is available (absent → base-only).
loadCredentials()

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet')
mkdirSync(OUT, { recursive: true })
const BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

function fail(msg: string): never {
  console.error(`\nPIPELINE FAILED — ${msg}`)
  process.exit(1)
}

function main() {
  const arg = process.argv[2] ?? ''
  if (!isSwatchArg(arg)) fail(`unknown stitch '${arg}' — known: ${Object.keys(SWATCH_RECIPES).join(', ')}`)
  const yr = Number(process.argv[3] ?? 2.4)
  const hex = process.argv[4] ?? '#c98a5e'
  const recipe = SWATCH_RECIPES[arg]
  const W = recipe.auditW
  const name = `stitch-${arg}-yr${yr}`

  // 1. Build + relax.
  console.log(`[1/4] build+relax ${arg} (W=${W}, yr=${yr})`)
  const swatch = buildRelaxedSwatch(arg, W, yr)
  console.log(`      ${swatch.built.model.nodes.length} nodes, 1 strand, ${swatch.built.links.length} recorded interlocks`)

  // 2. Numeric audit gate.
  console.log('[2/4] numeric audit (genuinely stitched, in data)')
  const problems = auditProblems(swatch, arg, W, yr)
  if (problems.length) {
    for (const p of problems) console.error(`  - ${p}`)
    fail('the build is NOT genuinely stitched. Fix the construction (topology/slack/collision budget) — do not adjust shapes to look right, and do not render.')
  }
  console.log('      PASS')

  // 3. Blender render.
  const { built } = swatch
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  const center = smooth(ctrl, 4)
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.62, 3, recipe.twist)
  const scene = {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex },
    strokes: [{ hex, sheen: 0.85, radiusMm, filaments }],
    view: { bgHex: '#6f5440', marginFactor: recipe.viewMargin ?? 0.12, tiltDeg: recipe.tiltDeg, resY: 1200 },
  }
  const scenePath = resolve(OUT, `${name}.json`)
  const basePng = resolve(OUT, `${name}.png`)
  writeFileSync(scenePath, JSON.stringify(scene))
  console.log(`[3/4] Blender render → ${basePng} (minutes; one Blender at a time)`)
  const r = spawnSync(
    BLENDER,
    ['--background', '--factory-startup', '--python', resolve(process.cwd(), 'scripts/loom_render_crochet.py'), '--', scenePath, basePng, '150'],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
  if (r.status !== 0 || !existsSync(basePng)) fail(`Blender render did not produce ${basePng}`)

  // 4. Photoreal hero + fidelity gate. The hero (Fal creative-upscale) is the
  // photoreal FINISH — it needs FAL_KEY. When that's absent (or the upscale
  // fails), the deterministic Blender BASE render from step 3 is still a valid,
  // structure-true artifact to judge construction + look from, so degrade to
  // base-only instead of failing the whole run. The audit gate (step 2) is the
  // one that must never be skipped; the hero is polish.
  const heroPng = basePng.replace(/\.png$/, '-hero.png')
  let heroOk = false
  if (!process.env.FAL_KEY) {
    console.log('[4/4] photoreal hero — SKIPPED (no FAL_KEY); base render is the deliverable')
  } else {
    console.log('[4/4] photoreal hero + fidelity gate')
    const h = spawnSync('npx', ['tsx', 'scripts/loom-aspen-hero.ts', basePng, '0.6', '0.8', arg, recipe.stitch], {
      stdio: ['ignore', 'inherit', 'inherit'],
      shell: true,
    })
    heroOk = h.status === 0 && existsSync(heroPng)
    if (!heroOk) console.error('  hero upscale failed or fidelity gate rejected it — falling back to the base render')
  }

  // 5. The report block — the machine's half is done; the judgment half is not.
  console.log('\n================ REPORT (paste-ready) ================')
  console.log(`stitch:      ${arg} [${recipe.status}]  yr=${yr}`)
  console.log(`our hero:    ${heroOk ? heroPng : '(none — base render is the deliverable)'}`)
  console.log(`our base:    ${basePng}`)
  console.log(`reference:   ${recipe.referenceUrl || 'NONE ON FILE — find a real swatch photo first (WebSearch), add it to SWATCH_RECIPES'}`)
  console.log('======================================================')
  console.log(`
NOT DONE YET. Remaining, non-optional (see the loom-stitch skill):
  1. curl the reference to .loom-scratch/crochet/ and Read BOTH images together.
  2. Compare plainly — name what matches and what does not.
  3. Post BOTH clickable links to Rebecca and STOP for her verdict.
Claiming done without that comparison is the exact failure this pipeline exists to prevent.`)
}

main()

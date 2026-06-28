/**
 * Loom crochet proof — the Aspen Throw (INTERNAL FIXTURE ONLY).
 *
 * Works BACKWARDS from a real, complete crochet pattern (transcribed exactly in
 * `src/lib/loom/crochet/aspenProgram.ts`, self-verified against the designer's
 * printed stitch counts) and renders its EXACT stitches — hdc in the back loop
 * only, on the diagonal — as real yarn loop geometry, then path-traces them
 * through the same Blender recipe that made the embroidery loom photographic.
 *
 * Usage:
 *   cd apps/web
 *   npx tsx scripts/loom-aspen.ts swatch     # close-up patch (fast, the primitive proof)
 *   npx tsx scripts/loom-aspen.ts throw       # full blanket + fringe
 * then render the printed Blender command (see console).
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { expandProgram } from '../src/lib/loom/crochet/aspenProgram'
import { layoutAspen } from '../src/lib/loom/crochet/layout'
import { strokesToBlenderScene } from '../src/lib/loom/render/blenderScene'

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet')
mkdirSync(OUT, { recursive: true })

const BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

function main() {
  const mode = process.argv[2] ?? 'swatch'

  // Always verify the full pattern transcription first — proves every stitch was
  // read and the counts reconcile to the designer's printed numbers.
  const prog = expandProgram()
  console.log(
    `Aspen Throw program verified: ${prog.rows.length} rows, ${prog.totalStitches} hdc stitches total ` +
      `(Row 1=${prog.rows[0]!.count}, Row 56=${prog.rows[55]!.count}, Row 123=${prog.rows[122]!.count}).`,
  )

  let layout
  let name: string
  let samples: number
  // View controls for the Blender backend (legibility): a contrasting ground so
  // the cream pops, a crop, and — for the throw — drape + perspective.
  let view: Record<string, number | string>
  if (mode === 'swatch') {
    // Fewer, bigger stitches + crop INTO the fabric (negative margin) so it fills
    // the frame edge-to-edge and the loops are clearly readable.
    layout = layoutAspen({ patch: { stitches: 18, rows: 15 }, strands: 4 })
    name = 'aspen-swatch'
    samples = 160
    view = { bgHex: '#6f5440', marginFactor: -0.16 }
  } else if (mode === 'throw') {
    // Full blanket at true proportion + fringe. Gauge coarsened (~2.2x) so the
    // ~14k true-gauge stitches fit one Blender scene; the diagonal rib, the 42:50
    // proportion and the fringe all read at this scale. Clean flat-lay on a
    // contrasting ground (real lifestyle drape is a separate staging step — a
    // faked height-field + tilt reads as torn, not draped).
    layout = layoutAspen({ fringe: true, strands: 2, gaugeScale: 2.2 })
    name = 'aspen-throw'
    samples = 120
    view = { bgHex: '#6f5440', marginFactor: 0.12 }
  } else {
    throw new Error(`unknown mode "${mode}" (use swatch | throw)`)
  }

  const scene = strokesToBlenderScene(layout.strokes, {
    widthMm: layout.widthMm,
    heightMm: layout.heightMm,
    hex: '#efe4d6',
  }) as ReturnType<typeof strokesToBlenderScene> & { view?: Record<string, number | string> }
  scene.view = view
  const scenePath = resolve(OUT, `${name}.json`)
  writeFileSync(scenePath, JSON.stringify(scene))
  const filaments = scene.strokes.reduce((n, s) => n + s.filaments.length, 0)
  console.log(
    `[${mode}] ${layout.stitchCount} stitches -> ${scene.strokes.length} strokes, ${filaments} filaments`,
  )
  console.log(`wrote ${scenePath}`)

  const outPng = resolve(OUT, `${name}.png`)
  console.log('\nRender with:')
  console.log(
    `"${BLENDER}" --background --factory-startup --python ${resolve(
      process.cwd(),
      'scripts/loom_render_crochet.py',
    )} -- "${scenePath}" "${outPng}" ${samples}`,
  )
}

main()

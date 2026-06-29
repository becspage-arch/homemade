/**
 * Continuous-yarn proof — ONE strand weaving a whole swatch, relaxed, rendered.
 * Start with plain single crochet (the simplest) to prove the real model before
 * anything else.
 *
 *   cd apps/web && npx tsx scripts/loom-continuous.ts [sc|mix]
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildContinuous } from '../src/lib/loom/crochet/engine/yarnPath'
import { relax } from '../src/lib/loom/crochet/engine/relax'
import { pliedFilaments, smooth, type V3 } from '../src/lib/loom/crochet/yarnLoop'
import type { StitchId } from '../src/lib/loom/crochet/engine/dictionary'

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet')
mkdirSync(OUT, { recursive: true })
const BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

function main() {
  // args: yarnRadiusMm, stitchesPerRow, colourHex, name  (defaults = chunky cream)
  const yr = Number(process.argv[2] ?? 3.0) // yarn WEIGHT (radius mm): ~1.3 fine, ~2 worsted, ~3 bulky
  const W = Number(process.argv[3] ?? 12)
  const hex = process.argv[4] ?? '#e6d4c0'
  const name = process.argv[5] ?? 'continuous-sc'
  const stitch = (process.argv[6] ?? 'sc') as StitchId
  const nRows = 8
  const rows: StitchId[] = Array(nRows).fill(stitch) as StitchId[]
  const built = buildContinuous(rows, W, yr)

  // Collision is what now HOLDS the interlock (yarn can't pass through yarn), so it
  // runs firm and long. No plane pull — the +z/−z relief at each hook IS the
  // interlock; flattening it would unlink the rows.
  relax(built.model, {
    collMinDist: yr * 1.25,
    collK: 0.28,
    collAdjacency: 9, // a post's own two legs (≤9 apart) stay a tight pair; cross-row interlock is ~a full row apart, so it still collides
    planeZ: 0,
    planeK: 0,
    layoutK: 0.06, // blocked flat — holds rows at their worked height so posts stand
    iterations: 320,
  })

  // Render the ONE strand as a single continuous plied yarn.
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  const center = smooth(ctrl, 4)
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.62, 3, 0.1) // gentle twist = plied wool fibre (path no longer knots)
  const strokes = [{ hex, sheen: 0.85, radiusMm, filaments }]

  // Tall stitches (dc/tr) read as standing vertical posts from a slight 3/4 angle —
  // the way the reference photos are shot. sc/hdc stay flat top-down.
  const tall = stitch === 'dc' || stitch === 'tr'
  const scene = {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex },
    strokes,
    view: { bgHex: '#6f5440', marginFactor: 0.12, tiltDeg: tall ? 16 : 0, resY: 1200 },
  }
  const scenePath = resolve(OUT, `${name}.json`)
  writeFileSync(scenePath, JSON.stringify(scene))
  console.log(`${name}: yr=${yr} W=${W}, ${built.strandPath.length} nodes, 1 strand`)
  console.log(`wrote ${scenePath}`)

  const outPng = resolve(OUT, `${name}.png`)
  console.log('\nRender with:')
  console.log(
    `"${BLENDER}" --background --factory-startup --python ${resolve(process.cwd(), 'scripts/loom_render_crochet.py')} -- "${scenePath}" "${outPng}" 150`,
  )
}

main()

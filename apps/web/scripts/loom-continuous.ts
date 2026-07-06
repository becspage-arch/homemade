/**
 * Continuous-yarn swatch scene builder — ONE strand weaving a whole swatch,
 * relaxed, written as a Blender scene. Build + relax live in engine/buildSwatch;
 * all per-stitch values come from the dictionary. Prefer the full pipeline
 * (scripts/loom-stitch.ts) which chains audit → render → hero with gates.
 *
 *   cd apps/web && npx tsx scripts/loom-continuous.ts <yarnRadiusMm> <W> <hex> <name> <stitch>
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { pliedFilaments, smooth, type V3 } from '../src/lib/loom/crochet/yarnLoop'

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet')
mkdirSync(OUT, { recursive: true })
const BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

function main() {
  // args: yarnRadiusMm, stitchesPerRow, colourHex, name, stitch  (defaults = chunky cream)
  const yr = Number(process.argv[2] ?? 3.0) // yarn WEIGHT (radius mm): ~1.3 fine, ~2 worsted, ~3 bulky
  const W = Number(process.argv[3] ?? 12)
  const hex = process.argv[4] ?? '#e6d4c0'
  const name = process.argv[5] ?? 'continuous-sc'
  const stitchArg = process.argv[6] ?? 'sc'
  if (!isSwatchArg(stitchArg)) {
    console.error(`unknown stitch '${stitchArg}'`)
    process.exit(2)
  }
  const { built, recipe } = buildRelaxedSwatch(stitchArg, W, yr)

  // Render the ONE strand as a single continuous plied yarn.
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  const center = smooth(ctrl, 4)
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.62, 3, recipe.twist) // gentle twist = plied wool fibre (path no longer knots)
  const strokes = [{ hex, sheen: 0.85, radiusMm, filaments }]

  const scene = {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex },
    strokes,
    view: { bgHex: '#6f5440', marginFactor: 0.12, tiltDeg: recipe.tiltDeg, resY: 1200 },
  }
  const scenePath = resolve(OUT, `${name}.json`)
  writeFileSync(scenePath, JSON.stringify(scene))
  console.log(`${name}: yr=${yr} W=${W}, ${built.strandPath.length} nodes, 1 strand, ${built.links.length} recorded interlocks`)
  console.log(`wrote ${scenePath}`)

  const outPng = resolve(OUT, `${name}.png`)
  console.log('\nRender with:')
  console.log(
    `"${BLENDER}" --background --factory-startup --python ${resolve(process.cwd(), 'scripts/loom_render_crochet.py')} -- "${scenePath}" "${outPng}" 150`,
  )
}

main()

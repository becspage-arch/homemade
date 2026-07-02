/**
 * Continuous-yarn swatch renderer — ONE strand weaving a whole swatch, relaxed,
 * rendered. Build + relax live in engine/buildSwatch.ts (shared with the audit,
 * so what gets audited is exactly what gets rendered).
 *
 *   cd apps/web && npx tsx scripts/loom-continuous.ts <yarnRadiusMm> <W> <hex> <name> <stitch>
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildRelaxedSwatch } from '../src/lib/loom/crochet/engine/buildSwatch'
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
  const { built, flags } = buildRelaxedSwatch(stitchArg, W, yr)

  // Render the ONE strand as a single continuous plied yarn.
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  const center = smooth(ctrl, 4)
  // Post ribs and the chain read cleaner with a smoother (less barber-poled) yarn.
  const twist = flags.postLike || flags.chain ? 0.05 : 0.1
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.62, 3, twist) // gentle twist = plied wool fibre (path no longer knots)
  const strokes = [{ hex, sheen: 0.85, radiusMm, filaments }]

  // Tall stitches (dc/tr) read as standing vertical posts from a slight 3/4 angle —
  // the way the reference photos are shot. sc/hdc/ch stay flat top-down. Post
  // stitches shoot more side-on (raised ribs cast shadow into the valleys).
  const tiltDeg = flags.postLike ? 40 : flags.tall ? 16 : flags.bobbles ? 24 : 0
  const scene = {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex },
    strokes,
    view: { bgHex: '#6f5440', marginFactor: 0.12, tiltDeg, resY: 1200 },
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

/**
 * Thin vertical slice through all five engine stages on the simplest swatch:
 * single crochet only. Proves the RELAXATION (the crux) before any wider build.
 *
 *   dictionary (sc/ch) -> graph (sc swatch) -> form (flat) -> RELAX -> render
 *
 *   cd apps/web && npx tsx scripts/loom-stitch-slice.ts
 * then render the printed Blender command.
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildScSwatch } from '../src/lib/loom/crochet/engine/scSwatch'
import { relax } from '../src/lib/loom/crochet/engine/relax'
import { pliedFilaments, smooth, type V3 } from '../src/lib/loom/crochet/yarnLoop'

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet')
mkdirSync(OUT, { recursive: true })
const BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

function main() {
  const yr = 3.0 // bulky yarn radius (mm)
  const built = buildScSwatch({ stitches: 8, rows: 7, yarnRadiusMm: yr })

  // RELAX: snug every loop to a yarn diameter, resolving the interlocked shapes.
  relax(built.model, {
    collMinDist: yr * 2, // one yarn diameter
    collK: 0.25,
    collAdjacency: 2,
    planeZ: 0,
    planeK: 0.03,
    iterations: 450,
  })

  // Render each relaxed loop as spun yarn.
  const nodes = built.model.nodes
  const strokes = built.stitchLoops.map((loop) => {
    const ctrl: V3[] = loop.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
    const center = smooth(ctrl, 6)
    const { radiusMm, filaments } = pliedFilaments(center, yr * 0.9, 3, 0.18)
    return { hex: '#e6d4c0', sheen: 0.85, radiusMm, filaments }
  })

  const scene = {
    fabric: { widthMm: 8 * yr * 4 + 30, heightMm: 7 * yr * 4 + 30, hex: '#efe4d6' },
    strokes,
    view: { bgHex: '#6f5440', marginFactor: 0.12 },
  }
  const scenePath = resolve(OUT, 'sc-slice.json')
  writeFileSync(scenePath, JSON.stringify(scene))
  const fc = strokes.reduce((n, s) => n + s.filaments.length, 0)
  console.log(`sc slice: ${built.stitchLoops.length} stitches -> ${strokes.length} loops, ${fc} filaments`)
  console.log(`wrote ${scenePath}`)

  const outPng = resolve(OUT, 'sc-slice.png')
  console.log('\nRender with:')
  console.log(
    `"${BLENDER}" --background --factory-startup --python ${resolve(process.cwd(), 'scripts/loom_render_crochet.py')} -- "${scenePath}" "${outPng}" 150`,
  )
}

main()

/**
 * Engine step 2 — a MIXED swatch (sc / hdc / dc bands) proving the dictionary +
 * relaxation handle different stitch types in one fabric.
 *
 *   cd apps/web && npx tsx scripts/loom-stitch-swatch.ts
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildSwatch } from '../src/lib/loom/crochet/engine/swatch'
import { relax } from '../src/lib/loom/crochet/engine/relax'
import { pliedFilaments, smooth, type V3 } from '../src/lib/loom/crochet/yarnLoop'
import type { StitchId } from '../src/lib/loom/crochet/engine/dictionary'

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet')
mkdirSync(OUT, { recursive: true })
const BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

function main() {
  const yr = 3.0
  // Bands of three stitch types so the height difference reads.
  const rows: StitchId[] = ['sc', 'sc', 'hdc', 'hdc', 'dc', 'dc']
  const built = buildSwatch(rows, 8, yr)

  relax(built.model, {
    collMinDist: yr * 2,
    collK: 0.28,
    collAdjacency: 2,
    planeZ: 0,
    planeK: 0.03,
    iterations: 500,
  })

  const nodes = built.model.nodes
  const strokes = built.stitchLoops.map((loop) => {
    const ctrl: V3[] = loop.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
    const center = smooth(ctrl, 6)
    const { radiusMm, filaments } = pliedFilaments(center, yr * 0.9, 3, 0.18)
    return { hex: '#e6d4c0', sheen: 0.85, radiusMm, filaments }
  })

  const scene = {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex: '#efe4d6' },
    strokes,
    view: { bgHex: '#6f5440', marginFactor: 0.12 },
  }
  const scenePath = resolve(OUT, 'mix-swatch.json')
  writeFileSync(scenePath, JSON.stringify(scene))
  const fc = strokes.reduce((n, s) => n + s.filaments.length, 0)
  console.log(`mix swatch [${rows.join(' ')}]: ${built.stitchLoops.length} stitches, ${fc} filaments`)
  console.log(`wrote ${scenePath}`)

  const outPng = resolve(OUT, 'mix-swatch.png')
  console.log('\nRender with:')
  console.log(
    `"${BLENDER}" --background --factory-startup --python ${resolve(process.cwd(), 'scripts/loom_render_crochet.py')} -- "${scenePath}" "${outPng}" 150`,
  )
}

main()

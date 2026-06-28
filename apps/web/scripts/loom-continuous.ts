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
  const mode = process.argv[2] ?? 'sc'
  const yr = 3.0
  const rows: StitchId[] =
    mode === 'mix' ? ['sc', 'sc', 'hdc', 'hdc', 'dc', 'dc'] : (['sc', 'sc', 'sc', 'sc', 'sc', 'sc'] as StitchId[])
  const W = 8
  const built = buildContinuous(rows, W, yr)

  relax(built.model, {
    collMinDist: yr * 1.7, // tighter -> loops don't puff into balls
    collK: 0.22,
    collAdjacency: 4,
    planeZ: 0,
    planeK: 0.06, // pull firmly toward the plane -> flat fabric, not dumplings
    iterations: 550,
  })

  // Render the ONE strand as a single continuous plied yarn.
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  const center = smooth(ctrl, 4)
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.78, 3, 0.16)
  const strokes = [{ hex: '#e6d4c0', sheen: 0.85, radiusMm, filaments }]

  const scene = {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex: '#efe4d6' },
    strokes,
    view: { bgHex: '#6f5440', marginFactor: 0.12 },
  }
  const name = `continuous-${mode}`
  const scenePath = resolve(OUT, `${name}.json`)
  writeFileSync(scenePath, JSON.stringify(scene))
  console.log(`continuous ${mode}: ${built.strandPath.length} nodes, 1 strand, ${filaments.length} plies`)
  console.log(`wrote ${scenePath}`)

  const outPng = resolve(OUT, `${name}.png`)
  console.log('\nRender with:')
  console.log(
    `"${BLENDER}" --background --factory-startup --python ${resolve(process.cwd(), 'scripts/loom_render_crochet.py')} -- "${scenePath}" "${outPng}" 150`,
  )
}

main()

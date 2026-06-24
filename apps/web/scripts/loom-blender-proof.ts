/**
 * Loom path-traced proof — exports a small embroidery scene to JSON for the
 * Blender backend (`loom_render.py`), then you render it:
 *
 *   cd apps/web && npx tsx scripts/loom-blender-proof.ts
 *   "C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe" --background \
 *     --factory-startup --python scripts/loom_render.py -- \
 *     ../../.loom-scratch/blender/scene.json ../../.loom-scratch/blender/proof.png 200
 *
 * The exact same stitch geometry the raster uses — accuracy is unchanged; only
 * the final shading moves to physically-based path tracing for photo-realism.
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import type { Vec2 } from '../src/lib/loom/core/vec'
import { filamentPolylines, type ThreadStroke } from '../src/lib/loom/render/thread'
import type { StitchContext } from '../src/lib/loom/stitches/types'
import { straightStitch, stemStitch } from '../src/lib/loom/stitches/line'
import { satinBand } from '../src/lib/loom/stitches/satin'
import { frenchKnot, lazyDaisy } from '../src/lib/loom/stitches/detached'
import { chainStitch } from '../src/lib/loom/stitches/chain'

const OUT = resolve(process.cwd(), '../../.loom-scratch/blender')
mkdirSync(OUT, { recursive: true })

const W = 66
const H = 46

function ctx(hex: string, strands = 5, seed = 1): StitchContext {
  return { kind: 'stranded-cotton', hex, strands, seed }
}

const CORAL = '#d8442c'
const GOLD = '#e0a52c'
const TEAL = '#1f8f86'
const LEAF = '#4f8f3a'
const PINK = '#d8688c'

function rgbToHex(r: number, g: number, b: number): string {
  const h = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function leafEdges(cx: number, cy: number, halfLen: number, halfW: number): { a: Vec2[]; b: Vec2[] } {
  const a: Vec2[] = []
  const b: Vec2[] = []
  for (let i = 0; i <= 22; i++) {
    const u = i / 22
    const x = cx - halfLen + u * 2 * halfLen
    const bulge = Math.sin(u * Math.PI) * halfW
    a.push({ x, y: cy - bulge })
    b.push({ x, y: cy + bulge })
  }
  return { a, b }
}

function arc(cx: number, cy: number, len: number, amp: number, seed = 0): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i <= 24; i++) {
    const u = i / 24
    pts.push({ x: cx + u * len, y: cy + Math.sin(u * Math.PI + seed) * amp })
  }
  return pts
}

function build(): ThreadStroke[] {
  const s: ThreadStroke[] = []
  // Satin leaf (the element Rebecca called out), left.
  const leaf = leafEdges(17, 24, 9, 4.5)
  s.push(...satinBand(leaf.a, leaf.b, ctx(LEAF, 6)))
  // A small stem rising from the leaf.
  s.push(...stemStitch(arc(15, 33, 10, 1.6, 0.4), ctx(LEAF, 4)))
  // Straight-stitch spray, upper middle.
  for (let i = 0; i < 6; i++) {
    const x = 33 + i * 2.4
    s.push(...straightStitch({ x: 32, y: 16 }, { x, y: 6 + (i % 2) * 1.2 }, ctx(CORAL, 4)))
  }
  // Chain line, lower middle.
  s.push(...chainStitch(arc(28, 38, 16, 2.0, 0), ctx(TEAL, 4)))
  // Lazy-daisy flower with a French-knot centre, right.
  const fcx = 52
  const fcy = 20
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    s.push(...lazyDaisy({ x: fcx, y: fcy }, { x: fcx + Math.cos(a) * 7, y: fcy + Math.sin(a) * 7 }, ctx(PINK, 4)))
  }
  s.push(...frenchKnot({ x: fcx, y: fcy }, ctx(GOLD, 6), { wraps: 2 }))
  // A cluster of French knots, lower right (berries).
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    s.push(...frenchKnot({ x: 52 + Math.cos(a) * 4, y: 36 + Math.sin(a) * 4 }, ctx(CORAL, 6), { wraps: 2 }))
  }
  return s
}

function main() {
  const strokes = build()
  const out = {
    fabric: { widthMm: W, heightMm: H, hex: '#e3d8c2' },
    strokes: strokes.map((st) => {
      const fp = filamentPolylines(st)
      return {
        hex: rgbToHex(st.material.colour.r, st.material.colour.g, st.material.colour.b),
        sheen: st.material.sheen,
        radiusMm: fp.radiusMm,
        filaments: fp.filaments.map((poly) => poly.map((p) => [p.x, p.y, p.z])),
      }
    }),
  }
  const path = resolve(OUT, 'scene.json')
  writeFileSync(path, JSON.stringify(out))
  const fc = out.strokes.reduce((n, s) => n + s.filaments.length, 0)
  console.log(`wrote ${path}: ${out.strokes.length} strokes, ${fc} filaments`)
}

main()

/**
 * The DMC "Countryside" embroidery pattern (PAT1103S), built stitch-for-stitch
 * for the loom — an internal licensed test fixture, never shipped or sold.
 *
 * Every element uses the stitch the pattern's colour guide specifies (letter =
 * stitch, number = DMC colour): A backstitch, B lazy daisy, C French knot,
 * D stem, E straight, F fern, G whipped wheel. Worked in perlé #5. Layout
 * follows the colour guide + hero photo (a circular wildflower spray rising from
 * a low base).
 *
 *   cd apps/web && npx tsx scripts/loom-countryside.ts
 * then render scene.json with loom_render.py.
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import type { Vec2 } from '../src/lib/loom/core/vec'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { filamentPolylines, type ThreadStroke } from '../src/lib/loom/render/thread'
import type { StitchContext } from '../src/lib/loom/stitches/types'
import { backStitch, stemStitch, straightStitch } from '../src/lib/loom/stitches/line'
import { frenchKnot, lazyDaisy, wovenWheel } from '../src/lib/loom/stitches/detached'
import { fernStitch } from '../src/lib/loom/stitches/chain'

const OUT = resolve(process.cwd(), '../../.loom-scratch/blender')
mkdirSync(OUT, { recursive: true })

const W = 150
const H = 150

// DMC perlé #5 colours from the pattern's key (code -> hex).
const C = {
  white: '#fafafa', // 1  B5200
  dkgreen: '#24402b', // 2  890
  mauve: '#a85968', // 3  3687
  pink: '#f1c9d0', // 4  818
  green: '#425a36', // 5  3345
  lavender: '#c9bbdc', // 6  211
  medgreen: '#6f8c4e', // 7  988
  moss: '#9a9b41', // 8  581
  orange: '#ee8a20', // 9  740
  yellow: '#f8bd2c', // 10 972
  ltgreen: '#bcc785', // 11 3348
  rust: '#9c3420', // 12 919 (deeper red-rust, less orange)
  burgundy: '#6c2029', // 13 902
}

let seedN = 1
function ctx(hex: string): StitchContext {
  // Perlé #5 but a finer working weight — the designer's piece is delicate.
  return { kind: 'perle-cotton', hex, strands: 3, seed: seedN++ }
}

const dir = (a: number, r: number): Vec2 => ({ x: Math.cos(a) * r, y: Math.sin(a) * r })
const add = (p: Vec2, q: Vec2): Vec2 => ({ x: p.x + q.x, y: p.y + q.y })

function bezier(p0: Vec2, p1: Vec2, p2: Vec2, n = 16): Vec2[] {
  const out: Vec2[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    out.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    })
  }
  return out
}

const S: ThreadStroke[] = []
const push = (s: ThreadStroke[]) => S.push(...s)

// ---- element builders (each lays the REAL stitches of that element) ----

/** Dark-red berry sprig: light-green stem-stitch branches, burgundy French-knot berries. */
function berrySprig(base: Vec2, height: number) {
  const top = { x: base.x - 4, y: base.y - height }
  const mid = { x: base.x - 1, y: base.y - height * 0.5 }
  push(stemStitch(bezier(base, mid, top), ctx(C.ltgreen)))
  // side branches
  const branches: Vec2[] = []
  for (let i = 0; i < 5; i++) {
    const t = 0.35 + i * 0.13
    const along = bezier(base, mid, top)[Math.round(t * 16)]!
    const side = i % 2 === 0 ? 1 : -1
    const tip = { x: along.x + side * (6 + i), y: along.y - 4 - i }
    push(stemStitch([along, tip], ctx(C.ltgreen)))
    branches.push(tip)
  }
  // berry clusters (French knots) at the branch tips + top
  for (const tip of [...branches, top]) {
    const cluster = 3 + Math.floor(Math.abs(Math.sin(tip.x)) * 3)
    for (let k = 0; k < cluster; k++) {
      const a = (k / cluster) * Math.PI * 2
      push(frenchKnot(add(tip, dir(a, 1.6 + (k % 2))), ctx(C.burgundy), { wraps: 2 }))
    }
  }
}

/** Queen Anne's lace umbel: dark-green stem + straight-stitch rays + white French-knot heads. */
function umbel(base: Vec2, headY: number, radius: number) {
  const head = { x: base.x, y: headY }
  push(stemStitch(bezier(base, { x: base.x + 2, y: (base.y + headY) / 2 }, head), ctx(C.dkgreen)))
  // Airy umbel: many FINE green rays fanning the upper dome, with just a few
  // tiny white knots scattered at the tips (the designer's is mostly the fine
  // green structure, sparse white — not a solid white fan).
  const rays = 20
  for (let i = 0; i < rays; i++) {
    const f = i / (rays - 1) - 0.5 // -0.5..0.5
    const a = -Math.PI / 2 + f * Math.PI * 1.2
    const rlen = radius * (0.74 + 0.26 * Math.cos(f * Math.PI))
    const tip = add(head, dir(a, rlen))
    push(straightStitch(head, tip, ctx(C.dkgreen)))
    if (i % 2 === 0) push(frenchKnot(add(tip, dir(a, 0.8)), ctx(C.white), { wraps: 1 }))
  }
}

/** Rust round seed-pod: whipped/woven wheel. */
function rustPod(c: Vec2, radius: number) {
  push(wovenWheel(c, radius, ctx(C.rust), { spokes: 9 }))
}

/** Pink aster: mauve straight-stitch petals radiating from a pink French-knot centre, moss stem. */
function aster(c: Vec2, base: Vec2, radius: number) {
  push(stemStitch(bezier(base, { x: (base.x + c.x) / 2, y: (base.y + c.y) / 2 }, c), ctx(C.moss)))
  const petals = 13
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2
    push(straightStitch(add(c, dir(a, 1.2)), add(c, dir(a, radius)), ctx(C.mauve)))
  }
  for (let k = 0; k < 4; k++) push(frenchKnot(add(c, dir(k * 1.6, 0.8)), ctx(C.pink), { wraps: 2 }))
}

/** Yellow flower: golden lazy-daisy petals + orange French-knot centre, dark-green stem. */
function yellowFlower(c: Vec2, base: Vec2) {
  push(stemStitch([base, c], ctx(C.dkgreen)))
  const petals = 5
  for (let i = 0; i < petals; i++) {
    const a = -Math.PI / 2 + (i - petals / 2) * 0.6
    push(lazyDaisy(c, add(c, dir(a, 4.5)), ctx(C.yellow)))
  }
  push(frenchKnot(c, ctx(C.orange), { wraps: 2 }))
}

/** Lavender sprig: fern foliage + small lavender French knots. */
function lavenderSprig(base: Vec2, height: number) {
  const top = { x: base.x + 3, y: base.y - height }
  push(fernStitch(bezier(base, { x: base.x + 1, y: base.y - height * 0.5 }, top), ctx(C.medgreen), { stitchMm: 2.2, stepMm: 2.4 }))
  for (let i = 0; i < 8; i++) {
    const t = 0.4 + i * 0.07
    const p = bezier(base, { x: base.x + 1, y: base.y - height * 0.5 }, top)[Math.round(t * 16)]!
    push(frenchKnot(add(p, { x: (i % 2 ? 1 : -1) * 1.4, y: 0 }), ctx(C.lavender), { wraps: 1 }))
  }
}

/** Leafy sprig: backstitch stem with lazy-daisy leaves alternating up it. */
function leafySprig(base: Vec2, height: number) {
  const top = { x: base.x - 3, y: base.y - height }
  const spine = bezier(base, { x: base.x - 1, y: base.y - height * 0.5 }, top)
  push(backStitch(spine, ctx(C.green)))
  for (let i = 0; i < 7; i++) {
    const t = 0.2 + i * 0.11
    const p = spine[Math.round(t * 16)]!
    const side = i % 2 === 0 ? 1 : -1
    push(lazyDaisy(p, add(p, { x: side * 3.4, y: -1.5 }), ctx(C.green)))
  }
}

/** Feathery dill frond: fern stitch. */
function dillFrond(base: Vec2, height: number, lean: number, col: string) {
  const top = { x: base.x + lean, y: base.y - height }
  push(fernStitch(bezier(base, { x: base.x + lean * 0.4, y: base.y - height * 0.5 }, top), ctx(col), { stitchMm: 2.4, stepMm: 2.3 }))
}

/** Plain tall grass stem (stem stitch). */
function grass(base: Vec2, height: number, lean: number, col = C.dkgreen) {
  const top = { x: base.x + lean, y: base.y - height }
  push(stemStitch(bezier(base, { x: base.x + lean * 0.5, y: base.y - height * 0.55 }, top), ctx(col)))
}

// ---- compose the spray: a tight circular bouquet, stems converging to a low
// base point ~(76,144), flowers filling a circle ~centre (78,82) (matches the
// designer's composition). ----
function build() {
  // Background grasses + dill fronds (fill the circle, fan from low centre).
  grass({ x: 58, y: 140 }, 58, -10, C.ltgreen)
  dillFrond({ x: 66, y: 142 }, 70, -6, C.medgreen)
  dillFrond({ x: 84, y: 142 }, 74, 6, C.moss)
  grass({ x: 90, y: 140 }, 62, 10, C.green)
  grass({ x: 70, y: 141 }, 50, -2, C.green)

  // Dark-red berries, upper-left.
  berrySprig({ x: 50, y: 138 }, 72)

  // Rust seed-pods: a tight cluster left-of-centre, small + red.
  rustPod({ x: 57, y: 94 }, 5.5)
  rustPod({ x: 64, y: 85 }, 5)
  rustPod({ x: 56, y: 76 }, 4.5)
  rustPod({ x: 63, y: 67 }, 5)

  // Queen Anne's lace umbel, top centre.
  umbel({ x: 75, y: 143 }, 40, 17)

  // Pink asters, upper-right.
  const asterBase = { x: 92, y: 140 }
  aster({ x: 97, y: 60 }, asterBase, 5.5)
  aster({ x: 106, y: 69 }, asterBase, 5)
  aster({ x: 98, y: 79 }, asterBase, 5)
  aster({ x: 107, y: 87 }, asterBase, 4.5)
  aster({ x: 99, y: 96 }, asterBase, 5)

  // Yellow flowers, low centre.
  const yBase = { x: 76, y: 142 }
  yellowFlower({ x: 71, y: 110 }, yBase)
  yellowFlower({ x: 79, y: 114 }, yBase)
  yellowFlower({ x: 75, y: 104 }, yBase)

  // Lavender + leafy sprigs fill the right side and a little of the left.
  lavenderSprig({ x: 104, y: 140 }, 62)
  lavenderSprig({ x: 47, y: 132 }, 40)
  leafySprig({ x: 114, y: 140 }, 66)
  leafySprig({ x: 110, y: 126 }, 48)
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

build()
const out = {
  fabric: { widthMm: W, heightMm: H, hex: '#efe9da' },
  strokes: S.map((st) => {
    const fp = filamentPolylines(st)
    return {
      hex: rgbToHex(st.material.colour.r, st.material.colour.g, st.material.colour.b),
      sheen: st.material.sheen,
      radiusMm: fp.radiusMm,
      filaments: fp.filaments.map((poly) => poly.map((p) => [p.x, p.y, p.z])),
    }
  }),
}
const path = resolve(OUT, 'countryside.json')
writeFileSync(path, JSON.stringify(out))
const fc = out.strokes.reduce((n, s) => n + s.filaments.length, 0)
console.log(`wrote ${path}: ${out.strokes.length} strokes, ${fc} filaments`)

// Fast CPU-raster layout preview (seconds) — check composition before the slow
// path-traced hero render.
if (process.argv.includes('--preview')) {
  void (async () => {
    const img = renderEmbroidery({
      widthMm: W, heightMm: H, pxPerMm: 7, ss: 2,
      fabric: { hex: '#efe9da', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 },
      strokes: S,
    })
    const pv = resolve(OUT, 'countryside-preview.png')
    await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(pv)
    console.log(`preview -> ${pv}`)
  })()
}

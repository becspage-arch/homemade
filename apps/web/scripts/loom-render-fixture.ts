/**
 * Render an OUR-OWN pattern through the real format-driven path. Unlike the
 * licensed-PDF importer (which reverse-engineers pale print tints and guesses a
 * stitch from each shape's geometry), this builds the pattern the way our engine
 * / Studio produces it: every element carries its TRUE floss colour and its
 * CONTROLLED stitch slug as data. patternToStrokes() dispatches each by slug to
 * the matching primitive — daisies as real lazy-daisy petals, berries as French-
 * knot clusters, lavender as knot spikes, petals as directional satin fills.
 *
 * This is the production proof: vivid colour + real stitch texture, no blobs,
 * because the stitch and colour are KNOWN, not inferred.
 *
 *   cd apps/web && npx tsx scripts/loom-render-fixture.ts
 */

import { resolve } from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { filamentPolylines } from '../src/lib/loom/render/thread'
import { patternToStrokes, type StitchedElement } from '../src/lib/loom/render/renderPattern'

const OUT = resolve(process.cwd(), '../../.loom-scratch/blender')
mkdirSync(OUT, { recursive: true })
const NAME = 'bouquet'
const W = 150
const H = 165

// Real DMC-style floss colours (rich, not print tints).
const C = {
  white: '#f7f5ee',
  cream: '#f0e4c2',
  gold: '#e3a21c',
  mustard: '#c4860f',
  coral: '#e2564e',
  red: '#9c1f2e',
  pink: '#e294b2',
  magenta: '#bf3a76',
  purple: '#6a4a9c',
  lavender: '#9b86c8',
  blue: '#3f6fb5',
  sky: '#7fa9d8',
  sage: '#88a564',
  leaf: '#5c8a3c',
  green: '#3f6b3a',
}
const THREAD = { type: 'stranded-cotton', weight: '6-strand' }

// Tiny deterministic RNG so the layout is stable run-to-run.
let _s = 1234567
const rnd = () => {
  _s = (_s * 1103515245 + 12345) & 0x7fffffff
  return _s / 0x7fffffff
}
const jit = (m: number) => (rnd() - 0.5) * 2 * m

type Pt = [number, number]
const els: StitchedElement[] = []
const knot = (at: Pt, hex: string) =>
  els.push({ stitchType: 'embroidery-french-knot', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'point', at } })
const line = (slug: string, points: Pt[], hex: string, dir: number | null = null) =>
  els.push({ stitchType: slug, colourHex: hex, thread: THREAD, directionDeg: dir, geometry: { kind: 'path', points } })

/** A daisy: real lazy-daisy petals radiating from a French-knot centre. */
function daisy(cx: number, cy: number, r: number, petal: string, centre: string, n = 9) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + jit(0.1)
    const base: Pt = [cx + Math.cos(a) * r * 0.28, cy + Math.sin(a) * r * 0.28]
    const tip: Pt = [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
    els.push({ stitchType: 'embroidery-detached-chain', colourHex: petal, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: [base, tip], at: base } })
  }
  for (let i = 0; i < 5; i++) knot([cx + jit(r * 0.18), cy + jit(r * 0.18)], centre)
}

/** A berry / seed-head cluster: packed French knots (texture, never a flat disc). */
function berries(cx: number, cy: number, r: number, hex: string, count = 14) {
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2
    const d = Math.sqrt(rnd()) * r
    knot([cx + Math.cos(a) * d, cy + Math.sin(a) * d], hex)
  }
}

/** A lavender / grape-hyacinth spike: a vertical column of knots, fat at the base. */
function spike(bx: number, by: number, h: number, hex: string) {
  const rows = Math.round(h / 2.4)
  for (let i = 0; i < rows; i++) {
    const t = i / rows
    const w = (1 - t) * 2.6 + 0.6
    const y = by - t * h
    knot([bx + jit(w), y], hex)
    if (rnd() > 0.45) knot([bx + jit(w), y + jit(1)], hex)
  }
}

/** A petalled flower: each petal a directional satin fill in true colour. */
function satinFlower(cx: number, cy: number, r: number, petals: number, hex: string, centre?: string) {
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + jit(0.05)
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    const px = -dy
    const py = dx
    const w = r * 0.42
    const poly: Pt[] = [
      [cx + px * w * 0.35, cy + py * w * 0.35],
      [cx + dx * r * 0.5 + px * w, cy + dy * r * 0.5 + py * w],
      [cx + dx * r, cy + dy * r],
      [cx + dx * r * 0.5 - px * w, cy + dy * r * 0.5 - py * w],
      [cx - px * w * 0.35, cy - py * w * 0.35],
    ]
    line('embroidery-satin', poly, hex, (a * 180) / Math.PI)
  }
  if (centre) berries(cx, cy, r * 0.3, centre, 6)
}

/** A fern frond: fern stitch along a curved rib. */
function fern(base: Pt, tip: Pt, hex: string) {
  const pts: Pt[] = []
  const n = 6
  for (let i = 0; i <= n; i++) {
    const t = i / n
    pts.push([base[0] + (tip[0] - base[0]) * t + jit(1.5), base[1] + (tip[1] - base[1]) * t])
  }
  line('embroidery-fern', pts, hex)
}

const stem = (cx: number, cy: number, hex = C.green) =>
  line('embroidery-stem', [[75 + jit(2), 150], [(75 + cx) / 2 + jit(4), (150 + cy) / 2], [cx, cy]], hex)

// ---- The bouquet: stems first (under), then heads, then foliage on top. ----
const heads: Array<[number, number]> = [
  [44, 64], [70, 52], [62, 80], [92, 62], [108, 78],
  [34, 86], [82, 92], [50, 100], [102, 98], [122, 86], [70, 112],
]
for (const [hx, hy] of heads) stem(hx, hy)

// foliage fronds fanning out
fern([75, 150], [22, 70], C.sage)
fern([75, 150], [128, 74], C.sage)
fern([75, 150], [40, 50], C.leaf)
fern([75, 150], [112, 52], C.leaf)
fern([75, 150], [75, 36], C.green)

daisy(44, 64, 12, C.white, C.gold)
daisy(70, 52, 13, C.white, C.mustard)
daisy(122, 86, 11, C.pink, C.gold)
satinFlower(62, 80, 12, 6, C.coral, C.red)
satinFlower(82, 92, 11, 5, C.magenta, C.gold)
berries(108, 78, 8, C.red)
berries(34, 86, 7, C.red)
berries(70, 112, 7, C.coral)
spike(50, 104, 16, C.purple)
spike(102, 102, 15, C.blue)
spike(92, 66, 12, C.lavender)

// woven-wheel rose
els.push({ stitchType: 'embroidery-ribbed-spider-web', colourHex: C.coral, thread: THREAD, directionDeg: null, geometry: { kind: 'disc', at: [92, 62], radiusMm: 7 } })

// binding at the base of the bunch
for (let i = 0; i < 8; i++) line('embroidery-straight', [[68, 138 + i * 1.6], [82, 137 + i * 1.6]], C.mustard)

console.log(`bouquet: ${els.length} stitched elements`)
const strokes = patternToStrokes(els, { strands: 6, defaultThread: THREAD })
console.log(`-> ${strokes.length} strokes`)

// CPU preview
const img = renderEmbroidery({
  widthMm: W, heightMm: H, pxPerMm: 7, ss: 2,
  fabric: { hex: '#f6f3ec', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 },
  strokes,
})
sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png()
  .toFile(resolve(OUT, NAME + '-vec-preview.png')).then(() => console.log('preview written'))

// Blender scene
const hx = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
const scene = {
  fabric: { widthMm: W, heightMm: H, hex: '#f6f3ec' },
  strokes: strokes.map((st) => {
    const fp = filamentPolylines(st)
    return {
      hex: `#${hx(st.material.colour.r)}${hx(st.material.colour.g)}${hx(st.material.colour.b)}`,
      sheen: st.material.sheen, radiusMm: fp.radiusMm,
      filaments: fp.filaments.map((poly) => poly.map((q) => [q.x, q.y, q.z])),
    }
  }),
}
writeFileSync(resolve(OUT, NAME + '.json'), JSON.stringify(scene))
console.log('scene written')

// Needlework-format fixture (the data shape the Studio/our engine emits)
const fixture = {
  _source: 'OUR-OWN engine fixture — demonstrates true floss colour + controlled stitch slug per element.',
  name: NAME, discipline: 'SURFACE_EMBROIDERY', patternFormat: 'SURFACE_VECTOR',
  defaultThread: THREAD, finishedSizeMm: { width: W, height: H },
  vectorData: { width: W, height: H, svgContent: '', regions: [] },
  stitchedElements: els,
}
writeFileSync(resolve(OUT, NAME + '.pattern.json'), JSON.stringify(fixture))
console.log(`pattern fixture written: ${els.length} elements`)

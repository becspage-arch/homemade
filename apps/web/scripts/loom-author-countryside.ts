/**
 * Author the DMC Countryside pattern as CLEAN structured data in our format —
 * the Studio-equivalent of what our own patterns hand the loom (geometry +
 * controlled stitch slug + colour + thread per element). Internal licensed
 * fixture only. Faithful to the pattern: real stitches + colours from the colour
 * key, flowing stems + compound umbel + correct counts matching the chart/hero.
 *
 * Writes countryside.pattern.json; render it with loom-render-countryside.ts.
 *
 *   cd apps/web && npx tsx scripts/loom-author-countryside.ts
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = resolve(process.cwd(), 'src/lib/loom/fixtures')
mkdirSync(OUT, { recursive: true })

const W = 150
const H = 150

const PALETTE = [
  { code: 1, dmc: 'B5200', name: 'snow white', hex: '#fcfcfc', skeins: 1 },
  { code: 2, dmc: '890', name: 'ultra dark pistachio green', hex: '#243f29', skeins: 1 },
  { code: 3, dmc: '3687', name: 'mauve', hex: '#b05a6c', skeins: 1 },
  { code: 4, dmc: '818', name: 'baby pink', hex: '#f2cdd4', skeins: 1 },
  { code: 5, dmc: '3345', name: 'dark hunter green', hex: '#46603a', skeins: 1 },
  { code: 6, dmc: '211', name: 'light lavender', hex: '#cdbfde', skeins: 1 },
  { code: 7, dmc: '988', name: 'medium forest green', hex: '#74914f', skeins: 1 },
  { code: 8, dmc: '581', name: 'moss green', hex: '#9ea03f', skeins: 1 },
  { code: 9, dmc: '740', name: 'tangerine', hex: '#f0891b', skeins: 1 },
  { code: 10, dmc: '972', name: 'deep canary', hex: '#fbbe26', skeins: 1 },
  { code: 11, dmc: '3348', name: 'light yellow green', hex: '#bfca84', skeins: 1 },
  { code: 12, dmc: '919', name: 'red copper', hex: '#a83c22', skeins: 1 },
  { code: 13, dmc: '902', name: 'very dark garnet', hex: '#6e2029', skeins: 1 },
]
const hex = (c: number) => PALETTE.find((p) => p.code === c)!.hex

type Pt = [number, number]
interface El {
  stitchType: string
  colourHex: string
  colourRef: string
  thread: null
  directionDeg: number | null
  geometry: { kind: 'path' | 'point' | 'disc'; points?: Pt[]; at?: Pt; radiusMm?: number }
}
const els: El[] = []
const dmcOf = (c: number) => PALETTE.find((p) => p.code === c)!.dmc
function line(slug: string, colour: number, points: Pt[]) {
  els.push({ stitchType: slug, colourHex: hex(colour), colourRef: `DMC ${dmcOf(colour)}`, thread: null, directionDeg: null, geometry: { kind: 'path', points } })
}
function knot(colour: number, at: Pt) {
  els.push({ stitchType: 'embroidery-french-knot', colourHex: hex(colour), colourRef: `DMC ${dmcOf(colour)}`, thread: null, directionDeg: null, geometry: { kind: 'point', at } })
}
function disc(colour: number, at: Pt, radiusMm: number) {
  els.push({ stitchType: 'embroidery-ribbed-spider-web', colourHex: hex(colour), colourRef: `DMC ${dmcOf(colour)}`, thread: null, directionDeg: null, geometry: { kind: 'disc', at, radiusMm } })
}
function daisy(colour: number, base: Pt, tip: Pt) {
  els.push({ stitchType: 'embroidery-detached-chain', colourHex: hex(colour), colourRef: `DMC ${dmcOf(colour)}`, thread: null, directionDeg: null, geometry: { kind: 'path', points: [base, tip] } })
}

const bez = (p0: Pt, p1: Pt, p2: Pt, n = 16): Pt[] => {
  const out: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]])
  }
  return out
}
const polar = (c: Pt, a: number, r: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]

// ── elements (coords mm, y down; flowers fill a circle, stems flow from a low base) ──

// Queen Anne's lace compound umbel — top centre.
function umbel(base: Pt, head: Pt, radius: number) {
  line('embroidery-stem', 2, bez(base, [base[0] + 3, (base[1] + head[1]) / 2], head))
  const rays = 13
  for (let i = 0; i < rays; i++) {
    const f = i / (rays - 1) - 0.5
    const a = -Math.PI / 2 + f * Math.PI * 1.1
    const rlen = radius * (0.72 + 0.28 * Math.cos(f * Math.PI))
    const tip = polar(head, a, rlen)
    line('embroidery-straight', 2, [head, tip]) // ray
    // a little dome-cluster of white florets at the ray tip
    const flo = 3
    for (let k = 0; k < flo; k++) knot(1, polar(tip, a + (k - 1) * 0.6, 1.1))
  }
}

// Dark-red berry sprig — branching light-green stems + burgundy knot clusters.
function berrySprig(base: Pt, top: Pt) {
  const spine = bez(base, [base[0] - 2, (base[1] + top[1]) / 2], top)
  line('embroidery-stem', 11, spine)
  for (let i = 0; i < 5; i++) {
    const t = 0.45 + i * 0.12
    const p = spine[Math.round(t * 16)]!
    const side = i % 2 === 0 ? 1 : -1
    const tip: Pt = [p[0] + side * (4 + i * 0.6), p[1] - 3 - i * 0.5]
    line('embroidery-stem', 11, [p, tip])
    const n = 3 + (i % 2)
    for (let k = 0; k < n; k++) knot(13, polar(tip, (k / n) * Math.PI * 2, 1.4 + (k % 2) * 0.7))
  }
  for (let k = 0; k < 4; k++) knot(13, polar(top, (k / 4) * Math.PI * 2, 1.6))
}

// Pink aster — moss stem, mauve straight-stitch petals, pink knot centre.
function aster(c: Pt, base: Pt, radius: number) {
  line('embroidery-stem', 8, bez(base, [(base[0] + c[0]) / 2, (base[1] + c[1]) / 2 + 4], c))
  const petals = 13
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2
    line('embroidery-straight', 3, [polar(c, a, 1.1), polar(c, a, radius)])
  }
  for (let k = 0; k < 4; k++) knot(4, polar(c, (k / 4) * Math.PI * 2, 0.8))
}

// Yellow flower — dark-green stem, golden lazy-daisy petals, orange knot centre.
function yellowFlower(c: Pt, base: Pt) {
  line('embroidery-stem', 2, bez(base, [(base[0] + c[0]) / 2, (base[1] + c[1]) / 2], c))
  const petals = 5
  for (let i = 0; i < petals; i++) {
    const a = -Math.PI / 2 + (i - petals / 2) * 0.62
    daisy(10, c, polar(c, a, 4.4))
  }
  knot(9, c)
}

// Rust seed-pod — whipped wheel.
function pod(c: Pt, r: number) {
  disc(12, c, r)
}

// Lavender sprig — fern foliage + small lavender knots up a flowing stem.
function lavenderSprig(base: Pt, top: Pt) {
  const spine = bez(base, [(base[0] + top[0]) / 2 + 2, (base[1] + top[1]) / 2], top)
  line('embroidery-fern', 7, spine)
  for (let i = 0; i < 8; i++) {
    const p = spine[Math.round((0.35 + i * 0.08) * 16)]!
    knot(6, [p[0] + (i % 2 ? 1.3 : -1.3), p[1]])
  }
}

// Leafy sprig — backstitch stem + lazy-daisy leaves alternating.
function leafySprig(base: Pt, top: Pt) {
  const spine = bez(base, [(base[0] + top[0]) / 2 - 2, (base[1] + top[1]) / 2], top)
  line('embroidery-back', 5, spine)
  for (let i = 0; i < 7; i++) {
    const p = spine[Math.round((0.2 + i * 0.11) * 16)]!
    const side = i % 2 === 0 ? 1 : -1
    daisy(5, p, [p[0] + side * 3.4, p[1] - 1.6])
  }
}

// Feathery dill frond — fern.
function dill(base: Pt, top: Pt, colour: number) {
  line('embroidery-fern', colour, bez(base, [(base[0] + top[0]) / 2, (base[1] + top[1]) / 2], top))
}
// Plain grass stem.
function grass(base: Pt, top: Pt, colour = 2) {
  line('embroidery-stem', colour, bez(base, [(base[0] + top[0]) / 2, (base[1] + top[1]) / 2], top))
}

function build() {
  // background foliage fanning from a low base
  grass([58, 140], [50, 80], 11)
  dill([66, 142], [60, 70], 7)
  dill([84, 142], [90, 66], 8)
  grass([90, 140], [100, 78], 5)
  grass([70, 141], [68, 92], 5)

  berrySprig([50, 138], [44, 62])

  pod([57, 95], 5.5)
  pod([64, 85], 5)
  pod([56, 76], 4.5)
  pod([63, 67], 5)

  umbel([75, 143], [75, 42], 18)

  const aBase: Pt = [92, 140]
  aster([97, 60], aBase, 5.5)
  aster([107, 69], aBase, 5)
  aster([98, 79], aBase, 5)
  aster([108, 87], aBase, 4.5)
  aster([99, 96], aBase, 5)

  const yBase: Pt = [76, 142]
  yellowFlower([71, 110], yBase)
  yellowFlower([79, 114], yBase)
  yellowFlower([75, 104], yBase)

  lavenderSprig([104, 140], [110, 78])
  lavenderSprig([47, 132], [44, 96])
  leafySprig([114, 140], [120, 76])
  leafySprig([110, 126], [116, 92])
}

build()

const fixture = {
  _source: 'DMC "Countryside" PAT1103S — INTERNAL licensed test fixture. Do NOT ship, sell, publish, or redistribute. Authored as clean structured data (Studio-equivalent) to validate the loom render engine.',
  name: 'Countryside',
  designer: 'DMC',
  discipline: 'SURFACE_EMBROIDERY',
  patternFormat: 'SURFACE_VECTOR',
  frameType: 'HOOP',
  fabricSpec: { material: 'natural even-weave linen', colourHex: '#e3d8c2', count: null },
  threadTypes: ['DMC Perlé Cotton Art. AR115 — No.5 medium'],
  defaultThread: { type: 'perle', weight: '5' },
  needle: 'No. 12',
  finishedSizeMm: { width: W, height: H },
  license: { licenseType: 'ALL_RIGHTS_RESERVED', attributionRequired: true, commercialUseAllowed: false, redistributionAllowed: false, attributionText: 'Pattern © DMC. Internal fixture only.' },
  palette: PALETTE,
  stitchLegend: [
    { letter: 'A', stitchId: 'embroidery-back', name: 'Backstitch' },
    { letter: 'B', stitchId: 'embroidery-detached-chain', name: 'Lazy daisy (detached chain)' },
    { letter: 'C', stitchId: 'embroidery-french-knot', name: 'French knot' },
    { letter: 'D', stitchId: 'embroidery-stem', name: 'Stem stitch' },
    { letter: 'E', stitchId: 'embroidery-straight', name: 'Straight stitch' },
    { letter: 'F', stitchId: 'embroidery-fern', name: 'Fern stitch' },
    { letter: 'G', stitchId: 'embroidery-ribbed-spider-web', name: 'Whipped wheel' },
  ],
  vectorData: { width: W, height: H, regions: [] },
  stitchedElements: els,
}

const out = resolve(OUT, 'countryside.pattern.json')
writeFileSync(out, JSON.stringify(fixture, null, 2))
console.log(`wrote ${out}: ${els.length} stitched elements`)
const by: Record<string, number> = {}
for (const e of els) by[e.stitchType] = (by[e.stitchType] ?? 0) + 1
console.log(JSON.stringify(by))

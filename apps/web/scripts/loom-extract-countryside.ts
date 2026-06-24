/**
 * Extract the DMC Countryside pattern (PAT1103S) from its PDF into ONE internal
 * file, shaped like our needlework SURFACE pattern data (NeedleworkPattern +
 * NeedleworkVectorData + NeedleworkRegionAnnotation). Internal licensed fixture
 * only — never shipped, sold, or redistributed.
 *
 * The point: this is the shape the loom will receive for our OWN patterns (the
 * Studio stores exactly this). Producing it here proves the loom can consume it.
 *
 * - Geometry (vectorData.svgContent): TRACED from the technical chart (page 2),
 *   the customer line template — the design's real lines, as SVG paths in mm.
 * - Stitch + colour per element (regionAnnotations + patternSpec): transcribed
 *   from the colour guide (page 1) + stitch legend + colour key (pages 3–4).
 *
 *   cd apps/web && npx tsx scripts/loom-extract-countryside.ts
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { inkMask, clearBorder, thin } from '../src/lib/loom/trace/skeleton'
import { trace, simplify, describe } from '../src/lib/loom/trace/vectorize'

const PAT = resolve(process.cwd(), '../../.loom-scratch/pattern')
const OUT = resolve(process.cwd(), 'src/lib/loom/fixtures')
mkdirSync(OUT, { recursive: true })

const DESIGN = { x0: 0.07, y0: 0.13, x1: 0.93, y1: 0.62 }
const TARGET_W = 760
const CANVAS_W = 150 // mm

// ── The pattern's colour key (pages 3–4), code → DMC → plain name → hex ────────
const PALETTE = [
  { code: 1, dmc: 'B5200', name: 'snow white', hex: '#fafafa', skeins: 1 },
  { code: 2, dmc: '890', name: 'ultra dark pistachio green', hex: '#24402b', skeins: 1 },
  { code: 3, dmc: '3687', name: 'mauve', hex: '#a85968', skeins: 1 },
  { code: 4, dmc: '818', name: 'baby pink', hex: '#f1c9d0', skeins: 1 },
  { code: 5, dmc: '3345', name: 'dark hunter green', hex: '#425a36', skeins: 1 },
  { code: 6, dmc: '211', name: 'light lavender', hex: '#c9bbdc', skeins: 1 },
  { code: 7, dmc: '988', name: 'medium forest green', hex: '#6f8c4e', skeins: 1 },
  { code: 8, dmc: '581', name: 'moss green', hex: '#9a9b41', skeins: 1 },
  { code: 9, dmc: '740', name: 'tangerine', hex: '#ee8a20', skeins: 1 },
  { code: 10, dmc: '972', name: 'deep canary', hex: '#f8bd2c', skeins: 1 },
  { code: 11, dmc: '3348', name: 'light yellow green', hex: '#bcc785', skeins: 1 },
  { code: 12, dmc: '919', name: 'red copper', hex: '#9c3420', skeins: 1 },
  { code: 13, dmc: '902', name: 'very dark garnet', hex: '#6c2029', skeins: 1 },
]
const hexOf = (code: number) => PALETTE.find((p) => p.code === code)!.hex
const dmcOf = (code: number) => PALETTE.find((p) => p.code === code)!.dmc

// ── Stitch legend (page 4), code letter → CONTROLLED dictionary slug ───────────
// Slugs resolve against packages/db/scripts/data/embroidery-stitches.ts (seeded
// into Stitch, craft='embroidery', 'embroidery-<base>'). This is the single
// source of truth shared by the loom, the teaching library and the patterns.
// G ("Whipped wheel / Point d'araignée") = the spoked-wheel family; mapped to
// ribbed-spider-web (canonical "spoked decorative wheels"); woven-wheel is the
// woven-rose alternative — flagged for needlework confirmation.
const STITCH_LEGEND = [
  { letter: 'A', stitchId: 'embroidery-back', name: 'Backstitch' },
  { letter: 'B', stitchId: 'embroidery-detached-chain', name: 'Lazy daisy (detached chain)' },
  { letter: 'C', stitchId: 'embroidery-french-knot', name: 'French knot' },
  { letter: 'D', stitchId: 'embroidery-stem', name: 'Stem stitch' },
  { letter: 'E', stitchId: 'embroidery-straight', name: 'Straight stitch' },
  { letter: 'F', stitchId: 'embroidery-fern', name: 'Fern stitch' },
  { letter: 'G', stitchId: 'embroidery-ribbed-spider-web', name: 'Whipped wheel', confirm: 'vs embroidery-woven-wheel' },
]
const stitchOf = (letter: string) => STITCH_LEGEND.find((s) => s.letter === letter)!.stitchId

/**
 * Every element of the design with its parts — each part is (stitch letter +
 * colour code), exactly as the colour guide labels it (e.g. "E2" = straight
 * stitch in colour 2). Counts/placement are read off the chart + hero. This is
 * the authoritative "what to make" content; it maps 1:1 to regionAnnotations.
 */
const ELEMENTS = [
  { id: 'berry-sprig', label: 'Dark-red berry sprig', count: 2, region: 'upper-left', parts: [
    { part: 'stems', label: 'D11', stitch: 'D', colour: 11 },
    { part: 'berries', label: 'C13', stitch: 'C', colour: 13, note: 'clusters of French knots along the branch tips' },
  ] },
  { id: 'umbel', label: "Queen Anne's lace / cow-parsley compound umbel", count: 1, region: 'top-centre', parts: [
    { part: 'main-stem', label: 'D2', stitch: 'D', colour: 2 },
    { part: 'rays', label: 'E2', stitch: 'E', colour: 2, note: '~12–16 straight rays radiating from the stem top' },
    { part: 'florets', label: 'C1', stitch: 'C', colour: 1, note: 'small dome-clusters of white French knots at each ray tip' },
  ] },
  { id: 'rust-pod', label: 'Rust round seed-pod', count: 4, region: 'centre-left', parts: [
    { part: 'pod', label: 'G12', stitch: 'G', colour: 12, note: 'whipped/woven wheel, varying diameters' },
  ] },
  { id: 'pink-aster', label: 'Pink aster / daisy', count: 6, region: 'right', parts: [
    { part: 'stems', label: 'D8', stitch: 'D', colour: 8 },
    { part: 'petals', label: 'E3', stitch: 'E', colour: 3, note: '~12–14 straight-stitch petals radiating from the centre' },
    { part: 'centre', label: 'C4', stitch: 'C', colour: 4, note: 'a few pink French knots' },
  ] },
  { id: 'yellow-flower', label: 'Yellow flower', count: 4, region: 'low-centre', parts: [
    { part: 'stems', label: 'D2', stitch: 'D', colour: 2 },
    { part: 'petals', label: 'B10', stitch: 'B', colour: 10, note: '5–6 lazy-daisy petals' },
    { part: 'centre', label: 'C9', stitch: 'C', colour: 9, note: 'orange French knot centre' },
  ] },
  { id: 'lavender-sprig', label: 'Lavender / grass sprig', count: 2, region: 'right + left fill', parts: [
    { part: 'foliage', label: 'F7', stitch: 'F', colour: 7 },
    { part: 'florets', label: 'C6', stitch: 'C', colour: 6, note: 'small lavender French knots up the stem' },
  ] },
  { id: 'leafy-sprig', label: 'Leafy sprig', count: 2, region: 'right edge', parts: [
    { part: 'stem', label: 'A5', stitch: 'A', colour: 5 },
    { part: 'leaves', label: 'B5', stitch: 'B', colour: 5, note: 'lazy-daisy leaves alternating up the stem' },
  ] },
  { id: 'dill-frond', label: 'Feathery dill frond', count: 3, region: 'scattered fill', parts: [
    { part: 'frond', label: 'A8 / F8', stitch: 'F', colour: 8 },
  ] },
  { id: 'grass-stem', label: 'Plain tall grass stem', count: 5, region: 'background fill', parts: [
    { part: 'stem', label: 'D2', stitch: 'D', colour: 2 },
  ] },
]

async function cropRaw(page: string, w: number) {
  const meta = await sharp(page).metadata()
  const W = meta.width!
  const H = meta.height!
  const { data, info } = await sharp(page)
    .extract({
      left: Math.round(DESIGN.x0 * W),
      top: Math.round(DESIGN.y0 * H),
      width: Math.round((DESIGN.x1 - DESIGN.x0) * W),
      height: Math.round((DESIGN.y1 - DESIGN.y0) * H),
    })
    .resize(w)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

async function main() {
  // Geometry from the technical chart.
  const chart = await cropRaw(resolve(PAT, 'page2.png'), TARGET_W)
  const mask = inkMask(chart.data, chart.w, chart.h, { lumaMax: 0.6 })
  clearBorder(mask, 2)
  const skel = thin(mask)
  const shapes = trace(skel)
    .map((p) => ({ ...p, pts: simplify(p.pts, 1.2) }))
    .map(describe)
    // Drop skeleton noise + the chart's full-span frame edges.
    .filter((s) => (s.loop ? s.diag >= 2.5 : s.len >= 3))
    .filter((s) => s.bw < chart.w * 0.9 && s.bh < chart.h * 0.9)

  const mmPerPx = CANVAS_W / TARGET_W
  const canvasH = +(chart.h * mmPerPx).toFixed(1)
  // SVG of the traced design, paths in mm (the geometry layer).
  const f = (n: number) => +(n * mmPerPx).toFixed(2)
  const paths = shapes
    .map((s) => {
      const d = s.pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${f(p[0])} ${f(p[1])}`).join(' ') + (s.loop ? ' Z' : '')
      return `<path d="${d}"/>`
    })
    .join('')
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${canvasH}" fill="none" stroke="#24402b" stroke-width="0.4">${paths}</svg>`

  // ── Bind geometry → stitch + colour (PDF recovery, confined to the extractor).
  // Each traced shape is classified by type (dot / big loop / small loop / line)
  // and design region, then assigned the controlled stitch slug + the colour the
  // colour guide gives that element. Region boxes are in normalised chart coords.
  const cb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
  for (const s of shapes) for (const [x, y] of s.pts) {
    if (x < cb.x0) cb.x0 = x
    if (y < cb.y0) cb.y0 = y
    if (x > cb.x1) cb.x1 = x
    if (y > cb.y1) cb.y1 = y
  }
  const uv = (cx: number, cy: number) => [(cx - cb.x0) / (cb.x1 - cb.x0), (cy - cb.y0) / (cb.y1 - cb.y0)] as const
  const inBox = (u: number, v: number, b: number[]) => u >= b[0]! && u <= b[2]! && v >= b[1]! && v <= b[3]!
  // [u0,v0,u1,v1] regions (v=0 top).
  const R = {
    umbel: [0.42, 0.0, 0.74, 0.46],
    berries: [0.0, 0.04, 0.34, 0.56],
    pods: [0.27, 0.42, 0.53, 0.92],
    asters: [0.57, 0.18, 1.0, 0.82],
    yellow: [0.39, 0.7, 0.67, 1.0],
    leafy: [0.82, 0.18, 1.0, 0.96],
  }
  const stitchedElements: {
    stitchType: string
    colourRef: string
    colourHex: string
    thread: null
    directionDeg: number | null
    geometry: { kind: string; points?: number[][]; at?: number[]; radiusMm?: number }
  }[] = []
  const pathPts = (s: (typeof shapes)[number]) => s.pts.map((p) => [f(p[0]), f(p[1])])
  const emit = (stitch: string, colour: number, geom: { kind: string; points?: number[][]; at?: number[]; radiusMm?: number }) =>
    stitchedElements.push({ stitchType: stitch, colourRef: `DMC ${dmcOf(colour)}`, colourHex: hexOf(colour), thread: null, directionDeg: null, geometry: geom })

  // Pod recovery: the rust seed-pods are drawn as outline circles but trace as
  // short curved arcs (broken by their stems). Cluster the curved arcs in the
  // pod region into one whipped wheel each.
  const consumed = new Set<(typeof shapes)[number]>()
  const podCandidates = shapes.filter((s) => {
    const [u, v] = uv(s.cx, s.cy)
    const lenMm = s.len * mmPerPx
    const curved = s.len > s.diag * 1.18
    return inBox(u, v, R.pods) && curved && lenMm > 1.5 && lenMm < 16
  })
  const clusterTol = 3.5 / mmPerPx // px
  for (const seed of podCandidates) {
    if (consumed.has(seed)) continue
    const cluster = [seed]
    consumed.add(seed)
    for (const c of podCandidates) {
      if (consumed.has(c)) continue
      if (Math.hypot(c.cx - seed.cx, c.cy - seed.cy) < clusterTol) {
        cluster.push(c)
        consumed.add(c)
      }
    }
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const c of cluster) for (const [x, y] of c.pts) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
    const rPx = Math.max(maxX - minX, maxY - minY) / 2
    if (rPx * mmPerPx < 1.6) continue // too small to be a pod
    emit('embroidery-ribbed-spider-web', 12, {
      kind: 'disc',
      at: [f((minX + maxX) / 2), f((minY + maxY) / 2)],
      radiusMm: rPx * mmPerPx * 0.95,
    })
  }

  for (const s of shapes) {
    if (consumed.has(s)) continue
    const diamMm = s.diag * mmPerPx
    const lenMm = s.len * mmPerPx
    const aspect = Math.min(s.bw, s.bh) / Math.max(s.bw, s.bh || 1)
    const roundish = aspect > 0.5
    const [u, v] = uv(s.cx, s.cy)
    const at = [f(s.cx), f(s.cy)]
    if (diamMm > 3.4 && roundish && lenMm > 1.2 * diamMm) {
      // A big roundish shape (closed or broken by its stem) = a rust pod.
      emit('embroidery-ribbed-spider-web', 12, { kind: 'disc', at, radiusMm: (diamMm / 2) * 0.95 })
    } else if (diamMm < 1.8) {
      // French-knot dot — colour by region.
      const c = inBox(u, v, R.umbel) ? 1 : inBox(u, v, R.berries) ? 13 : inBox(u, v, R.asters) ? 4 : inBox(u, v, R.yellow) ? 9 : 6
      emit('embroidery-french-knot', c, { kind: 'point', at })
    } else if (roundish && diamMm <= 3.4 && lenMm > 1.0 * diamMm && (inBox(u, v, R.yellow) || inBox(u, v, R.leafy))) {
      // Small roundish loop in a petal/leaf zone = lazy daisy.
      emit('embroidery-detached-chain', inBox(u, v, R.yellow) ? 10 : 5, { kind: 'path', points: pathPts(s) })
    } else {
      // A line.
      if (inBox(u, v, R.umbel)) emit('embroidery-straight', 2, { kind: 'path', points: pathPts(s) }) // rays
      else if (inBox(u, v, R.asters)) {
        if (lenMm < 6) emit('embroidery-straight', 3, { kind: 'path', points: pathPts(s) }) // petals (mauve)
        else emit('embroidery-stem', 8, { kind: 'path', points: pathPts(s) }) // aster stems (moss)
      } else if (inBox(u, v, R.berries)) emit('embroidery-stem', 11, { kind: 'path', points: pathPts(s) }) // light-green
      else if (inBox(u, v, R.leafy)) emit('embroidery-back', 5, { kind: 'path', points: pathPts(s) }) // leafy stems
      else emit('embroidery-stem', 2, { kind: 'path', points: pathPts(s) }) // default foliage green
    }
  }

  // regionAnnotations: one per element-part (the loom's stitch+colour map).
  // Directional fills need an angle; FILL_STITCHES is where it bites.
  const FILL_STITCHES = new Set(['embroidery-satin', 'embroidery-long-and-short', 'embroidery-padded-satin'])
  const regions: { id: string; label: string }[] = []
  const regionAnnotations: {
    id: string
    stitchType: string
    colourRef: string
    colourHex: string
    thread: { type: string; weight: string } | null
    directionDeg: number | null
    notes?: string
  }[] = []
  for (const el of ELEMENTS) {
    for (const part of el.parts) {
      const id = `${el.id}__${part.part}`
      const stitchType = stitchOf(part.stitch)
      regions.push({ id, label: `${el.label} — ${part.part}` })
      regionAnnotations.push({
        id,
        stitchType,
        // Colour ONLY (DMC code); thread type/weight is separate (see `thread`).
        colourRef: `DMC ${dmcOf(part.colour)}`,
        colourHex: hexOf(part.colour),
        // null = inherit the pattern-level defaultThread. Per-region override slot
        // for patterns that mix perlé + stranded.
        thread: null,
        // Angle for directional fills; null for line/point/loop stitches.
        directionDeg: FILL_STITCHES.has(stitchType) ? 0 : null,
        notes: `guide code ${part.label}${'note' in part && part.note ? ` — ${part.note}` : ''}; ${el.count}× in design (${el.region})`,
      })
    }
  }

  const fixture = {
    _source: 'DMC "Countryside" PAT1103S — INTERNAL licensed test fixture. Do NOT ship, sell, publish, or redistribute. Used only to validate the loom render engine.',
    name: 'Countryside',
    designer: 'DMC',
    discipline: 'SURFACE_EMBROIDERY',
    patternFormat: 'SURFACE_VECTOR',
    frameType: 'HOOP',
    fabricSpec: { material: 'natural even-weave linen', colourHex: '#e3d8c2', count: null },
    threadTypes: ['DMC Perlé Cotton Art. AR115 — No.5 medium'],
    // Thread = type + weight, kept SEPARATE from colour. One thread here; regions
    // may override via regionAnnotations[].thread for mixed-thread patterns.
    defaultThread: { type: 'perle', weight: '5' },
    needle: 'No. 12',
    finishedSizeMm: { width: CANVAS_W, height: canvasH },
    license: {
      licenseType: 'ALL_RIGHTS_RESERVED',
      attributionRequired: true,
      commercialUseAllowed: false,
      redistributionAllowed: false,
      attributionText: 'Pattern © DMC. Internal fixture only.',
    },
    palette: PALETTE,
    stitchLegend: STITCH_LEGEND,
    // ── shaped like NeedleworkPattern.vectorData + regionAnnotations ──
    vectorData: { width: CANVAS_W, height: canvasH, svgContent, regions },
    regionAnnotations,
    // Render-ready: geometry bound to stitch slug + colour + thread per element.
    // This is what the loom renders. (For our own patterns the Studio emits this
    // directly; here it's bound from the traced PDF in the extractor.)
    stitchedElements,
    // ── readable element breakdown (every element, parts, stitch+colour, count) ──
    patternSpec: { elements: ELEMENTS },
    _geometryNote: `svgContent is traced from the technical chart (${shapes.length} paths). For our own patterns the Studio stores this geometry natively; here it is recovered from the licensed PDF. Per-svg-path → region binding is the render-time join.`,
  }

  const out = resolve(OUT, 'countryside.pattern.json')
  writeFileSync(out, JSON.stringify(fixture, null, 2))
  console.log(`wrote ${out}`)
  console.log(`  ${shapes.length} traced paths, ${regions.length} region-annotations, ${ELEMENTS.length} element types`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

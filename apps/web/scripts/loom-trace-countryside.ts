/**
 * Build the Countryside fixture by STITCHING ON THE DIAGRAM:
 *   - geometry traced from the technical chart (page2) — the exact pattern lines
 *   - colour read from the colour guide (page1), aligned 1:1 (same layout); in
 *     this pattern colour maps to stitch (rust→pod, white→knot, mauve→petal…),
 *     so the guide drives the stitch assignment too.
 * Writes stitchedElements into countryside.pattern.json. Render with
 * loom-render-countryside.ts.
 *
 *   cd apps/web && npx tsx scripts/loom-trace-countryside.ts
 */

import { resolve } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { inkMask, clearBorder, thin } from '../src/lib/loom/trace/skeleton'
import { trace, simplify, describe, type TracedShape } from '../src/lib/loom/trace/vectorize'

const PAT = resolve(process.cwd(), '../../.loom-scratch/pattern')
const FIX = resolve(process.cwd(), 'src/lib/loom/fixtures/countryside.pattern.json')
const DESIGN = { x0: 0.07, y0: 0.13, x1: 0.93, y1: 0.62 }
const TARGET_W = 760
const CANVAS_W = 150

// code → DMC hex (the guide's printed colours) + rgb for nearest-match.
const PALETTE: { code: number; dmc: string; hex: string }[] = [
  { code: 1, dmc: 'B5200', hex: '#fcfcfc' },
  { code: 2, dmc: '890', hex: '#243f29' },
  { code: 3, dmc: '3687', hex: '#b05a6c' },
  { code: 4, dmc: '818', hex: '#f2cdd4' },
  { code: 5, dmc: '3345', hex: '#46603a' },
  { code: 6, dmc: '211', hex: '#cdbfde' },
  { code: 7, dmc: '988', hex: '#74914f' },
  { code: 8, dmc: '581', hex: '#9ea03f' },
  { code: 9, dmc: '740', hex: '#f0891b' },
  { code: 10, dmc: '972', hex: '#fbbe26' },
  { code: 11, dmc: '3348', hex: '#bfca84' },
  { code: 12, dmc: '919', hex: '#a83c22' },
  { code: 13, dmc: '902', hex: '#6e2029' },
]
const hexOf = (c: number) => PALETTE.find((p) => p.code === c)!.hex
const dmcOf = (c: number) => PALETTE.find((p) => p.code === c)!.dmc

async function cropRaw(page: string, w: number) {
  const m = await sharp(page).metadata()
  const W = m.width!
  const H = m.height!
  const { data, info } = await sharp(page)
    .extract({ left: Math.round(DESIGN.x0 * W), top: Math.round(DESIGN.y0 * H), width: Math.round((DESIGN.x1 - DESIGN.x0) * W), height: Math.round((DESIGN.y1 - DESIGN.y0) * H) })
    .resize(w)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

async function main() {
  const chart = await cropRaw(resolve(PAT, 'page2.png'), TARGET_W)
  const mask = inkMask(chart.data, chart.w, chart.h, { lumaMax: 0.6 })
  clearBorder(mask, 2)
  const skel = thin(mask)
  const shapes = trace(skel)
    .map((p) => ({ ...p, pts: simplify(p.pts, 1.2) }))
    .map(describe)
    .filter((s) => (s.loop ? s.diag >= 2.5 : s.len >= 3))
    .filter((s) => s.bw < chart.w * 0.9 && s.bh < chart.h * 0.9)

  // Deterministic colour/stitch by DESIGN REGION (the colour key tells us which
  // element sits where; colour-sampling thin lines off the offset guide proved
  // unreliable). Regions in normalised chart coords (u right, v down).
  const cb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
  for (const s of shapes) for (const [x, y] of s.pts) {
    if (x < cb.x0) cb.x0 = x
    if (y < cb.y0) cb.y0 = y
    if (x > cb.x1) cb.x1 = x
    if (y > cb.y1) cb.y1 = y
  }
  const uv = (cx: number, cy: number): [number, number] => [(cx - cb.x0) / (cb.x1 - cb.x0), (cy - cb.y0) / (cb.y1 - cb.y0)]
  const inB = (u: number, v: number, b: number[]) => u >= b[0]! && u <= b[2]! && v >= b[1]! && v <= b[3]!
  const REG = {
    umbel: [0.40, 0.02, 0.70, 0.45],
    berries: [0.0, 0.08, 0.30, 0.62],
    pods: [0.27, 0.42, 0.51, 0.9],
    asters: [0.58, 0.16, 1.0, 0.82],
    yellow: [0.36, 0.7, 0.64, 1.0],
    leafy: [0.84, 0.16, 1.0, 0.97],
  }

  const mmPerPx = CANVAS_W / TARGET_W
  const canvasH = +(chart.h * mmPerPx).toFixed(1)
  const f = (n: number) => +(n * mmPerPx).toFixed(2)
  type El = { stitchType: string; colourHex: string; colourRef: string; thread: null; directionDeg: number | null; geometry: { kind: string; points?: number[][]; at?: number[]; radiusMm?: number } }
  const els: El[] = []
  const push = (slug: string, code: number, geom: El['geometry']) =>
    els.push({ stitchType: slug, colourHex: hexOf(code), colourRef: `DMC ${dmcOf(code)}`, thread: null, directionDeg: null, geometry: geom })
  const pathPts = (s: TracedShape) => s.pts.map((p) => [f(p[0]), f(p[1])])

  const consumed = new Set<TracedShape>()

  // 1. Rust pods: cluster the curved arcs in the pods region into whipped wheels.
  const podArcs = shapes.filter((s) => {
    const [u, v] = uv(s.cx, s.cy)
    return inB(u, v, REG.pods) && s.len > s.diag * 1.12 && s.diag * mmPerPx > 1.4
  })
  const tol = 4 / mmPerPx
  for (const seed of podArcs) {
    if (consumed.has(seed)) continue
    const cl = [seed]
    consumed.add(seed)
    for (const c of podArcs) {
      if (consumed.has(c)) continue
      if (Math.hypot(c.cx - seed.cx, c.cy - seed.cy) < tol) {
        cl.push(c)
        consumed.add(c)
      }
    }
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const c of cl) for (const [x, y] of c.pts) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
    const rPx = Math.max(maxX - minX, maxY - minY) / 2
    if (rPx * mmPerPx < 2.0) continue
    push('embroidery-ribbed-spider-web', 12, { kind: 'disc', at: [f((minX + maxX) / 2), f((minY + maxY) / 2)], radiusMm: rPx * mmPerPx * 0.95 })
  }

  // 2. Dots → French knots (de-duplicated: drop near-coincident skeleton noise),
  //    colour by region.
  const knots: { x: number; y: number; code: number }[] = []
  const dotColour = (u: number, v: number) =>
    inB(u, v, REG.umbel) ? 1 : inB(u, v, REG.berries) ? 13 : inB(u, v, REG.asters) ? 4 : inB(u, v, REG.yellow) ? 9 : 6
  for (const s of shapes) {
    if (consumed.has(s)) continue
    if (s.diag * mmPerPx >= 1.9) continue
    consumed.add(s)
    const [u, v] = uv(s.cx, s.cy)
    if (knots.some((k) => Math.hypot(k.x - s.cx, k.y - s.cy) < 1.0 / mmPerPx)) continue
    knots.push({ x: s.cx, y: s.cy, code: dotColour(u, v) })
  }
  for (const k of knots) push('embroidery-french-knot', k.code, { kind: 'point', at: [f(k.x), f(k.y)] })

  // 3. Loops → lazy daisy; lines → stitch + colour by region.
  for (const s of shapes) {
    if (consumed.has(s)) continue
    const diamMm = s.diag * mmPerPx
    const lenMm = s.len * mmPerPx
    const [u, v] = uv(s.cx, s.cy)
    if (s.loop && diamMm < 4.8) {
      // Umbel "florets" are small outline circles → white French knots, NOT
      // green daisies. Yellow-flower petals are lazy daisies; leaf loops green.
      if (inB(u, v, REG.umbel)) push('embroidery-french-knot', 1, { kind: 'point', at: [f(s.cx), f(s.cy)] })
      else push('embroidery-detached-chain', inB(u, v, REG.yellow) ? 10 : 5, { kind: 'path', points: pathPts(s) })
      continue
    }
    if (inB(u, v, REG.umbel)) push('embroidery-straight', 2, { kind: 'path', points: pathPts(s) }) // rays
    else if (inB(u, v, REG.asters)) push(lenMm < 7 ? 'embroidery-straight' : 'embroidery-stem', lenMm < 7 ? 3 : 8, { kind: 'path', points: pathPts(s) })
    else if (inB(u, v, REG.berries)) push('embroidery-stem', 11, { kind: 'path', points: pathPts(s) })
    else if (inB(u, v, REG.leafy)) push('embroidery-back', 5, { kind: 'path', points: pathPts(s) })
    else if (inB(u, v, REG.yellow)) push('embroidery-stem', 2, { kind: 'path', points: pathPts(s) })
    else push('embroidery-stem', 2, { kind: 'path', points: pathPts(s) }) // foliage default
  }

  // 4. Pods: detect the rust outline-circles DIRECTLY FROM THE DIAGRAM (they
  // skeletonise into fragments, but as circles in the ink mask they're clear).
  // Hough-style vote over the pods region — real positions/radii, not placed.
  const pr = [REG.pods[0]!, REG.pods[1]!, REG.pods[2]!, REG.pods[3]!] as const
  const px0 = Math.round(cb.x0 + pr[0] * (cb.x1 - cb.x0))
  const px1 = Math.round(cb.x0 + pr[2] * (cb.x1 - cb.x0))
  const py0 = Math.round(cb.y0 + pr[1] * (cb.y1 - cb.y0))
  const py1 = Math.round(cb.y0 + pr[3] * (cb.y1 - cb.y0))
  const ink = (x: number, y: number) => x >= 0 && y >= 0 && x < chart.w && y < chart.h && mask.data[y * chart.w + x] === 1
  const radii = [8, 10, 12, 14, 16, 18, 20, 22, 24]
  const cands: { cx: number; cy: number; r: number; score: number }[] = []
  for (let cy = py0; cy <= py1; cy += 2) {
    for (let cx = px0; cx <= px1; cx += 2) {
      for (const r of radii) {
        const n = Math.max(24, Math.round(2 * Math.PI * r))
        let hit = 0
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2
          // tolerate the line being 1px off the ideal circle
          if (ink(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r)) ||
              ink(Math.round(cx + Math.cos(a) * (r - 1)), Math.round(cy + Math.sin(a) * (r - 1))) ||
              ink(Math.round(cx + Math.cos(a) * (r + 1)), Math.round(cy + Math.sin(a) * (r + 1)))) hit++
        }
        const score = hit / n
        if (score > 0.62) cands.push({ cx, cy, r, score })
      }
    }
  }
  cands.sort((a, b) => b.score - a.score)
  const pods: typeof cands = []
  for (const c of cands) {
    if (pods.some((p) => Math.hypot(p.cx - c.cx, p.cy - c.cy) < (p.r + c.r) * 0.8)) continue
    pods.push(c)
    if (pods.length >= 6) break
  }
  for (const p of pods) push('embroidery-ribbed-spider-web', 12, { kind: 'disc', at: [f(p.cx), f(p.cy)], radiusMm: p.r * mmPerPx })
  console.log(`detected ${pods.length} pods from the diagram`)

  // Merge into the fixture (keep metadata/palette/legend; replace render data).
  const fixture = JSON.parse(readFileSync(FIX, 'utf8'))
  fixture._source = 'DMC "Countryside" PAT1103S — INTERNAL licensed fixture. Geometry traced from the technical chart; colour/stitch from the colour guide. Do NOT ship/sell/redistribute.'
  fixture.vectorData = { width: CANVAS_W, height: canvasH, regions: [] }
  fixture.finishedSizeMm = { width: CANVAS_W, height: canvasH }
  fixture.stitchedElements = els
  writeFileSync(FIX, JSON.stringify(fixture, null, 2))
  const by: Record<string, number> = {}
  for (const e of els) by[e.stitchType] = (by[e.stitchType] ?? 0) + 1
  console.log(`wrote ${els.length} stitched elements (traced diagram + guide colour)`)
  console.log(JSON.stringify(by))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

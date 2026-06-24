/**
 * Render a pattern from its EXACT vector artwork (extracted from the PDF by
 * loom_extract_vectors.py). Each vector path becomes a thread stroke following
 * its exact shape, in its exact colour (snapped to the DMC palette). Filled dots
 * become French knots. No tracing of a picture, no classifying, no reshaping —
 * the geometry and colour come straight from the designer's file.
 *
 *   cd apps/web && npx tsx scripts/loom-render-vectors.ts
 */

import { resolve } from 'node:path'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'
import type { Vec2 } from '../src/lib/loom/core/vec'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { material, threadStructure, strandRadiusMm, filamentPolylines, type ThreadStroke } from '../src/lib/loom/render/thread'
import { frenchKnot, wovenWheel } from '../src/lib/loom/stitches/detached'
import { satinFillPolygon } from '../src/lib/loom/stitches/satin'

// args: [pathsJsonName] [sceneBasename] [enrich] [greenMute]
// Colour intensity is per-pattern: soft patterns (Countryside) want a gentle
// enrich; vibrant ones (Provence) want a strong one. A single global grade can't
// serve both.
const PATHS_NAME = process.argv[2] ?? 'countryside-paths.json'
const SCENE_NAME = process.argv[3] ?? 'countryside'
const ENRICH = Number(process.argv[4] ?? 1.25)
const GMUTE = Number(process.argv[5] ?? 0.7)
const DEEPEN = Number(process.argv[6] ?? 1.0) // <1 darkens toward vibrant floss
const VEC = resolve(process.cwd(), '../../.loom-scratch/vec/', PATHS_NAME)
const OUT = resolve(process.cwd(), '../../.loom-scratch/blender')
mkdirSync(OUT, { recursive: true })

const CANVAS_W = 150 // mm

// DMC palette (code → hex → rgb 0..1) for snapping each path's colour.
const PALETTE = [
  { code: 1, hex: '#fcfcfc' }, { code: 2, hex: '#243f29' }, { code: 3, hex: '#b05a6c' },
  { code: 4, hex: '#f2cdd4' }, { code: 5, hex: '#46603a' }, { code: 6, hex: '#cdbfde' },
  { code: 7, hex: '#74914f' }, { code: 8, hex: '#9ea03f' }, { code: 9, hex: '#f0891b' },
  { code: 10, hex: '#fbbe26' }, { code: 11, hex: '#bfca84' }, { code: 12, hex: '#a83c22' },
  { code: 13, hex: '#6e2029' },
].map((p) => ({ ...p, r: parseInt(p.hex.slice(1, 3), 16) / 255, g: parseInt(p.hex.slice(3, 5), 16) / 255, b: parseInt(p.hex.slice(5, 7), 16) / 255 }))

function snap(r: number, g: number, b: number): string {
  let best = PALETTE[0]!
  let bd = Infinity
  for (const p of PALETTE) {
    const d = (p.r - r) ** 2 + (p.g - g) ** 2 + (p.b - b) ** 2
    if (d < bd) { bd = d; best = p }
  }
  return best.hex
}

interface RawPath { rgb: [number, number, number]; filled: boolean; pts: [number, number][] }

function main() {
  const data = JSON.parse(readFileSync(VEC, 'utf8')) as { wpt: number; hpt: number; paths: RawPath[] }

  // Keep the design paths; drop ONLY the DARK blue label text/leader lines —
  // NOT the lighter blue/purple/lavender FLOWERS (those are real stitches!).
  // Labels are a dark, strongly blue-dominant ink (low r,g); flowers are lighter.
  const kept = data.paths.filter((p) => {
    const [r, g, b] = p.rgb
    const labelBlue = b > r + 0.22 && b > g + 0.2 && r < 0.38 && g < 0.4
    return !labelBlue
  })

  // Prelim bbox, then drop any near-full-span thin line (registration strays).
  const pbb = (ps: RawPath[]) => {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity
    for (const p of ps) for (const [x, y] of p.pts) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y }
    return { a, b, c, d }
  }
  const pre = pbb(kept)
  const bw0 = pre.c - pre.a, bh0 = pre.d - pre.b
  const kept2 = kept.filter((p) => {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity
    for (const [x, y] of p.pts) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y }
    const pw = c - a, ph = d - b
    const aspect = Math.min(pw, ph) / Math.max(pw, ph, 1e-6)
    // Only drop near-full-span ULTRA-thin lines (frame/registration edges).
    // (Was 0.55/0.16 — too aggressive, it deleted real tall thin STEMS.)
    return !((pw > bw0 * 0.9 || ph > bh0 * 0.9) && aspect < 0.06)
  })
  const { a: x0, b: y0, c: x1, d: y1 } = pbb(kept2)
  kept.length = 0
  kept.push(...kept2)
  const scale = CANVAS_W / (x1 - x0)
  const H = +((y1 - y0) * scale).toFixed(1)
  const toMm = ([x, y]: [number, number]): Vec2 => ({ x: (x - x0) * scale, y: (y - y0) * scale })

  const strokes: ThreadStroke[] = []
  // (b) record the stitch + colour + geometry per element (the needlework format
  // the Studio also produces). stitchType uses the controlled dictionary slugs.
  const els: { stitchType: string; colourHex: string; thread: { type: string; weight: string }; directionDeg: number | null; geometry: { kind: string; points?: number[][]; at?: number[]; radiusMm?: number } }[] = []
  const THREAD = { type: 'perle', weight: '5' }
  let seed = 1
  const kind = 'perle-cotton' as const
  const struct = threadStructure(kind, 3)
  const rad = strandRadiusMm(4) * 1.3 // perlé #5, fuller so stitches read
  void snap
  const hx = (c: number) => Math.max(0, Math.min(255, Math.round(c * 255))).toString(16).padStart(2, '0')
  // Near-black = a WHITE floss element (drawn as outline). Else gently enrich the
  // pale print colour toward floss richness, PRESERVING hue (the ×1.7 boost went
  // neon).
  // The PDF colour guide prints PALE tints, not the real floss colours. Patterns
  // should be the floss's true vivid colours (the website's soft branding does
  // NOT apply here). So saturate hard (separates the hues) + cap brightness so
  // pale tints become rich, readable floss colours. ENRICH = saturation factor;
  // CAP = max brightness (lower = deeper).
  void GMUTE
  void DEEPEN
  const rawHex = (rgb: [number, number, number]) => {
    const mx = Math.max(...rgb)
    if (mx < 0.25) return '#f7f5f0' // white floss (dark-outline elements)
    const lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
    let rich = rgb.map((c) => lum + (c - lum) * ENRICH)
    const m = Math.max(rich[0]!, rich[1]!, rich[2]!)
    const CAP = 0.72
    if (m > CAP) rich = rich.map((c) => c * (CAP / m)) // deepen pale tints to rich floss
    rich = rich.map((c) => Math.max(0, Math.min(1, c)))
    return `#${hx(rich[0]!)}${hx(rich[1]!)}${hx(rich[2]!)}`
  }
  for (const p of kept) {
    // Use the designer's OWN colour from the PDF (most faithful; snapping to an
    // approximate palette mis-mapped the muted rust to mauve).
    const hex = rawHex(p.rgb)
    const path = p.pts.map(toMm)
    // bbox in mm
    let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity
    for (const q of path) { mnx = Math.min(mnx, q.x); mny = Math.min(mny, q.y); mxx = Math.max(mxx, q.x); mxy = Math.max(mxy, q.y) }
    const w = mxx - mnx, h = mxy - mny
    const diag = Math.hypot(w, h)
    const cx = (mnx + mxx) / 2, cy = (mny + mxy) / 2
    const closed = Math.hypot(path[0]!.x - path[path.length - 1]!.x, path[0]!.y - path[path.length - 1]!.y) < Math.max(1, diag * 0.25)
    const roundish = Math.min(w, h) / Math.max(w, h, 0.01) > 0.6
    const isBlack = Math.max(...p.rgb) < 0.25
    if (isBlack && !(diag < 2.6 && closed)) continue // black leader/outline line (not a white floret)
    if (diag < 2.6 && (p.filled || closed)) {
      // a drawn dot / tiny circle → French knot (incl. the white florets)
      strokes.push(...frenchKnot({ x: cx, y: cy }, { kind, hex, strands: 3, seed: seed++ }, { wraps: 1 }))
      els.push({ stitchType: 'embroidery-french-knot', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'point', at: [cx, cy] } })
      continue
    }
    const [pr, pg, pb] = p.rgb
    const rustish = pr > 0.5 && pg > 0.28 && pg < 0.5 && pb < 0.4 && pr > pg && pg > pb
    if (rustish && closed && roundish && diag > 3.5) {
      // a rust outline circle = a whipped-wheel pod → render it filled, smaller +
      // a deeper poppy-red (closer to the designer's than the muted print rust).
      strokes.push(...wovenWheel({ x: cx, y: cy }, (diag / 2) * 0.78, { kind, hex: '#a8392a', strands: 3, seed: seed++ }, { spokes: 9 }))
      els.push({ stitchType: 'embroidery-ribbed-spider-web', colourHex: '#a8392a', thread: THREAD, directionDeg: null, geometry: { kind: 'disc', at: [cx, cy], radiusMm: (diag / 2) * 0.78 } })
      continue
    }
    // A solid filled shape (flower / leaf) → satin FILL, not a thin outline.
    // This is the de-blob: solid worked colour areas instead of pale rings.
    if (p.filled && diag >= 2.6 && path.length >= 4) {
      const angle = (Math.round(cx * 7 + cy * 13) % 180 + 180) % 180
      const fill = satinFillPolygon(path, { kind, hex, strands: 3, seed: seed++ }, { angleDeg: angle })
      if (fill.length) {
        strokes.push(...fill)
        els.push({ stitchType: 'embroidery-satin', colourHex: hex, thread: THREAD, directionDeg: angle, geometry: { kind: 'path', points: path.map((q) => [+q.x.toFixed(2), +q.y.toFixed(2)]) } })
        continue
      }
    }
    if (path.length < 2) continue
    // thread following the EXACT path, in its exact colour. Short marks (flower
    // petals + umbel rays) render fuller so they read as solid petals, not thin
    // scribbles; long marks (stems) stay fine.
    let lenMm = 0
    for (let i = 1; i < path.length; i++) lenMm += Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y)
    const r = lenMm < 8 ? rad * 1.45 : rad
    strokes.push({
      path,
      z0: r * 0.6,
      arch: Math.min(0.4, diag * 0.02),
      radiusMm: r,
      filaments: struct.filaments,
      twistPerMm: struct.twistPerMm,
      material: material(kind, hex),
      seed: seed++,
    })
    // short marks = straight (petals/rays); long = stem (the laid line).
    els.push({ stitchType: lenMm < 8 ? 'embroidery-straight' : 'embroidery-stem', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: path.map((q) => [+q.x.toFixed(2), +q.y.toFixed(2)]) } })
  }
  console.log(`${kept.length} kept paths -> ${strokes.length} strokes; ${CANVAS_W}x${H}mm`)

  // CPU preview
  const img = renderEmbroidery({
    widthMm: CANVAS_W, heightMm: H, pxPerMm: 7, ss: 2,
    fabric: { hex: '#f6f3ec', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 },
    strokes,
  })
  sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png()
    .toFile(resolve(OUT, SCENE_NAME + '-vec-preview.png')).then(() => console.log('preview written'))

  // Blender scene
  const out = {
    fabric: { widthMm: CANVAS_W, heightMm: H, hex: '#f6f3ec' },
    strokes: strokes.map((st) => {
      const fp = filamentPolylines(st)
      const hx = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
      return {
        hex: `#${hx(st.material.colour.r)}${hx(st.material.colour.g)}${hx(st.material.colour.b)}`,
        sheen: st.material.sheen, radiusMm: fp.radiusMm,
        filaments: fp.filaments.map((poly) => poly.map((q) => [q.x, q.y, q.z])),
      }
    }),
  }
  writeFileSync(resolve(OUT, SCENE_NAME + '.json'), JSON.stringify(out))
  console.log('scene written')

  // (3) Needlework-format fixture — the structured data the loom renders from
  // (same shape the Studio produces). vectorData carries the design geometry as
  // SVG; stitchedElements carries stitch + colour + thread + geometry per part.
  const svgPaths = kept.map((p) => 'M' + p.pts.map(toMm).map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' L')).map((d) => `<path d="${d}"/>`).join('')
  const fixture = {
    _source: `INTERNAL licensed fixture (${SCENE_NAME}) — do not ship/sell. Geometry + colour extracted from the designer's PDF vectors.`,
    name: SCENE_NAME,
    discipline: 'SURFACE_EMBROIDERY',
    patternFormat: 'SURFACE_VECTOR',
    defaultThread: THREAD,
    finishedSizeMm: { width: CANVAS_W, height: H },
    vectorData: { width: CANVAS_W, height: H, svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${H}" fill="none" stroke="#333" stroke-width="0.3">${svgPaths}</svg>`, regions: [] },
    stitchedElements: els,
  }
  writeFileSync(resolve(OUT, SCENE_NAME + '.pattern.json'), JSON.stringify(fixture))
  console.log(`pattern fixture written: ${els.length} stitched elements`)
}

main()

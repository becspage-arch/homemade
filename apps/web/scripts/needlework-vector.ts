/**
 * VECTOR-FIRST needlework — rich + SHADED (thread-painting).
 *
 * Designs are authored as clean vector shapes (perfect by construction: full
 * coverage, no gaps), then each shape is split into graded SHADE BANDS across a
 * real DMC ramp and worked in long-and-short — so a petal fades dark-base to
 * light-tip across many thread shades, the way needle-painting actually reads.
 * The line-art template is the same shapes. The loom renders it photoreal.
 *
 *   npx tsx scripts/needlework-vector.ts            # CPU preview + line art
 *   npx tsx scripts/needlework-vector.ts --hero     #   ...also the loom hero
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

import { nearestFloss } from '../src/lib/floss/nearest-floss'
import { patternToStrokes, type StitchedElement } from '../src/lib/loom/render/renderPattern'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { patternToLineArtSvg } from '../src/lib/needlework/engine'
import { renderHero } from './loom-render-hero'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../../.needlework-scratch/vector')
mkdirSync(OUT, { recursive: true })
const THREAD = { type: 'stranded-cotton', weight: '6-strand' }

type Pt = [number, number]
type RGB = [number, number, number]

function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ])
  }
  return out
}

function rt(pts: Pt[], cx: number, cy: number, ang: number): Pt[] {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  return pts.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c])
}

/** Teardrop petal pointing "up" in local space, rotated to angleDeg about (cx,cy). */
function petalPoly(cx: number, cy: number, angleDeg: number, len: number, wid: number): Pt[] {
  const a = (angleDeg * Math.PI) / 180
  return rt(
    [
      ...bezier([0, 0], [-wid, -len * 0.3], [-wid * 0.6, -len * 0.85], [0, -len], 16),
      ...bezier([0, -len], [wid * 0.6, -len * 0.85], [wid, -len * 0.3], [0, 0], 16),
    ],
    cx,
    cy,
    a,
  )
}

function leafPoly(cx: number, cy: number, angleDeg: number, len: number, wid: number): Pt[] {
  const a = (angleDeg * Math.PI) / 180
  return rt(
    [
      ...bezier([0, 0], [-wid, -len * 0.35], [-wid * 0.5, -len * 0.82], [0, -len], 14),
      ...bezier([0, -len], [wid * 0.5, -len * 0.82], [wid, -len * 0.35], [0, 0], 14),
    ],
    cx,
    cy,
    a,
  )
}

/** Tip point of a shape pointing "up" then rotated — defines the shade axis. */
function tip(cx: number, cy: number, angleDeg: number, len: number): Pt {
  const a = (angleDeg * Math.PI) / 180
  return [cx + len * Math.sin(a), cy - len * Math.cos(a)]
}

/** Sutherland–Hodgman clip of a polygon to the half-plane (p−P)·N ≥ 0. */
function clipHP(poly: Pt[], px: number, py: number, nx: number, ny: number): Pt[] {
  const out: Pt[] = []
  const side = (p: Pt) => (p[0] - px) * nx + (p[1] - py) * ny
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i]!
    const nxt = poly[(i + 1) % poly.length]!
    const sc = side(cur)
    const sn = side(nxt)
    if (sc >= 0) out.push(cur)
    if (sc >= 0 !== sn >= 0) {
      const t = sc / (sc - sn)
      out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])])
    }
  }
  return out
}

function toHex(rgb: RGB): string {
  return `#${rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`
}
function dmc(hex: string): string {
  return nearestFloss(hex, { brand: 'DMC' }).entry.rgb
}

/** A ramp of `n` real DMC shades from dark to light. */
function ramp(dark: RGB, light: RGB, n: number): string[] {
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    out.push(dmc(toHex([dark[0] + (light[0] - dark[0]) * t, dark[1] + (light[1] - dark[1]) * t, dark[2] + (light[2] - dark[2]) * t])))
  }
  return out
}

/**
 * Shade a shape: split it into bands along the base→tip axis and work each band
 * in long-and-short in the next ramp shade (dark at the base, light at the tip).
 */
function shaded(poly: Pt[], base: Pt, tipPt: Pt, shades: string[]): StitchedElement[] {
  const ux = tipPt[0] - base[0]
  const uy = tipPt[1] - base[1]
  const ul = Math.hypot(ux, uy) || 1
  const nx = ux / ul
  const ny = uy / ul
  const axisDeg = (Math.atan2(ny, nx) * 180) / Math.PI
  let lo = Infinity
  let hi = -Infinity
  for (const p of poly) {
    const proj = p[0] * nx + p[1] * ny
    if (proj < lo) lo = proj
    if (proj > hi) hi = proj
  }
  const n = shades.length
  const els: StitchedElement[] = []
  for (let i = 0; i < n; i++) {
    const a = lo + ((hi - lo) * i) / n
    const b = lo + ((hi - lo) * (i + 1)) / n
    let band = clipHP(poly, nx * a, ny * a, nx, ny)
    if (band.length >= 3) band = clipHP(band, nx * b, ny * b, -nx, -ny)
    if (band.length < 3) continue
    els.push({
      stitchType: 'embroidery-long-and-short',
      colourHex: shades[i]!,
      thread: THREAD,
      directionDeg: axisDeg, // stitches run along the fade (radial), like real needle-painting
      geometry: { kind: 'path', points: band },
    })
  }
  return els
}

function line(points: Pt[], hex: string, slug = 'stem'): StitchedElement {
  return { stitchType: `embroidery-${slug}`, colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points } }
}

/** A layered, shaded garden rose + leaves + stem — a thread-painting piece. */
function buildRose(): { els: StitchedElement[]; W: number; H: number } {
  const W = 150
  const H = 170
  const cx = 75
  const cy = 62
  const els: StitchedElement[] = []

  // Leaves first (sit under the bloom). Shaded dark->light green, with a vein.
  const leafRamp = ([d, l]: [RGB, RGB]) => ramp(d, l, 5)
  const lg: [RGB, RGB] = [[42, 66, 33], [150, 188, 116]]
  const leaves: Array<[number, number, number, number, number]> = [
    [cx - 6, cy + 78, -120, 34, 11],
    [cx + 8, cy + 96, 122, 32, 10],
    [cx - 2, cy + 110, -100, 26, 9],
  ]
  for (const [lx, ly, ang, len, wid] of leaves) {
    const poly = leafPoly(lx, ly, ang, len, wid)
    els.push(...shaded(poly, [lx, ly], tip(lx, ly, ang, len), leafRamp(lg)))
    els.push(line([[lx, ly], tip(lx, ly, ang, len)], dmc('#33502a'))) // vein
  }

  // Stem.
  els.push(line(bezier([cx, cy + 18], [cx + 5, cy + 55], [cx - 5, cy + 95], [cx, cy + 128], 24), dmc('#3c5a30')))

  // Rose: concentric rings of overlapping petals, each shaded dark base -> light tip.
  const rings: Array<{ count: number; len: number; wid: number; off: number; ramp: [RGB, RGB] }> = [
    { count: 8, len: 36, wid: 18, off: 0, ramp: [[120, 30, 46], [240, 176, 192]] },
    { count: 8, len: 27, wid: 15, off: 22, ramp: [[104, 24, 40], [226, 150, 170]] },
    { count: 6, len: 19, wid: 12, off: 12, ramp: [[88, 20, 34], [206, 120, 144]] },
    { count: 5, len: 12, wid: 9, off: 30, ramp: [[70, 16, 28], [180, 96, 120]] },
  ]
  for (const r of rings) {
    const shades = ramp(r.ramp[0], r.ramp[1], 5)
    for (let i = 0; i < r.count; i++) {
      const a = (i * 360) / r.count + r.off
      const poly = petalPoly(cx, cy, a, r.len, r.wid)
      els.push(...shaded(poly, [cx, cy], tip(cx, cy, a, r.len), shades))
    }
  }
  // Centre furl knot cluster (deepest shadow) + a couple of highlight knots.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    els.push({ stitchType: 'embroidery-french-knot', colourHex: dmc('#5a1422'), thread: THREAD, directionDeg: null, geometry: { kind: 'point', at: [cx + Math.cos(a) * 3, cy + Math.sin(a) * 3] } })
  }

  return { els, W, H }
}

async function main(): Promise<void> {
  const { els, W, H } = buildRose()
  console.log(`${els.length} elements authored`)

  const strokes = patternToStrokes(els, { strands: 6, defaultThread: THREAD })
  const img = renderEmbroidery({
    widthMm: W,
    heightMm: H,
    pxPerMm: 6,
    ss: 2,
    fabric: { hex: '#efe7d6', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 },
    strokes,
  })
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(resolve(OUT, 'rose-shaded-preview.png'))
  console.log('wrote rose-shaded-preview.png', strokes.length, 'stitches')

  const svg = patternToLineArtSvg(els, { width: W, height: H })
  writeFileSync(resolve(OUT, 'rose-shaded-lineart.svg'), svg)
  await sharp(Buffer.from(svg)).png().toFile(resolve(OUT, 'rose-shaded-lineart.png'))

  if (process.argv.includes('--hero')) {
    console.log('rendering loom hero (Blender + Fal)…')
    const hero = await renderHero(
      { name: 'rose-shaded-vector', stitchedElements: els, finishedSizeMm: { width: W, height: H }, fabricHex: '#efe7d6', defaultThread: THREAD, strands: 6, frame: { shape: 'round' } },
      { persist: false, outDir: resolve(OUT, 'heroes') },
    )
    console.log(`hero: ${hero.localHeroPath} (${hero.pathTaken.kind}, gate ${hero.gate.pass ? 'PASS' : 'FAIL'})`)
  }
}

main().catch((e) => {
  console.error('vector FAILED:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})

/**
 * OPTION A — AI as the digitiser. I (the AI) look at the photo and author the
 * structured plan: shapes placed to trace the subject, a stitch chosen per
 * shape by judgment, and the COLOUR of every shape SAMPLED FROM THE PHOTO
 * (real reds, real light + shadow) — not guessed. Clean AI-authored geometry +
 * the photo's own colour. Then the loom + document render it. Fully automated.
 *
 *   npx tsx scripts/needlework-photo-ai.ts [--hero]
 * Reads the cached photo at .needlework-scratch/photo/upload.png.
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import sharp from 'sharp'

import { nearestFloss } from '../src/lib/floss/nearest-floss'
import { patternToStrokes } from '../src/lib/loom/render/renderPattern'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { buildPatternDocument, expandShading, type ShadedElement } from '../src/lib/needlework/engine'
import { renderHero } from './loom-render-hero'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../../.needlework-scratch/photo-ai')
mkdirSync(OUT, { recursive: true })
const THREAD = { type: 'stranded-cotton', weight: '6-strand' }
const W = 150
const H = 150

type Pt = [number, number]
const dmc = (hex: string) => nearestFloss(hex, { brand: 'DMC' }).entry.rgb

// The photo, decoded for colour sampling (mm -> photo px).
let PHOTO: { rgba: Uint8Array; w: number; h: number }
function sampleHex(mx: number, my: number): string {
  const px = Math.max(0, Math.min(PHOTO.w - 1, Math.round((mx / W) * PHOTO.w)))
  const py = Math.max(0, Math.min(PHOTO.h - 1, Math.round((my / H) * PHOTO.h)))
  // median of a small neighbourhood
  const rs: number[] = []
  const gs: number[] = []
  const bs: number[] = []
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++) {
      const x = Math.max(0, Math.min(PHOTO.w - 1, px + dx))
      const y = Math.max(0, Math.min(PHOTO.h - 1, py + dy))
      const o = (y * PHOTO.w + x) * 4
      rs.push(PHOTO.rgba[o]!)
      gs.push(PHOTO.rgba[o + 1]!)
      bs.push(PHOTO.rgba[o + 2]!)
    }
  const med = (a: number[]) => {
    a.sort((x, y) => x - y)
    return a[a.length >> 1]!
  }
  const r = med(rs)
  const g = med(gs)
  const b = med(bs)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const o: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]])
  }
  return o
}
function rot(pts: Pt[], cx: number, cy: number, deg: number): Pt[] {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return pts.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c])
}
function tipOf(cx: number, cy: number, deg: number, len: number): Pt {
  const a = (deg * Math.PI) / 180
  return [cx + len * Math.sin(a), cy - len * Math.cos(a)]
}
function rosePetal(cx: number, cy: number, deg: number, len: number, wid: number): Pt[] {
  return rot([...bez([0, 0], [-wid * 0.9, -len * 0.35], [-wid, -len * 0.8], [-wid * 0.35, -len], 9), ...bez([-wid * 0.35, -len], [-wid * 0.1, -len * 1.08], [wid * 0.1, -len * 1.08], [wid * 0.35, -len], 5), ...bez([wid * 0.35, -len], [wid, -len * 0.8], [wid * 0.9, -len * 0.35], [0, 0], 9)], cx, cy, deg)
}
function leafPoly(cx: number, cy: number, deg: number, len: number, wid: number): Pt[] {
  return rot([...bez([0, 0], [-wid, -len * 0.4], [-wid * 0.5, -len * 0.85], [0, -len], 10), ...bez([0, -len], [wid * 0.5, -len * 0.85], [wid, -len * 0.4], [0, 0], 10)], cx, cy, deg)
}

const els: ShadedElement[] = []

/** Is a sampled colour the photo's pale background (not the subject)? */
function isBg(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const sat = Math.max(r, g, b) - Math.min(r, g, b)
  return luma > 188 && sat < 34
}

/**
 * Shade a shape from the photo, base->tip, into a 5-step DMC ramp. Any sample
 * that lands on the photo's pale background (where my authored shape overhangs
 * the subject) is rejected and replaced with `baseHex` — so a green stem can
 * never come out white, and petals never get background patches.
 */
function shadeFromPhoto(poly: Pt[], cx: number, cy: number, deg: number, len: number, baseHex: string, slug = 'long-and-short'): void {
  const tp = tipOf(cx, cy, deg, len)
  const axis = (Math.atan2(tp[1] - cy, tp[0] - cx) * 180) / Math.PI
  const steps = 5
  const ramp: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const sx = cx + (tp[0] - cx) * (0.12 + 0.78 * t)
    const sy = cy + (tp[1] - cy) * (0.12 + 0.78 * t)
    const hex = sampleHex(sx, sy)
    ramp.push(isBg(hex) ? baseHex : dmc(hex))
  }
  els.push({ stitchType: `embroidery-${slug}`, colourHex: ramp[2]!, thread: THREAD, directionDeg: axis, geometry: { kind: 'path', points: poly }, shade: { ramp, axisDeg: axis } })
}

/**
 * My digitiser reading of THIS photo (a single deep-red rose, bloom upper-centre
 * ~ (63,48)mm, leaves lower-left/right ~ y100-118, stem down the centre):
 * a swirled centre, ~4 layers of overlapping petals opening outward, two leaves,
 * a stem — colour sampled from the photo so the lit petals read bright and the
 * centre/shadows read deep, automatically.
 */
function digitiseRose(): void {
  const cx = 63
  const cy = 48
  // I know (from looking) the foliage is green and the rose is red — use those
  // as the fallbacks; the photo only supplies the SHADE variation.
  const green = dmc('#4f7a3c')
  const greenDk = dmc('#34521f')
  const red = dmc('#b3141f')
  // stem + leaves first (behind) — explicit green, never sampled to white
  els.push({ stitchType: 'embroidery-stem', colourHex: greenDk, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: bez([cx, cy + 22], [cx + 2, 75], [cx - 2, 100], [cx + 2, 132], 18) } })
  shadeFromPhoto(leafPoly(cx - 12, 100, -118, 26, 10), cx - 12, 100, -118, 26, green)
  shadeFromPhoto(leafPoly(cx + 14, 110, 125, 24, 9), cx + 14, 110, 125, 24, green)
  // rose: layers of petals opening outward (more, irregular, overlapping)
  const rings = [
    { count: 9, len: 24, wid: 14, off: 0 },
    { count: 8, len: 18, wid: 12, off: 22 },
    { count: 7, len: 13, wid: 10, off: 12 },
    { count: 5, len: 8, wid: 7, off: 30 },
  ]
  for (const r of rings) for (let i = 0; i < r.count; i++) {
    const deg = (i * 360) / r.count + r.off
    shadeFromPhoto(rosePetal(cx, cy, deg, r.len, r.wid), cx, cy, deg, r.len, red)
  }
  // dark centre knots
  for (let i = 0; i < 5; i++) els.push({ stitchType: 'embroidery-french-knot', colourHex: dmc('#5a0e14'), thread: THREAD, directionDeg: null, geometry: { kind: 'point', at: [cx + Math.cos(i) * 2, cy + Math.sin(i) * 2] } })
}

async function main(): Promise<void> {
  const buf = readFileSync(resolve(__dirname, '../../../.needlework-scratch/photo/upload.png'))
  const d = await sharp(buf).resize({ width: 512 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  PHOTO = { rgba: new Uint8Array(d.data), w: d.info.width, h: d.info.height }

  digitiseRose()
  console.log(`${els.length} plan elements (AI-digitised, colour sampled from photo)`)
  writeFileSync(resolve(OUT, 'elements.json'), JSON.stringify({ finishedSizeMm: { width: W, height: H }, stitchedElements: els }, null, 2))

  const doc = buildPatternDocument(els, { width: W, height: H }, { title: 'Rose (from photo)' })
  await sharp(Buffer.from(doc.colourGuideSvg)).resize({ width: 700 }).png().toFile(resolve(OUT, 'doc-1-colour-guide.png'))
  console.log(`document: ${doc.flossKey.length} floss, ${doc.stitchKey.length} stitches`)

  const rendered = expandShading(els)
  const strokes = patternToStrokes(rendered, { strands: 6, defaultThread: THREAD })
  const img = renderEmbroidery({ widthMm: W, heightMm: H, pxPerMm: 5, ss: 2, fabric: { hex: '#efe7d6', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 }, strokes })
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(resolve(OUT, 'plan-preview.png'))
  console.log(`plan-preview.png (${strokes.length} stitches)`)

  if (process.argv.includes('--hero')) {
    console.log('rendering loom hero…')
    const hero = await renderHero({ name: 'photo-ai-rose', stitchedElements: rendered, finishedSizeMm: { width: W, height: H }, fabricHex: '#efe7d6', defaultThread: THREAD, strands: 6, frame: { shape: 'round' } }, { persist: false, outDir: resolve(OUT, 'heroes') })
    console.log(`hero: ${hero.localHeroPath} (gate ${hero.gate.pass ? 'PASS' : 'FAIL'})`)
  }
}

main().catch((e) => { console.error('photo-ai FAILED:', e instanceof Error ? e.message : String(e)); process.exit(1) })

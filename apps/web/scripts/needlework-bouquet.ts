/**
 * A HARDER original pattern — a dense cottage-garden bouquet (our composition;
 * design-direction modern-botanicals × cottagecore-botanical × wildflower-meadow
 * palette). Overlapping layered shaded roses, daisies, filler flowers, foliage,
 * berries and baby's breath, bound at the stem — the seasoned-stitcher density
 * bar. Same pipeline as the meadow: ONE structured dataset (geometry + stitch
 * slug + DMC floss, shaded shapes carry a ramp) drives the document AND the loom
 * hero via renderHero(expandShading(dataset)).
 *
 *   npx tsx scripts/needlework-bouquet.ts            # plan + document + CPU check
 *   npx tsx scripts/needlework-bouquet.ts --hero     #   ...+ loom renderHero
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

import { nearestFloss } from '../src/lib/floss/nearest-floss'
import { patternToStrokes } from '../src/lib/loom/render/renderPattern'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { buildPatternDocument, expandShading, type ShadedElement } from '../src/lib/needlework/engine'
import { renderHero } from './loom-render-hero'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../../.needlework-scratch/bouquet')
mkdirSync(OUT, { recursive: true })
const THREAD = { type: 'stranded-cotton', weight: '6-strand' }
const W = 175
const H = 195

type Pt = [number, number]
type RGB = [number, number, number]
const dmc = (hex: string) => nearestFloss(hex, { brand: 'DMC' }).entry.rgb

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
function petalPoly(cx: number, cy: number, deg: number, len: number, wid: number): Pt[] {
  return rot([...bez([0, 0], [-wid, -len * 0.3], [-wid * 0.6, -len * 0.85], [0, -len], 12), ...bez([0, -len], [wid * 0.6, -len * 0.85], [wid, -len * 0.3], [0, 0], 12)], cx, cy, deg)
}
function tipOf(cx: number, cy: number, deg: number, len: number): Pt {
  const a = (deg * Math.PI) / 180
  return [cx + len * Math.sin(a), cy - len * Math.cos(a)]
}
function ramp(dark: RGB, light: RGB, n: number): string[] {
  const o: string[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    o.push(dmc(`#${[0, 1, 2].map((k) => Math.round(dark[k] + (light[k] - dark[k]) * t).toString(16).padStart(2, '0')).join('')}`))
  }
  return o
}

const els: ShadedElement[] = []
const line = (pts: Pt[], hex: string, slug = 'stem') => els.push({ stitchType: `embroidery-${slug}`, colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: pts } })
const knot = (at: Pt, hex: string) => els.push({ stitchType: 'embroidery-french-knot', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'point', at } })
const wheel = (at: Pt, r: number, hex: string) => els.push({ stitchType: 'embroidery-woven-wheel', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'disc', at, radiusMm: r } })

function shadedPetal(cx: number, cy: number, deg: number, len: number, wid: number, shades: string[]): void {
  const poly = petalPoly(cx, cy, deg, len, wid)
  const tp = tipOf(cx, cy, deg, len)
  const axis = (Math.atan2(tp[1] - cy, tp[0] - cx) * 180) / Math.PI
  els.push({ stitchType: 'embroidery-long-and-short', colourHex: shades[Math.floor(shades.length / 2)]!, thread: THREAD, directionDeg: axis, geometry: { kind: 'path', points: poly }, shade: { ramp: shades, axisDeg: axis } })
}

/** A layered shaded rose: concentric rings of overlapping petals. */
function rose(cx: number, cy: number, scale: number, dark: RGB, light: RGB): void {
  const shades = ramp(dark, light, 4)
  const rings = [
    { count: 7, len: 16 * scale, wid: 8 * scale, off: 0 },
    { count: 6, len: 11 * scale, wid: 6.5 * scale, off: 26 },
    { count: 5, len: 7 * scale, wid: 5 * scale, off: 14 },
  ]
  for (const r of rings) for (let i = 0; i < r.count; i++) shadedPetal(cx, cy, (i * 360) / r.count + r.off, r.len, r.wid, shades)
  knot([cx, cy], dmc('#5a2a1a'))
}

/** A daisy: lazy-daisy petals + a woven-wheel centre. */
function daisy(cx: number, cy: number, n: number, len: number, petalHex: string, centreHex: string): void {
  for (let i = 0; i < n; i++) els.push({ stitchType: 'embroidery-detached-chain', colourHex: petalHex, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: [[cx, cy], tipOf(cx, cy, (i * 360) / n, len)] } })
  wheel([cx, cy], len * 0.32, centreHex)
}

/** A round cluster of French knots (filler flowers / berries / baby's breath). */
function cluster(cx: number, cy: number, r: number, n: number, hex: string): void {
  for (let i = 0; i < n; i++) {
    const a = (i * 137.5 * Math.PI) / 180
    const rr = r * Math.sqrt((i + 0.5) / n)
    knot([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr], hex)
  }
}

function satinLeaf(cx: number, cy: number, deg: number, len: number, wid: number, hex: string): void {
  els.push({ stitchType: 'embroidery-satin', colourHex: hex, thread: THREAD, directionDeg: deg + 90, geometry: { kind: 'path', points: petalPoly(cx, cy, deg, len, wid) } })
}

function buildBouquet(): void {
  const stemG = dmc('#5c7a3a')
  const leafG = dmc('#6f9a52')
  const leafDk = dmc('#4f7a3c')

  // ── Foliage tucked BEHIND the blooms (drawn first) — satin leaves nestled
  //    among the flowers, plus a few short fern sprigs peeking out. No big
  //    symmetric side fronds (those read as raised "hands"). ──
  for (const [x, y, d, l, w] of [[60, 74, -50, 26, 8], [116, 76, 50, 26, 8], [74, 56, -22, 22, 7], [104, 56, 22, 22, 7], [88, 50, 0, 20, 7]] as number[][]) satinLeaf(x!, y!, d!, l!, w!, leafDk)
  // short fern sprigs poking up between the top flowers
  line(bez([80, 60], [76, 48], [74, 40], [72, 34], 8), leafG, 'fern')
  line(bez([100, 60], [104, 48], [106, 40], [108, 34], 8), leafG, 'fern')

  // ── Bound stems gathering at the bottom + a twine tie. ──
  for (const sx of [70, 80, 88, 96, 104]) line(bez([sx, 92], [88, 120], [88, 145], [88, 168], 16), stemG)
  for (let i = 0; i < 6; i++) line([[82, 150 + i * 3], [94, 150 + i * 3]], dmc('#8a6a3a'), 'satin-band')

  // ── Roses (focal, shaded) — one big centre + two side blooms. ──
  rose(88, 72, 1.35, [120, 28, 46], [238, 150, 168]) // centre, crimson->pink
  rose(58, 62, 0.95, [150, 60, 30], [240, 178, 130]) // left, peach
  rose(118, 66, 0.95, [110, 30, 70], [220, 130, 170]) // right, rose

  // ── Daisies. ──
  daisy(74, 50, 11, 12, dmc('#fbf7ef'), dmc('#f2c14e'))
  daisy(104, 52, 11, 11, dmc('#fbf7ef'), dmc('#f2c14e'))
  daisy(90, 96, 10, 10, dmc('#fbf7ef'), dmc('#f2c14e'))

  // ── Filler flowers + berries + baby's breath (texture between the blooms). ──
  cluster(48, 84, 6, 9, dmc('#3a6ea5')) // forget-me-nots (blue)
  cluster(132, 86, 6, 9, dmc('#7a4aa0')) // lilac filler
  cluster(70, 86, 4.5, 7, dmc('#8a1f2e')) // red berries
  cluster(108, 88, 4.5, 7, dmc('#8a1f2e'))
  cluster(60, 44, 6, 11, dmc('#fbf9f4')) // baby's breath (white)
  cluster(118, 44, 6, 11, dmc('#fbf9f4'))
  cluster(90, 38, 5, 9, dmc('#fbf9f4'))
  // a couple of lavender sprigs at the top edges
  const lav = ramp([90, 70, 140], [196, 170, 222], 4)
  for (const [lx] of [[40], [140]] as number[][]) for (let i = 0; i < 8; i++) knot([lx! + (i % 2 ? 2 : -2), 70 - i * 3], lav[Math.min(lav.length - 1, Math.floor((i / 8) * lav.length))]!)
}

async function pageSimple(file: string, title: string, body: string, h = 980): Promise<void> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${h}"><rect width="760" height="${h}" fill="#fff"/><text x="380" y="54" font-family="sans-serif" font-size="28" font-weight="700" fill="#2b3a66" text-anchor="middle" letter-spacing="2">${title}</text>${body}</svg>`
  await sharp(Buffer.from(svg)).png().toFile(resolve(OUT, file))
}
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function wrap(s: string, max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const w of s.split(' ')) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) out.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) out.push(cur)
  return out
}

async function main(): Promise<void> {
  buildBouquet()
  console.log(`${els.length} plan elements authored`)
  writeFileSync(resolve(OUT, 'bouquet.elements.json'), JSON.stringify({ finishedSizeMm: { width: W, height: H }, stitchedElements: els }, null, 2))

  const doc = buildPatternDocument(els, { width: W, height: H }, { title: 'Cottage Garden Bouquet' })
  console.log(`document: ${doc.flossKey.length} floss colours, ${doc.stitchKey.length} stitches`)

  await sharp(Buffer.from(doc.technicalChartSvg)).resize({ width: 720 }).png().toFile(resolve(OUT, 'doc-2-technical-chart.png'))
  await sharp(Buffer.from(doc.colourGuideSvg)).resize({ width: 720 }).png().toFile(resolve(OUT, 'doc-1-colour-guide.png'))

  const flossBody = doc.flossKey.map((f, i) => {
    const y = 110 + i * 42
    return `<rect x="110" y="${y - 20}" width="28" height="28" fill="${f.hex}" stroke="#999"/><text x="156" y="${y}" font-family="sans-serif" font-size="20" fill="#222">${f.number}.  DMC ${f.code} — ${esc(f.name)}</text><text x="620" y="${y}" font-family="sans-serif" font-size="16" fill="#666">x${Math.max(1, Math.ceil(f.count / 14))}</text>`
  }).join('')
  await pageSimple('doc-3-floss-key.png', 'FLOSS KEY  ·  DMC', flossBody, Math.max(980, 140 + doc.flossKey.length * 42))

  const stitchBody = doc.stitchKey.map((s, i) => {
    const y = 110 + i * 88
    const how = wrap(s.how, 66).map((ln, k) => `<text x="130" y="${y + 26 + k * 21}" font-family="sans-serif" font-size="16" fill="#555">${esc(ln)}</text>`).join('')
    return `<text x="80" y="${y}" font-family="sans-serif" font-size="24" font-weight="700" fill="#2b3a66">${s.letter}</text><text x="130" y="${y}" font-family="sans-serif" font-size="21" font-weight="600" fill="#222">${esc(s.name)}</text>${how}`
  }).join('')
  await pageSimple('doc-4-stitch-key.png', 'STITCH KEY', stitchBody, Math.max(980, 140 + doc.stitchKey.length * 88))

  let sy = 100
  const stepsBody = doc.steps.map((s, i) => {
    const lines = wrap(`${i + 1}.  ${s}`, 76)
    const block = lines.map((ln, k) => `<text x="60" y="${sy + k * 25}" font-family="sans-serif" font-size="17" fill="#222">${esc(ln)}</text>`).join('')
    sy += lines.length * 25 + 12
    return block
  }).join('')
  await pageSimple('doc-5-steps.png', 'STEP BY STEP', stepsBody, Math.max(980, sy + 60))
  console.log('wrote document pages doc-1..doc-5')

  const rendered = expandShading(els)
  console.log(`${rendered.length} render elements after shading expansion`)
  const strokes = patternToStrokes(rendered, { strands: 6, defaultThread: THREAD })
  const img = renderEmbroidery({ widthMm: W, heightMm: H, pxPerMm: 5, ss: 2, fabric: { hex: '#efe7d6', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 }, strokes })
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(resolve(OUT, 'plan-preview.png'))
  console.log(`plan-preview.png (${strokes.length} stitches)`)

  if (process.argv.includes('--hero')) {
    console.log('rendering loom hero via renderHero()…')
    const hero = await renderHero(
      { name: 'cottage-bouquet', stitchedElements: rendered, finishedSizeMm: { width: W, height: H }, fabricHex: '#efe7d6', defaultThread: THREAD, strands: 6, frame: { shape: 'round' } },
      { persist: false, outDir: resolve(OUT, 'heroes') },
    )
    console.log(`hero: ${hero.localHeroPath} (${hero.pathTaken.kind}, gate ${hero.gate.pass ? 'PASS' : 'FAIL'})`)
  }
}

main().catch((e) => {
  console.error('bouquet FAILED:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})

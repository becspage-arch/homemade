/**
 * ONE COMPLETE original needlework pattern, end to end — the deliverable.
 *
 * A Homemade-ORIGINAL wildflower meadow (our composition; design-direction
 * "modern-botanicals" × "cottagecore-botanical" × the wildflower-meadow palette).
 * NOT a copy of any licensed pattern — those are format reference only.
 *
 * ONE structured dataset (per-element geometry + stitch slug + DMC floss) drives
 * everything:
 *   - the loom's renderHero(dataset)            -> the photoreal hero
 *   - buildPatternDocument(dataset)             -> colour guide, floss key,
 *                                                  stitch key, steps, line chart
 * Document and hero come from the same data, so they cannot diverge.
 *
 *   npx tsx scripts/needlework-meadow.ts            # plan + document + CPU check
 *   npx tsx scripts/needlework-meadow.ts --hero     #   ...+ loom renderHero
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
const OUT = resolve(__dirname, '../../../.needlework-scratch/meadow')
mkdirSync(OUT, { recursive: true })
const THREAD = { type: 'stranded-cotton', weight: '6-strand' }
const W = 165
const H = 160

type Pt = [number, number]
type RGB = [number, number, number]
const dmc = (hex: string) => nearestFloss(hex, { brand: 'DMC' }).entry.rgb

function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const o: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    o.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ])
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
  return rot([...bez([0, 0], [-wid, -len * 0.3], [-wid * 0.6, -len * 0.85], [0, -len], 14), ...bez([0, -len], [wid * 0.6, -len * 0.85], [wid, -len * 0.3], [0, 0], 14)], cx, cy, deg)
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
const fill = (poly: Pt[], hex: string, dir: number, slug = 'long-and-short') => els.push({ stitchType: `embroidery-${slug}`, colourHex: hex, thread: THREAD, directionDeg: dir, geometry: { kind: 'path', points: poly } })
const line = (pts: Pt[], hex: string, slug = 'stem') => els.push({ stitchType: `embroidery-${slug}`, colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: pts } })
const knot = (at: Pt, hex: string) => els.push({ stitchType: 'embroidery-french-knot', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'point', at } })
const wheel = (at: Pt, r: number, hex: string) => els.push({ stitchType: 'embroidery-woven-wheel', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'disc', at, radiusMm: r } })

/** One shaded petal: a single shape carrying a DMC ramp (dark base -> light tip).
 *  The document draws one clean outline; expandShading bands it for the hero. */
function shadedPetal(cx: number, cy: number, deg: number, len: number, wid: number, shades: string[]): void {
  const poly = petalPoly(cx, cy, deg, len, wid)
  const tp = tipOf(cx, cy, deg, len)
  const axis = (Math.atan2(tp[1] - cy, tp[0] - cx) * 180) / Math.PI
  els.push({
    stitchType: 'embroidery-long-and-short',
    colourHex: shades[Math.floor(shades.length / 2)]!,
    thread: THREAD,
    directionDeg: axis,
    geometry: { kind: 'path', points: poly },
    shade: { ramp: shades, axisDeg: axis },
  })
}

function buildMeadow(): void {
  const stemGreen = dmc('#5c7a3a')
  const leafGreen = dmc('#6f9a52')

  // ── Red poppy (left) — shaded long-and-short petals + dark knot centre. ──
  line(bez([30, 150], [33, 120], [27, 95], [30, 74], 18), stemGreen)
  const poppy = ramp([122, 24, 28], [232, 96, 80], 4)
  for (const a of [-58, -20, 20, 58, 0]) shadedPetal(30, 70, a, a === 0 ? 20 : 24, 11, poppy)
  for (let i = 0; i < 6; i++) knot([30 + Math.cos((i / 6) * 6.28) * 3, 70 + Math.sin((i / 6) * 6.28) * 3], dmc('#3a2210'))

  // ── White daisy (centre-left) — lazy-daisy petals + woven-wheel centre. ──
  line(bez([62, 150], [64, 118], [58, 88], [60, 60], 18), stemGreen)
  for (let i = 0; i < 11; i++) {
    const a = (i * 360) / 11
    els.push({ stitchType: 'embroidery-detached-chain', colourHex: dmc('#fbf7ef'), thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: [[60, 56], tipOf(60, 56, a, 13)] } })
  }
  wheel([60, 56], 4.5, dmc('#f2c14e'))

  // ── Blue cornflower (centre) — straight-stitch spiky petals. ──
  line(bez([92, 150], [95, 116], [89, 86], [92, 60], 18), stemGreen)
  for (let i = 0; i < 12; i++) {
    const a = (i * 360) / 12
    els.push({ stitchType: 'embroidery-straight', colourHex: dmc(i % 2 ? '#3a6ea5' : '#5b8fc9'), thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: [[92, 56], tipOf(92, 56, a, i % 2 ? 12 : 9)] } })
  }
  for (let i = 0; i < 5; i++) knot([92 + Math.cos(i) * 2.5, 56 + Math.sin(i) * 2.5], dmc('#2b2f6b'))

  // ── Lavender spike (right-centre) — a graded column of French knots. ──
  line([[120, 150], [120, 64]], stemGreen)
  const lav = ramp([90, 70, 140], [196, 170, 222], 5)
  for (let i = 0; i < 16; i++) {
    const y = 64 + (i / 16) * 36
    const dx = (i % 2 ? 1 : -1) * (2.5 + (i % 3))
    knot([120 + dx, y], lav[Math.min(lav.length - 1, Math.floor((i / 16) * lav.length))]!)
  }

  // ── Yellow buttercups (right) — small satin-petal flowers. ──
  line(bez([142, 150], [145, 122], [139, 98], [142, 84], 16), stemGreen)
  for (const [bx, by] of [[142, 80], [149, 92], [136, 96]] as Pt[]) {
    for (let i = 0; i < 5; i++) fill(petalPoly(bx, by, (i * 360) / 5, 7, 4), dmc('#f4b63a'), (i * 360) / 5, 'satin')
    knot([bx, by], dmc('#7a5a1a'))
  }

  // ── Ferns + grass (greenery) + a berry sprig (filler texture). ──
  line(bez([16, 150], [10, 120], [20, 96], [14, 80], 16), leafGreen, 'fern')
  line(bez([156, 150], [162, 120], [150, 98], [156, 82], 16), leafGreen, 'fern')
  // berry sprig
  line([[46, 150], [46, 112]], dmc('#7a8a4a'))
  for (const [bx, by] of [[44, 110], [49, 116], [42, 120], [50, 124], [45, 128]] as Pt[]) {
    line([[46, by + 4], [bx, by]], dmc('#7a8a4a'), 'back')
    knot([bx, by], dmc('#8a1f2e'))
  }
  // grass blades
  for (const gx of [22, 38, 74, 105, 128, 150]) line([[gx, 150], [gx + (gx % 2 ? 4 : -4), 132]], leafGreen, 'straight')
}

/** Word-wrap `s` to <= `max` chars per line. */
function wrap(s: string, max: number): string[] {
  const words = s.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

/** A simple white SVG page with a heading + lines/swatches, rendered to PNG. */
async function page(file: string, title: string, body: string, w = 760, h = 980): Promise<void> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#ffffff"/><text x="${w / 2}" y="54" font-family="sans-serif" font-size="28" font-weight="700" fill="#2b3a66" text-anchor="middle" letter-spacing="2">${title}</text>${body}</svg>`
  await sharp(Buffer.from(svg)).png().toFile(resolve(OUT, file))
}

async function main(): Promise<void> {
  buildMeadow()
  console.log(`${els.length} elements authored`)
  writeFileSync(resolve(OUT, 'meadow.elements.json'), JSON.stringify({ finishedSizeMm: { width: W, height: H }, stitchedElements: els }, null, 2))

  const doc = buildPatternDocument(els, { width: W, height: H }, { title: 'Wildflower Meadow' })
  console.log(`document: ${doc.flossKey.length} floss colours, ${doc.stitchKey.length} stitches`)

  // Line chart + colour guide (scale the mm-SVG up for a crisp page).
  await sharp(Buffer.from(doc.technicalChartSvg)).resize({ width: 720 }).png().toFile(resolve(OUT, 'doc-2-technical-chart.png'))
  await sharp(Buffer.from(doc.colourGuideSvg)).resize({ width: 720 }).png().toFile(resolve(OUT, 'doc-1-colour-guide.png'))

  // Floss key page.
  const flossBody = doc.flossKey
    .map((f, i) => {
      const y = 110 + i * 46
      return `<rect x="120" y="${y - 22}" width="30" height="30" fill="${f.hex}" stroke="#999" stroke-width="1"/><text x="170" y="${y}" font-family="sans-serif" font-size="22" fill="#222">${f.number}.  DMC ${f.code} — ${f.name}</text><text x="600" y="${y}" font-family="sans-serif" font-size="18" fill="#666">x${Math.max(1, Math.ceil(f.count / 12))} skein</text>`
    })
    .join('')
  await page('doc-3-floss-key.png', 'FLOSS KEY  ·  DMC', flossBody)

  // Stitch key page.
  const stitchBody = doc.stitchKey
    .map((s, i) => {
      const y = 120 + i * 92
      const how = wrap(s.how, 64)
        .map((ln, k) => `<text x="130" y="${y + 28 + k * 22}" font-family="sans-serif" font-size="17" fill="#555">${escapeXml(ln)}</text>`)
        .join('')
      return `<text x="80" y="${y}" font-family="sans-serif" font-size="26" font-weight="700" fill="#2b3a66">${s.letter}</text><text x="130" y="${y}" font-family="sans-serif" font-size="22" font-weight="600" fill="#222">${escapeXml(s.name)}</text>${how}`
    })
    .join('')
  await page('doc-4-stitch-key.png', 'STITCH KEY', stitchBody, 760, 1120)

  // Steps page (wrapped).
  let sy = 100
  const stepsBody = doc.steps
    .map((s, i) => {
      const lines = wrap(`${i + 1}.  ${s}`, 74)
      const block = lines.map((ln, k) => `<text x="70" y="${sy + k * 26}" font-family="sans-serif" font-size="18" fill="#222">${escapeXml(ln)}</text>`).join('')
      sy += lines.length * 26 + 14
      return block
    })
    .join('')
  await page('doc-5-steps.png', 'STEP BY STEP', stepsBody, 760, Math.max(980, sy + 60))
  console.log('wrote document pages doc-1..doc-5')

  // Expand shaded shapes into graded long-and-short bands for the loom.
  const rendered = expandShading(els)
  console.log(`${rendered.length} render elements after shading expansion`)

  // Quick loom CPU preview (the loom's fast renderer — my own composition check).
  const strokes = patternToStrokes(rendered, { strands: 6, defaultThread: THREAD })
  const img = renderEmbroidery({ widthMm: W, heightMm: H, pxPerMm: 5, ss: 2, fabric: { hex: '#efe7d6', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 }, strokes })
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(resolve(OUT, 'plan-preview.png'))
  console.log(`plan-preview.png (${strokes.length} stitches)`)

  if (process.argv.includes('--hero')) {
    console.log('rendering loom hero via renderHero()…')
    const hero = await renderHero(
      { name: 'wildflower-meadow', stitchedElements: rendered, finishedSizeMm: { width: W, height: H }, fabricHex: '#efe7d6', defaultThread: THREAD, strands: 6, frame: { shape: 'round' } },
      { persist: false, outDir: resolve(OUT, 'heroes') },
    )
    console.log(`hero: ${hero.localHeroPath} (${hero.pathTaken.kind}, gate ${hero.gate.pass ? 'PASS' : 'FAIL'})`)
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

main().catch((e) => {
  console.error('meadow FAILED:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})

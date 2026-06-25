/**
 * Try-outs — does the vector→document→loom pipeline translate to other subjects
 * and stitch sets? Two originals through the SAME pipeline:
 *   --subject city  : a city skyline (satin buildings, back-stitch wheel, knot
 *                     trees/clouds, satin bus) — architectural, different stitches.
 *   --subject rose  : a MORE REALISTIC single rose — irregular overlapping petals,
 *                     5-band shading, not tidy rings (less cartoony).
 *
 *   npx tsx scripts/needlework-tryouts.ts --subject city [--hero]
 *   npx tsx scripts/needlework-tryouts.ts --subject rose [--hero]
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

import { nearestFloss } from '../src/lib/floss/nearest-floss'
import { patternToStrokes } from '../src/lib/loom/render/renderPattern'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { buildPatternDocument, expandShading, type ShadedElement, type PatternDocument } from '../src/lib/needlework/engine'
import { renderHero } from './loom-render-hero'

const __dirname = dirname(fileURLToPath(import.meta.url))
type Pt = [number, number]
type RGB = [number, number, number]
const dmc = (hex: string) => nearestFloss(hex, { brand: 'DMC' }).entry.rgb
const THREAD = { type: 'stranded-cotton', weight: '6-strand' }

// seeded RNG so designs are reproducible
let _s = 987654321
const rnd = () => ((_s = (_s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
const jit = (base: number, amt: number) => base + (rnd() * 2 - 1) * amt

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
function ramp(dark: RGB, light: RGB, n: number): string[] {
  const o: string[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    o.push(dmc(`#${[0, 1, 2].map((k) => Math.round(dark[k] + (light[k] - dark[k]) * t).toString(16).padStart(2, '0')).join('')}`))
  }
  return o
}

let els: ShadedElement[] = []
const fillFlat = (poly: Pt[], hex: string, dir: number, slug = 'satin') => els.push({ stitchType: `embroidery-${slug}`, colourHex: hex, thread: THREAD, directionDeg: dir, geometry: { kind: 'path', points: poly } })
const line = (pts: Pt[], hex: string, slug = 'stem') => els.push({ stitchType: `embroidery-${slug}`, colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: pts } })
const knot = (at: Pt, hex: string) => els.push({ stitchType: 'embroidery-french-knot', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'point', at } })
const straight = (a: Pt, b: Pt, hex: string) => els.push({ stitchType: 'embroidery-straight', colourHex: hex, thread: THREAD, directionDeg: null, geometry: { kind: 'path', points: [a, b] } })
const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
const cluster = (cx: number, cy: number, r: number, n: number, hex: string) => {
  for (let i = 0; i < n; i++) {
    const a = (i * 137.5 * Math.PI) / 180
    const rr = r * Math.sqrt((i + 0.5) / n)
    knot([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr], hex)
  }
}

/** A broad, cupped rose petal (rounded top) — more naturalistic than a teardrop. */
function rosePetal(cx: number, cy: number, deg: number, len: number, wid: number): Pt[] {
  const poly = [
    ...bez([0, 0], [-wid * 0.9, -len * 0.35], [-wid, -len * 0.8], [-wid * 0.35, -len], 10),
    ...bez([-wid * 0.35, -len], [-wid * 0.12, -len * 1.1], [wid * 0.12, -len * 1.1], [wid * 0.35, -len], 6),
    ...bez([wid * 0.35, -len], [wid, -len * 0.8], [wid * 0.9, -len * 0.35], [0, 0], 10),
  ]
  return rot(poly, cx, cy, deg)
}
function shadedRosePetal(cx: number, cy: number, deg: number, len: number, wid: number, shades: string[]): void {
  const poly = rosePetal(cx, cy, deg, len, wid)
  const tp = tipOf(cx, cy, deg, len)
  const axis = (Math.atan2(tp[1] - cy, tp[0] - cx) * 180) / Math.PI
  els.push({ stitchType: 'embroidery-long-and-short', colourHex: shades[Math.floor(shades.length / 2)]!, thread: THREAD, directionDeg: axis, geometry: { kind: 'path', points: poly }, shade: { ramp: shades, axisDeg: axis } })
}
/** A pointed leaf, shaded along its length, with a central vein. */
function leaf(cx: number, cy: number, deg: number, len: number, wid: number, dark: RGB, light: RGB): void {
  const poly = rot([...bez([0, 0], [-wid, -len * 0.4], [-wid * 0.5, -len * 0.85], [0, -len], 12), ...bez([0, -len], [wid * 0.5, -len * 0.85], [wid, -len * 0.4], [0, 0], 12)], cx, cy, deg)
  const tp = tipOf(cx, cy, deg, len)
  const axis = (Math.atan2(tp[1] - cy, tp[0] - cx) * 180) / Math.PI
  els.push({ stitchType: 'embroidery-long-and-short', colourHex: ramp(dark, light, 4)[1]!, thread: THREAD, directionDeg: axis + 90, geometry: { kind: 'path', points: poly }, shade: { ramp: ramp(dark, light, 4), axisDeg: axis } })
  line([[cx, cy], tp], dmc('#3a5226'), 'back') // vein
}

// ── A MORE REALISTIC single rose: irregular overlapping petals, 5-band shading. ──
function buildRose(): { W: number; H: number } {
  const W = 140
  const H = 165
  const cx = 70
  const cy = 74
  // leaves + stem behind
  line(bez([cx, cy + 14], [cx + 4, cy + 45], [cx - 4, cy + 75], [cx, cy + 92], 18), dmc('#3c5a30'))
  leaf(cx - 6, cy + 52, -118, 30, 11, [40, 64, 32], [120, 165, 96])
  leaf(cx + 8, cy + 66, 120, 28, 10, [40, 64, 32], [120, 165, 96])
  // rose: layered rings, broad petals, jittered (not tidy rings)
  const rings = [
    { count: 8, len: 26, wid: 17, off: 0, ramp: [[120, 24, 30], [236, 120, 120]] as [RGB, RGB] },
    { count: 7, len: 19, wid: 14, off: 25, ramp: [[104, 18, 26], [212, 92, 96]] as [RGB, RGB] },
    { count: 6, len: 13, wid: 11, off: 12, ramp: [[88, 14, 22], [186, 70, 78]] as [RGB, RGB] },
    { count: 5, len: 8, wid: 8, off: 30, ramp: [[70, 10, 18], [150, 52, 62]] as [RGB, RGB] },
  ]
  for (const r of rings) {
    const shades = ramp(r.ramp[0], r.ramp[1], 5)
    for (let i = 0; i < r.count; i++) shadedRosePetal(jit(cx, 1.5), jit(cy, 1.5), (i * 360) / r.count + r.off + jit(0, 9), jit(r.len, r.len * 0.12), jit(r.wid, r.wid * 0.1), shades)
  }
  for (let i = 0; i < 5; i++) knot([cx + Math.cos(i) * 2.5, cy + Math.sin(i) * 2.5], dmc('#4a0d16'))
  // a bud on a side stem
  line(bez([cx + 2, cy + 30], [cx + 18, cy + 24], [cx + 30, cy + 14], [cx + 34, cy + 4], 12), dmc('#3c5a30'))
  for (const a of [-30, 0, 30]) shadedRosePetal(cx + 35, cy - 2, a, 11, 7, ramp([110, 20, 28], [206, 90, 96], 4))
  for (const a of [-150, 150]) fillFlat(rot([...bez([0, 0], [-5, -8], [-2, -14], [0, -16], 6), ...bez([0, -16], [2, -14], [5, -8], [0, 0], 6)], cx + 35, cy - 2, a), dmc('#4f7a3c'), a, 'satin')
  return { W, H }
}

// ── A city skyline: satin buildings, back-stitch wheel, knot trees/clouds, bus. ──
function buildCity(): { W: number; H: number } {
  const W = 180
  const H = 150
  const ground = 118
  const stone = ramp([150, 120, 78], [205, 178, 130], 3)
  const stoneMid = stone[1]!
  // ground line
  line([[18, ground], [162, ground]], dmc('#8a7a5a'), 'back')

  // clouds (fluffy white knot clusters)
  cluster(48, 26, 11, 22, dmc('#fbf9f4'))
  cluster(128, 22, 12, 24, dmc('#fbf9f4'))

  // Houses of Parliament block (left of the tower)
  fillFlat(rect(40, 78, 74, ground), stoneMid, 90, 'long-and-short')
  for (const wx of [46, 53, 60, 67]) line([[wx, 84], [wx, ground - 3]], dmc('#7a6038'), 'back') // window mullions
  straight([42, 78], [44, 70], dmc('#9a8048')) // small finials
  straight([72, 78], [70, 70], dmc('#9a8048'))

  // Big Ben tower (centre)
  fillFlat(rect(80, 50, 92, ground), stone[2]!, 0, 'long-and-short')
  els.push({ stitchType: 'embroidery-woven-wheel', colourHex: dmc('#efe7cf'), thread: THREAD, directionDeg: null, geometry: { kind: 'disc', at: [86, 58], radiusMm: 3.2 } }) // clock face
  knot([86, 58], dmc('#5a4a2a'))
  fillFlat([[80, 50], [92, 50], [86, 40]], dmc('#8a6a3a'), 0, 'satin') // roof spire
  straight([86, 40], [86, 34], dmc('#8a6a3a'))

  // London Eye (right): back-stitch ring + straight spokes + knot pods + legs
  const ex = 134
  const ey = 74
  const er = 26
  const ring: Pt[] = []
  for (let i = 0; i <= 48; i++) ring.push([ex + Math.cos((i / 48) * 6.2832) * er, ey + Math.sin((i / 48) * 6.2832) * er])
  line(ring, dmc('#2b2b2b'), 'back')
  for (let i = 0; i < 16; i++) straight([ex, ey], [ex + Math.cos((i / 16) * 6.2832) * er, ey + Math.sin((i / 16) * 6.2832) * er], dmc('#3a3a3a'))
  for (let i = 0; i < 16; i++) knot([ex + Math.cos((i / 16) * 6.2832) * er, ey + Math.sin((i / 16) * 6.2832) * er], dmc('#d6dde2'))
  line([[ex, ey], [ex - 8, ground]], dmc('#444'), 'stem')
  line([[ex, ey], [ex + 8, ground]], dmc('#444'), 'stem')

  // Trees (knot clusters on stem-stitch trunks)
  line([[26, ground], [26, 96]], dmc('#6a4a2a'))
  cluster(26, 90, 12, 30, dmc('#5f7a3a'))
  line([[156, ground], [156, 98]], dmc('#6a4a2a'))
  cluster(156, 92, 11, 26, dmc('#5f7a3a'))

  // Double-decker bus (front)
  fillFlat(rect(64, ground - 1, 104, ground + 18), dmc('#c62828'), 90, 'satin')
  for (const wx of [68, 76, 84, 92]) fillFlat(rect(wx, ground + 2, wx + 5, ground + 8), dmc('#cfe3ee'), 0, 'satin') // upper windows
  for (const wx of [68, 76, 84, 92]) fillFlat(rect(wx, ground + 10, wx + 5, ground + 15), dmc('#cfe3ee'), 0, 'satin') // lower windows
  knot([72, ground + 19], dmc('#1c1c1c'))
  knot([96, ground + 19], dmc('#1c1c1c'))
  return { W, H }
}

async function pageSimple(out: string, file: string, title: string, body: string, h: number): Promise<void> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${h}"><rect width="760" height="${h}" fill="#fff"/><text x="380" y="54" font-family="sans-serif" font-size="28" font-weight="700" fill="#2b3a66" text-anchor="middle" letter-spacing="2">${title}</text>${body}</svg>`
  await sharp(Buffer.from(svg)).png().toFile(resolve(out, file))
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
async function writeDoc(doc: PatternDocument, size: { width: number; height: number }, out: string): Promise<void> {
  await sharp(Buffer.from(doc.technicalChartSvg)).resize({ width: 720 }).png().toFile(resolve(out, 'doc-2-technical-chart.png'))
  await sharp(Buffer.from(doc.colourGuideSvg)).resize({ width: 720 }).png().toFile(resolve(out, 'doc-1-colour-guide.png'))
  const fb = doc.flossKey.map((f, i) => { const y = 110 + i * 40; return `<rect x="110" y="${y - 20}" width="26" height="26" fill="${f.hex}" stroke="#999"/><text x="152" y="${y}" font-family="sans-serif" font-size="19" fill="#222">${f.number}.  DMC ${f.code} — ${esc(f.name)}</text>` }).join('')
  await pageSimple(out, 'doc-3-floss-key.png', 'FLOSS KEY · DMC', fb, Math.max(900, 140 + doc.flossKey.length * 40))
  const sb = doc.stitchKey.map((s, i) => { const y = 110 + i * 86; const how = wrap(s.how, 66).map((ln, k) => `<text x="130" y="${y + 26 + k * 21}" font-family="sans-serif" font-size="16" fill="#555">${esc(ln)}</text>`).join(''); return `<text x="80" y="${y}" font-family="sans-serif" font-size="24" font-weight="700" fill="#2b3a66">${s.letter}</text><text x="130" y="${y}" font-family="sans-serif" font-size="21" font-weight="600" fill="#222">${esc(s.name)}</text>${how}` }).join('')
  await pageSimple(out, 'doc-4-stitch-key.png', 'STITCH KEY', sb, Math.max(900, 140 + doc.stitchKey.length * 86))
  let sy = 100
  const stb = doc.steps.map((s, i) => { const lines = wrap(`${i + 1}.  ${s}`, 76); const block = lines.map((ln, k) => `<text x="60" y="${sy + k * 25}" font-family="sans-serif" font-size="17" fill="#222">${esc(ln)}</text>`).join(''); sy += lines.length * 25 + 12; return block }).join('')
  await pageSimple(out, 'doc-5-steps.png', 'STEP BY STEP', stb, Math.max(900, sy + 60))
}

async function main(): Promise<void> {
  const subject = process.argv[process.argv.indexOf('--subject') + 1] ?? 'rose'
  const OUT = resolve(__dirname, `../../../.needlework-scratch/tryout-${subject}`)
  mkdirSync(OUT, { recursive: true })
  els = []
  const { W, H } = subject === 'city' ? buildCity() : buildRose()
  const title = subject === 'city' ? 'City Skyline' : 'Garden Rose'
  console.log(`${subject}: ${els.length} plan elements`)
  writeFileSync(resolve(OUT, 'elements.json'), JSON.stringify({ finishedSizeMm: { width: W, height: H }, stitchedElements: els }, null, 2))

  const doc = buildPatternDocument(els, { width: W, height: H }, { title })
  console.log(`document: ${doc.flossKey.length} floss, ${doc.stitchKey.length} stitches`)
  await writeDoc(doc, { width: W, height: H }, OUT)

  const rendered = expandShading(els)
  const strokes = patternToStrokes(rendered, { strands: 6, defaultThread: THREAD })
  const img = renderEmbroidery({ widthMm: W, heightMm: H, pxPerMm: 5, ss: 2, fabric: { hex: '#efe7d6', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 }, strokes })
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(resolve(OUT, 'plan-preview.png'))
  console.log(`plan-preview.png (${strokes.length} stitches), ${rendered.length} render elements`)

  if (process.argv.includes('--hero')) {
    console.log('rendering loom hero…')
    const hero = await renderHero({ name: `tryout-${subject}`, stitchedElements: rendered, finishedSizeMm: { width: W, height: H }, fabricHex: '#efe7d6', defaultThread: THREAD, strands: 6, frame: { shape: subject === 'city' ? 'round' : 'round' } }, { persist: false, outDir: resolve(OUT, 'heroes') })
    console.log(`hero: ${hero.localHeroPath} (gate ${hero.gate.pass ? 'PASS' : 'FAIL'})`)
  }
}

main().catch((e) => { console.error('tryout FAILED:', e instanceof Error ? e.message : String(e)); process.exit(1) })

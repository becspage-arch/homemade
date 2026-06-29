/**
 * AI-DESIGN → SURFACE EMBROIDERY (the route-1 converter). Flux designs a BOLD,
 * flat, limited-palette illustration; we quantise it (photoToPatternData's proven
 * median-cut + confetti reduction), trace each colour's connected regions into
 * smooth polygons, fill each with satin in its DMC colour, and render the finished
 * hoop via the loom. Flat art (not a photo) segments cleanly into stitchable
 * shapes — the untried angle that the old photo→segment failures never had.
 *
 *   cd apps/web && npx tsx scripts/needlework-ai-embroidery.ts [slug ...] [--render]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch { /* env from shell */ }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? 'C:/Users/Rebecca/Projects/code/homemade/.env.credentials')

import sharp from 'sharp'
import { fluxIllustration } from '../src/lib/studio/generation/sources'
import type { StitchedElement } from '../src/lib/loom/render/renderPattern'
import { traceLineArt } from '../src/lib/needlework/engine/trace'
import { nearestDmcFull } from '../src/lib/floss/dmc-full'
import { patternToGuideSvg } from '../src/lib/needlework/engine/guide'
import { renderHero } from './loom-render-hero'

const OUT = resolve(process.cwd(), '../../.loom-scratch/needlework/ai-embroidery')
type Pt = [number, number]

interface Region { poly: Pt[]; hex: string; area: number }

/** Mean colour of the pixels inside `poly`, sampled over its bbox (point-in-poly). */
function meanColour(rgb: Buffer, W: number, poly: Pt[]): string {
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9
  for (const [x, y] of poly) { if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y }
  const inside = (px: number, py: number): boolean => {
    let c = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i]![0], yi = poly[i]![1], xj = poly[j]![0], yj = poly[j]![1]
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c
    }
    return c
  }
  let r = 0, g = 0, b = 0, n = 0
  const step = Math.max(1, Math.round(Math.max(maxX - minX, maxY - minY) / 44))
  for (let y = Math.floor(minY); y <= maxY; y += step) for (let x = Math.floor(minX); x <= maxX; x += step) {
    if (!inside(x + 0.5, y + 0.5)) continue
    const k = (y * W + x) * 3
    r += rgb[k]!; g += rgb[k + 1]!; b += rgb[k + 2]!; n++
  }
  if (!n) return '#cccccc'
  const to = (v: number): string => Math.round(v / n).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function regionsToElements(regions: Region[], W: number, H: number, sizeMm: number): { els: StitchedElement[]; height: number } {
  // fit the grid into a squared hoop (so the round frame contains it)
  const pad = 0.06 * Math.max(W, H)
  const half = Math.max(W, H) / 2 + pad
  const cx = W / 2, cy = H / 2
  const scale = sizeMm / (2 * half)
  const tx = (p: Pt): Pt => [(p[0] - (cx - half)) * scale, (p[1] - (cy - half)) * scale]
  const fills: StitchedElement[] = regions.map((r) => ({
    stitchType: 'embroidery-satin', colourHex: nearestDmcFull(r.hex).hex, thread: { type: 'stranded-cotton', weight: '6-strand' },
    directionDeg: null, geometry: { kind: 'path', points: r.poly.map(tx) },
  }))
  // a fine dark stem-stitch outline around every shape, drawn last so it sits on
  // top — these are BOLD GRAPHIC designs, so a crisp outline is the intended look
  // and it hides region-edge jaggedness (faithful to the black-outline Flux art).
  const outlines: StitchedElement[] = regions.map((r) => ({
    stitchType: 'embroidery-stem', colourHex: '#2b2622', thread: { type: 'stranded-cotton', weight: '6-strand' },
    directionDeg: null, geometry: { kind: 'path', points: [...r.poly.map(tx), tx(r.poly[0]!)] },
  }))
  return { els: [...fills, ...outlines], height: 2 * half * scale }
}

const OUTLINE = ', bold black outlines around every shape, flat solid colour fill, bold saturated vibrant colours, no large plain white areas, simple bold graphic sticker style, thick clean black linework, no shading, centered, plain white background'
interface Brief { slug: string; prompt: string }
const BRIEFS: Brief[] = [
  { slug: 'e2-heart', prompt: 'a heart shape made of bold red and pink roses with green leaves' + OUTLINE },
  { slug: 'e2-sunflower', prompt: 'a single bold sunflower with a brown seed centre and green leaves' + OUTLINE },
  { slug: 'e2-cactus', prompt: 'a round green cactus with a bright pink flower in a terracotta pot' + OUTLINE },
  { slug: 'e2-rainbow', prompt: 'a bold rainbow with a bright yellow sun and two clouds' + OUTLINE },
  { slug: 'e2-watermelon', prompt: 'a bold juicy slice of watermelon with black seeds' + OUTLINE },
  { slug: 'e2-toadstool', prompt: 'a bold red toadstool mushroom with white spots and a tuft of green grass' + OUTLINE },
  { slug: 'e2-teapot', prompt: 'a bold floral teapot with a colourful flower pattern' + OUTLINE },
  { slug: 'e2-sailboat', prompt: 'a bold little sailboat with red and white sails on blue waves under a sun' + OUTLINE },
  { slug: 'e-strawberry-OLD', prompt: 'a single big ripe red strawberry with green leaves and a small white blossom' + OUTLINE },
  { slug: 'e-rainbow-OLD', prompt: 'a cheerful rainbow arching over two fluffy clouds with little raindrops' + OUTLINE },
  { slug: 'e-butterfly', prompt: 'a single colourful butterfly with boldly patterned symmetrical wings' + OUTLINE },
  { slug: 'e-balloon', prompt: 'a striped hot air balloon with a little basket and triangle bunting in a sky with small clouds' + OUTLINE },
  { slug: 'e-lemon', prompt: 'a bright yellow lemon branch with two lemons, leaves and a white blossom' + OUTLINE },
  { slug: 'e-whale', prompt: 'a friendly blue whale spouting water, simple bold shape' + OUTLINE },
]

async function fluxCached(slug: string, prompt: string): Promise<Buffer> {
  mkdirSync(OUT, { recursive: true })
  const p = resolve(OUT, `${slug}.flux.png`)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(prompt, { imageSize: 'square_hd' })
  writeFileSync(p, src.buffer)
  return src.buffer
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  const args = process.argv.slice(2)
  const doRender = args.includes('--render')
  const want = args.filter((a) => !a.startsWith('--'))
  const briefs = want.length ? BRIEFS.filter((b) => want.includes(b.slug)) : BRIEFS

  for (const b of briefs) {
    const img = await fluxCached(b.slug, b.prompt)
    const SIZE = 448
    const { data: rgb, info } = await sharp(img).resize(SIZE, SIZE, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const W = info.width, H = info.height
    const gray = new Uint8Array(await sharp(img).resize(W, H, { fit: 'fill' }).grayscale().raw().toBuffer())
    // black linework = shape boundaries; the enclosed cells are the colour shapes
    const traced = traceLineArt(gray, W, H, { inkBelow: 105, dilate: 1, minAreaFrac: 0.0015, simplifyPx: 1.3 })
    const regions: Region[] = traced.cells.map((c) => ({ poly: c.polygon, hex: meanColour(rgb, W, c.polygon), area: c.areaPx }))
    regions.sort((a, b) => b.area - a.area)
    const { els, height } = regionsToElements(regions, W, H, 180)
    console.log(`[emb:${b.slug}] ${traced.cells.length} cells · ${regions.length} regions · ${els.length} elements`)
    writeFileSync(resolve(OUT, `${b.slug}.pattern.json`), JSON.stringify({ name: b.slug, finishedSizeMm: { width: 180, height }, frameType: 'HOOP', fabricSpec: { colourHex: '#e6dcc4' }, stitchedElements: els }, null, 2))
    // cheap flat preview of the segmentation (before the slow loom render)
    const prev = patternToGuideSvg(els, { width: 180, height }, { mode: 'colour', background: '#e6dcc4', directionHints: false })
    await sharp(Buffer.from(prev)).resize({ width: 700 }).png().toFile(resolve(OUT, `${b.slug}.preview.png`))
    // also keep the raw flux for side-by-side
    writeFileSync(resolve(OUT, `${b.slug}.flux.copy.png`), img)

    if (doRender) {
      console.log(`[emb:${b.slug}] rendering hero (Blender + Fal)…`)
      const hero = await renderHero(
        { name: b.slug, stitchedElements: els, finishedSizeMm: { width: 180, height }, fabricHex: '#e6dcc4', frameType: 'HOOP', defaultThread: { type: 'stranded-cotton', weight: '6-strand' }, strands: 6 },
        { persist: false, tameWarm: true },
      )
      console.log(`[emb:${b.slug}] hero -> ${hero.localHeroPath}`)
    }
  }
}
main().catch((e) => { console.error('[ai-embroidery] FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })

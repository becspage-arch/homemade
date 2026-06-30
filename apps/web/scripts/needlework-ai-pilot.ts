/**
 * AI-DESIGN cross-stitch GENERATE + RENDER for the gate (no publish). Flux designs
 * each piece; photoToPatternData makes a floss chart; we render the beauty chart
 * for a Claude vision pass (GATE_CHECKLIST.md). Briefs deliberately span SIZE,
 * COMPLEXITY and STYLE, not just subject. The gate looks at every render and
 * repairs the fails by re-running that slug (`--regen <slug>`: re-roll Flux) with
 * adjusted settings, then re-judges. Only all-YES designs go to the publish step.
 *
 *   cd apps/web && npx tsx scripts/needlework-ai-pilot.ts [slug ...] [--regen]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
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
import { fluxIllustration } from '@/lib/studio/generation/sources'
import { photoToPatternData } from '@/lib/studio/photo-to-pattern'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'

const OUT = resolve(process.cwd(), '../../.loom-scratch/needlework/ai-pilot')

/** w×h (stitch count) + colours drive complexity; style drives the feel. SIZE +
 *  ASPECT are matched to the design — Caterpillar sizes range from ~205×118 wide
 *  scenes to ~128×160 portrait designs to small square characters. Bigger =
 *  more stitches = finer detail can resolve (the fix for icon-fill confetti). */
export interface Brief { slug: string; w: number; h: number; colours: number; style: string; prompt: string }
// NORTH STAR pilot v2 (NORTH_STAR.md). Two fixes from review: (1) match SIZE+ASPECT
// to the design — busy icon-fill / scenes go BIG so icons resolve; (2) render with a
// saturation boost so floss reads vivid, not washed out.
const STYLE = {
  bright: 'bright cheerful modern cross-stitch illustration, bold saturated multicolour palette, crisp clean shapes, high contrast, generous clean white background',
  iconfill: 'a bold clear silhouette filled with LARGE clearly-separated charming icons, each icon distinct recognisable and generously spaced (NOT tiny, NOT confetti), bright saturated palette, crisp readable shapes, clean white background (Caterpillar Cross Stitch style)',
  cute: 'adorable storybook character, soft but bright saturated palette, sweet expressive face, bold clear outline, lots of personality, clean white background',
  pastel: 'pretty storybook illustration, clear bold outlines with soft fills, cheerful but refined palette, crisp detail, clean white background',
  botanical: 'delicate elegant botanical illustration, sophisticated muted-yet-rich palette, airy negative space, fine clear detail, clean white background',
  showpiece: 'richly detailed charming storybook scene packed with little story details, bold clear outlines, warm saturated layered palette, full coverage',
}
const B = (slug: string, w: number, h: number, colours: number, style: keyof typeof STYLE, subject: string): Brief =>
  ({ slug, w, h, colours, style, prompt: `${subject}, ${STYLE[style]}, clean composition, centred` })

const BRIEFS: Brief[] = [
  // icon-fill (Caterpillar core) — BIG so icons resolve, not confetti
  B('ns-catfill', 165, 200, 38, 'iconfill', 'a bold sitting cat silhouette filled with large clearly-separated colourful motifs — balls of yarn, fish, paw prints, mice, hearts and flowers, each shape big and distinct'),
  B('ns-countymap', 170, 205, 40, 'iconfill', 'a clear map silhouette of Great Britain filled with large clearly-separated icons — sheep, cottages, oak trees, hedgehogs, teapots, lighthouses and church spires, each icon big and recognisable'),
  // bright florals / seasonal — medium square
  B('ns-bouquet', 150, 150, 30, 'bright', 'a cheerful round posy of mixed wildflowers and daisies tied with a ribbon'),
  B('ns-halloween-cat', 140, 140, 22, 'bright', 'a cute black cat in a witch hat beside a smiling jack-o-lantern with stars and a crescent moon'),
  // cute single character — small square, bold
  B('ns-hedgehog', 115, 115, 16, 'cute', 'a tiny round hedgehog holding a single flower, sitting among a few toadstools'),
  B('ns-mouse-umbrella', 120, 130, 20, 'cute', 'a sweet plump little mouse sheltering under one big blue flower held like an umbrella, a few rain drops'),
  // elegant botanical — WIDE band (hoop tier)
  B('ns-wildflower-strip', 190, 120, 26, 'botanical', 'a low wide meadow band of delicate wildflowers — lavender, poppies, buttercups and grasses growing up from the bottom'),
  // pastel architectural — WIDE row (Christmas-Wonderland format)
  B('ns-shop-row', 200, 115, 30, 'pastel', 'a pretty row of three little terraced shopfronts with striped awnings, window boxes and flowers, on a cobbled street'),
  // dense showpiece — BIG square, STRESS TEST full coverage
  B('ns-cat-bookshop', 200, 200, 48, 'showpiece', 'a charming cat lovers bookshop storefront, arched windows full of colourful books, sleeping cats on the shelves, roses climbing over the OPEN sign, a little bench and potted flowers by the blue door'),
]

type FluxSize = 'square_hd' | 'landscape_4_3' | 'portrait_4_3'
function imageSizeFor(w: number, h: number): FluxSize {
  if (w / h >= 1.25) return 'landscape_4_3'
  if (h / w >= 1.25) return 'portrait_4_3'
  return 'square_hd'
}

async function fluxCached(slug: string, prompt: string, size: FluxSize, regen: boolean): Promise<Buffer> {
  mkdirSync(OUT, { recursive: true })
  const p = resolve(OUT, `${slug}.flux.png`)
  if (regen && existsSync(p)) rmSync(p)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(prompt, { imageSize: size })
  writeFileSync(p, src.buffer)
  return src.buffer
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  const args = process.argv.slice(2)
  const regen = args.includes('--regen')
  const want = args.filter((a) => !a.startsWith('--'))
  const briefs = want.length ? BRIEFS.filter((b) => want.includes(b.slug)) : BRIEFS

  for (const b of briefs) {
    const img = await fluxCached(b.slug, b.prompt, imageSizeFor(b.w, b.h), regen)
    const { data } = await photoToPatternData(img, { width: b.w, height: b.h, colours: b.colours, fabricCount: 14, brand: 'DMC', confettiMin: 'medium', backgroundRemoval: false })
    const bb = stitchedBoundingBox(data)
    const mg = 2
    const region = bb ? { x: Math.max(0, bb.minX - mg), y: Math.max(0, bb.minY - mg), width: Math.min(data.grid.width, bb.maxX + 1 + mg) - Math.max(0, bb.minX - mg), height: Math.min(data.grid.height, bb.maxY + 1 + mg) - Math.max(0, bb.minY - mg) } : undefined
    const rw = region?.width ?? data.grid.width
    const cellPx = rw <= 70 ? 26 : rw <= 130 ? 16 : 10
    // saturation 1.3 — render floss vivid, not washed out (see render fix).
    const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cellPx * 0.8), region, saturation: 1.3 })
    await sharp(Buffer.from(svg)).resize(1000, 1000, { fit: 'inside' }).png().toFile(resolve(OUT, `${b.slug}.render.png`))
    console.log(`[${b.slug}] ${b.style} · ${data.grid.width}×${data.grid.height} · ${data.palette.length} colours -> ${b.slug}.render.png`)
  }
}
main().catch((e) => { console.error('[ai-pilot] FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })

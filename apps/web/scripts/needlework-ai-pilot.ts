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

/** size + colours drive complexity; style drives the whole feel — a varied SET. */
export interface Brief { slug: string; size: number; colours: number; style: string; prompt: string }
const STYLE = {
  childlike: 'childlike crayon style, bright primary colours, simple chunky shapes',
  cheeky: 'fun cheeky cartoon, bold outlines, bright colours, lots of personality',
  cheery: 'cheery bright modern illustration, warm happy palette',
  vintage: 'vintage antique botanical / storybook engraving style, soft muted old-fashioned palette',
  detailed: 'richly detailed painterly illustration, deep layered palette',
  modern: 'modern mid-century minimalist, bold flat shapes, limited palette',
  gothic: 'whimsical gothic illustration, deep purple black and gold, moody charming',
  retro: '1970s-80s retro style, warm retro palette, fun bold shapes',
}
const B = (slug: string, size: number, colours: number, style: keyof typeof STYLE, subject: string): Brief =>
  ({ slug, size, colours, style, prompt: `${subject}, ${STYLE[style]}, clean composition, full subject centred in frame, white background` })

const BRIEFS: Brief[] = [
  B('g-raincloud', 100, 14, 'childlike', 'a happy smiling rain cloud raining big bold colourful raindrops with a clear bright rainbow underneath'),
  B('g-peekcat', 108, 15, 'cheeky', 'a cheeky black cat peeking over a wooden fence with big wide eyes and a swishing tail'),
  B('g-pancakes', 140, 26, 'cheery', 'a tall stack of fluffy pancakes with melting butter, dripping syrup, berries and a mint sprig'),
  B('g-foxglove', 150, 28, 'vintage', 'a vintage botanical study of a single tall foxglove stem with bees, leaves and a handwritten label'),
  B('g-bookshop', 186, 44, 'detailed', 'a cosy little bookshop interior, floor-to-ceiling shelves of colourful books, a rolling ladder, a sleeping cat and a reading armchair under a warm lamp'),
  B('g-stag', 178, 40, 'detailed', 'a majestic stag with golden autumn antlers standing in a misty forest at dawn, leaves falling'),
  B('g-mountains', 128, 9, 'modern', 'a mid-century minimalist mountain range with a setting sun and a winding river'),
  B('g-ghost', 146, 20, 'gothic', 'a friendly little round ghost holding a glowing jack-o-lantern under a big crescent moon with bats and stars'),
  B('g-rollerskate', 112, 16, 'retro', 'a single retro roller skate with rainbow laces, stars and a lightning bolt'),
]

async function fluxCached(slug: string, prompt: string, regen: boolean): Promise<Buffer> {
  mkdirSync(OUT, { recursive: true })
  const p = resolve(OUT, `${slug}.flux.png`)
  if (regen && existsSync(p)) rmSync(p)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(prompt, { imageSize: 'square_hd' })
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
    const img = await fluxCached(b.slug, b.prompt, regen)
    const { data } = await photoToPatternData(img, { width: b.size, height: b.size, colours: b.colours, fabricCount: 14, brand: 'DMC', confettiMin: 'medium', backgroundRemoval: false })
    const bb = stitchedBoundingBox(data)
    const mg = 2
    const region = bb ? { x: Math.max(0, bb.minX - mg), y: Math.max(0, bb.minY - mg), width: Math.min(data.grid.width, bb.maxX + 1 + mg) - Math.max(0, bb.minX - mg), height: Math.min(data.grid.height, bb.maxY + 1 + mg) - Math.max(0, bb.minY - mg) } : undefined
    const rw = region?.width ?? data.grid.width
    const cellPx = rw <= 70 ? 26 : rw <= 130 ? 16 : 10
    const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cellPx * 0.8), region })
    await sharp(Buffer.from(svg)).resize(900, 900, { fit: 'inside' }).png().toFile(resolve(OUT, `${b.slug}.render.png`))
    console.log(`[${b.slug}] ${b.style} · ${data.grid.width}×${data.grid.height} · ${data.palette.length} colours -> ${b.slug}.render.png`)
  }
}
main().catch((e) => { console.error('[ai-pilot] FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })

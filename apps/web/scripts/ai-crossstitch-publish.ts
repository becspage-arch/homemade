/**
 * AI-DESIGN → cross-stitch pattern, published. The blue-sky system in one script:
 * Flux designs an original illustration -> photoToPatternData makes a floss chart
 * -> upsert a PUBLIC Pattern + render/persist the beauty thumbnail + search-sync.
 *
 * The Flux art is cached per slug under .loom-scratch/needlework/ai-pilot so a
 * re-run never re-generates (and so a design reviewed + approved is the one that
 * ships). Pass slugs to publish a subset; no args = all in DESIGNS.
 *
 *   cd apps/web && npx tsx scripts/ai-crossstitch-publish.ts [slug ...]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    /* env from shell */
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? 'C:/Users/Rebecca/Projects/code/homemade/.env.credentials')

import sharp from 'sharp'
import { prisma, computePatternMetrics, Visibility, r2Upload, ensureHouseDesigner } from '@homemade/db'
import { fluxIllustration } from '../src/lib/studio/generation/sources'
import { photoToPatternData } from '../src/lib/studio/photo-to-pattern'
import { renderPatternSvgString } from '../src/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '../src/components/studio/chart/render-helpers'

const CACHE = resolve(process.cwd(), '../../.loom-scratch/needlework/ai-pilot')
const TARGET_W = 960
const TARGET_H = 720
const BG = { r: 245, g: 240, b: 232 }

interface Design {
  slug: string
  name: string
  description: string
  prompt: string
  sub: string
  subName: string
  size: number
  colours: number
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

// The gate-passed varied set (size × complexity × style). Flux cached per slug.
const DESIGNS: Design[] = [
  { slug: 'happy-rain-cloud', name: 'Happy Rain Cloud', sub: 'whimsical', subName: 'Whimsical', size: 100, colours: 14, difficulty: 'BEGINNER',
    description: 'A smiling rain cloud showering bold colourful raindrops over a bright rainbow.', prompt: '' },
  { slug: 'peeking-cat', name: 'Peeking Cat', sub: 'animals', subName: 'Animals', size: 108, colours: 15, difficulty: 'BEGINNER',
    description: 'A cheeky black cat peeking over a wooden fence with big wide eyes.', prompt: '' },
  { slug: 'retro-roller-skate', name: 'Retro Roller Skate', sub: 'retro', subName: 'Retro', size: 112, colours: 16, difficulty: 'BEGINNER',
    description: 'A pink retro roller skate with rainbow laces, stars and a lightning bolt.', prompt: '' },
  { slug: 'mountain-sunset', name: 'Mountain Sunset', sub: 'landscapes', subName: 'Landscapes & Seascapes', size: 128, colours: 9, difficulty: 'BEGINNER',
    description: 'A mid-century minimalist mountain range with a setting sun and a winding river.', prompt: '' },
  { slug: 'pancake-stack', name: 'Pancake Stack', sub: 'food', subName: 'Food & Drink', size: 140, colours: 26, difficulty: 'INTERMEDIATE',
    description: 'A tall stack of fluffy pancakes with butter, dripping syrup and berries.', prompt: '' },
  { slug: 'little-ghost', name: 'Little Ghost', sub: 'halloween', subName: 'Halloween', size: 146, colours: 20, difficulty: 'INTERMEDIATE',
    description: 'A friendly little ghost holding a glowing jack-o-lantern under a crescent moon.', prompt: '' },
  { slug: 'vintage-foxglove', name: 'Vintage Foxglove', sub: 'floral', subName: 'Floral & Botanical', size: 150, colours: 28, difficulty: 'INTERMEDIATE',
    description: 'A vintage botanical study of a tall foxglove stem with bees and leaves.', prompt: '' },
  { slug: 'autumn-stag', name: 'Autumn Stag', sub: 'animals', subName: 'Animals', size: 178, colours: 40, difficulty: 'ADVANCED',
    description: 'A majestic stag with golden autumn antlers in a misty forest at dawn.', prompt: '' },
  { slug: 'little-bookshop', name: 'The Little Bookshop', sub: 'scenes', subName: 'Scenes', size: 186, colours: 44, difficulty: 'ADVANCED',
    description: 'A cosy little bookshop interior with shelves of books, a ladder, a cat and a reading nook.', prompt: '' },
]

async function fluxCached(slug: string, prompt: string): Promise<Buffer> {
  mkdirSync(CACHE, { recursive: true })
  const p = resolve(CACHE, `${slug}.flux.png`)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(prompt, { imageSize: 'square_hd' })
  writeFileSync(p, src.buffer)
  return src.buffer
}

async function main(): Promise<void> {
  const want = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const designs = want.length ? DESIGNS.filter((d) => want.includes(d.slug)) : DESIGNS

  const cat = await prisma.category.findUnique({ where: { slug: 'cross-stitch' }, select: { id: true } })
  if (!cat) throw new Error('no cross-stitch category')
  const designer = await ensureHouseDesigner()
  const { buildPatternDoc } = await import('@homemade/db/search-docs')
  const { syncPatternDoc } = await import('@homemade/search')

  for (const d of designs) {
    const img = await fluxCached(d.slug, d.prompt)
    const { data } = await photoToPatternData(img, {
      width: d.size, height: d.size, colours: d.colours, fabricCount: 14, brand: 'DMC', confettiMin: 'medium', backgroundRemoval: false,
    })
    const m = computePatternMetrics(data)
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: cat.id, slug: d.sub } },
      create: { categoryId: cat.id, slug: d.sub, name: d.subName, order: 50 },
      update: {},
      select: { id: true },
    })
    const common = {
      name: d.name, description: d.description, data: data as unknown as object,
      designerId: designer.id, subCategoryId: sub.id, difficulty: d.difficulty,
      visibility: (process.argv.includes('--public') ? Visibility.PUBLIC : Visibility.UNLISTED), publishedAt: new Date(),
      widthCells: m.widthCells, heightCells: m.heightCells, colourCount: m.colourCount, totalStitches: m.totalStitches,
      hasBackstitch: m.hasBackstitch, hasFrenchKnots: m.hasFrenchKnots, hasBeads: m.hasBeads, hasQuarterStitches: m.hasQuarterStitches,
      fabricCountSuggested: data.fabric.count,
    }
    const p = await prisma.pattern.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, type: 'CROSS_STITCH', ...common },
      update: common,
      select: { id: true },
    })
    // beauty thumbnail -> R2 -> Media -> link
    const bbox = stitchedBoundingBox(data)
    const mg = 2
    const region = bbox ? {
      x: Math.max(0, bbox.minX - mg), y: Math.max(0, bbox.minY - mg),
      width: Math.min(data.grid.width, bbox.maxX + 1 + mg) - Math.max(0, bbox.minX - mg),
      height: Math.min(data.grid.height, bbox.maxY + 1 + mg) - Math.max(0, bbox.minY - mg),
    } : undefined
    const regionW = region?.width ?? data.grid.width
    const cellPx = regionW <= 60 ? 30 : regionW <= 120 ? 18 : 12
    const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cellPx * 0.8), region })
    const png = await sharp(Buffer.from(svg)).resize(TARGET_W, TARGET_H, { fit: 'contain', background: BG }).png({ quality: 88 }).toBuffer()
    const { key, publicUrl } = await r2Upload(png, 'image/png', { prefix: 'pattern-thumbnails', filename: `${p.id}.png` })
    const media = await prisma.media.create({ data: { type: 'ILLUSTRATION', mimeType: 'image/png', r2Key: key, width: TARGET_W, height: TARGET_H, bytes: png.byteLength, status: 'READY', source: 'original', alt: `${d.name} chart` }, select: { id: true } })
    await prisma.pattern.update({ where: { id: p.id }, data: { thumbnailMediaId: media.id } })
    const doc = await buildPatternDoc(p.id)
    if (doc) await syncPatternDoc(doc)
    console.log(`[publish] ${d.slug} -> ${m.widthCells}x${m.heightCells} ${m.colourCount}col · thumb ${publicUrl}`)
    console.log(`[publish] live at /cross-stitch/patterns/${d.slug}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error('[publish] FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })

/**
 * Publish gate-passed volume gems to the live cross-stitch catalogue. SELF-CONTAINED
 * so it runs from the MAIN checkout (where @homemade/db resolves) with the stock
 * renderer: the vivid colour fix is achieved without the render-option by
 *   (1) pre-saturating the source art per lane (srcSat) before quantising,
 *   (2) rendering on bright ivory aida (fabric override),
 *   (3) a post-process saturation on the final PNG (≈ the in-render boost).
 *
 * Input: approved-full.json = [{ slug, name, sub, subName, w, h, colours, style,
 * srcSat, batch, difficulty? }] (produced by scripts/xs-enrich.ts from the worktree).
 * Flux art read from $XS_VOL_DIR/<batch>/<slug>.flux.png.
 *
 *   XS_VOL_DIR=<abs>/.loom-scratch/needlework/volume \
 *   npx tsx scripts/xs-volume-publish.ts <approved-full.json>
 */
import { readFileSync } from 'node:fs'
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
import { prisma, computePatternMetrics, Visibility, r2Upload, ensureHouseDesigner } from '@homemade/db'
import { photoToPatternData } from '@/lib/studio/photo-to-pattern'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'

const VOL = process.env.XS_VOL_DIR ?? resolve(process.cwd(), '../../.loom-scratch/needlework/volume')
const FABRIC = '#FCFAF6'
const POST_SAT = 1.3
const TARGET = 1000

interface Approved {
  slug: string; name: string; sub: string; subName: string
  w: number; h: number; colours: number; style: string; srcSat: number; postSat?: number; batch: string
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'; description?: string
}
function difficultyFor(colours: number): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  return colours <= 18 ? 'BEGINNER' : colours <= 30 ? 'INTERMEDIATE' : 'ADVANCED'
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
async function r2UploadRetry(png: Buffer, opts: { prefix: string; filename: string }): Promise<{ key: string; publicUrl: string }> {
  let lastErr: unknown
  for (let i = 0; i < 4; i++) {
    try { return await r2Upload(png, 'image/png', opts) }
    catch (e) { lastErr = e; await sleep(1500 * (i + 1)) }
  }
  throw lastErr
}

async function main(): Promise<void> {
  const file = process.argv[2]
  if (!file) throw new Error('usage: xs-volume-publish.ts <approved-full.json>')
  const approved: Approved[] = JSON.parse(readFileSync(resolve(file), 'utf8'))

  const designer = await ensureHouseDesigner()
  const cat = await prisma.category.findUnique({ where: { slug: 'cross-stitch' }, select: { id: true } })
  if (!cat) throw new Error('no cross-stitch category')
  const { buildPatternDoc } = await import('@homemade/db/search-docs')
  const { syncPatternDoc } = await import('@homemade/search')

  let done = 0
  const failed: string[] = []
  for (const a of approved) {
   try {
    // Dense 100+ colour briefs (>96) are sourced from Flux 1.1 Pro (.flux-pro.png) and
    // converted with the floss ceiling lifted + full DMC range — mirror the gen script's
    // dense branch EXACTLY so the published thumbnail matches the gated render.
    const dense = a.colours > 96
    const fluxPath = resolve(VOL, a.batch, `${a.slug}.${dense ? 'flux-pro' : 'flux'}.png`)
    const raw = readFileSync(fluxPath)
    const img = await sharp(raw).modulate({ saturation: a.srcSat }).png().toBuffer()
    const { data } = await photoToPatternData(img, { width: a.w, height: a.h, colours: a.colours, fabricCount: 14, brand: 'DMC', confettiMin: dense ? 'high' : 'medium', backgroundRemoval: false, ...(dense ? { maxColours: a.colours, flossRange: 'full' as const } : {}) })
    data.fabric.colourRgb = FABRIC
    const m = computePatternMetrics(data)

    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: cat.id, slug: a.sub } },
      create: { categoryId: cat.id, slug: a.sub, name: a.subName, order: 50 },
      update: {}, select: { id: true },
    })
    const description = a.description ?? `${a.name}, an original Homemade cross-stitch design.`
    const common = {
      name: a.name, description, data: data as unknown as object,
      designerId: designer.id, subCategoryId: sub.id, difficulty: a.difficulty ?? difficultyFor(a.colours),
      visibility: Visibility.PUBLIC, publishedAt: new Date(),
      widthCells: m.widthCells, heightCells: m.heightCells, colourCount: m.colourCount, totalStitches: m.totalStitches,
      hasBackstitch: m.hasBackstitch, hasFrenchKnots: m.hasFrenchKnots, hasBeads: m.hasBeads, hasQuarterStitches: m.hasQuarterStitches,
      fabricCountSuggested: data.fabric.count,
    }
    const p = await prisma.pattern.upsert({
      where: { slug: a.slug },
      create: { slug: a.slug, type: 'CROSS_STITCH', ...common },
      update: common, select: { id: true },
    })

    const bbox = stitchedBoundingBox(data)
    const mg = 2
    const region = bbox ? {
      x: Math.max(0, bbox.minX - mg), y: Math.max(0, bbox.minY - mg),
      width: Math.min(data.grid.width, bbox.maxX + 1 + mg) - Math.max(0, bbox.minX - mg),
      height: Math.min(data.grid.height, bbox.maxY + 1 + mg) - Math.max(0, bbox.minY - mg),
    } : undefined
    const rw = region?.width ?? data.grid.width
    const cellPx = rw <= 70 ? 26 : rw <= 130 ? 16 : 10
    const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cellPx * 0.8), region })
    const png = await sharp(Buffer.from(svg)).modulate({ saturation: a.postSat ?? POST_SAT }).resize(TARGET, TARGET, { fit: 'inside' }).png({ quality: 90 }).toBuffer()
    const meta = await sharp(png).metadata()
    const { key, publicUrl } = await r2UploadRetry(png, { prefix: 'pattern-thumbnails', filename: `${p.id}.png` })
    const media = await prisma.media.create({ data: { type: 'ILLUSTRATION', mimeType: 'image/png', r2Key: key, width: meta.width ?? TARGET, height: meta.height ?? TARGET, bytes: png.byteLength, status: 'READY', source: 'original', alt: `${a.name} cross-stitch chart` }, select: { id: true } })
    await prisma.pattern.update({ where: { id: p.id }, data: { thumbnailMediaId: media.id } })
    const doc = await buildPatternDoc(p.id)
    if (doc) await syncPatternDoc(doc)
    done++
    console.log(`[live] ${a.slug} -> ${m.widthCells}x${m.heightCells} ${m.colourCount}col · ${a.sub} · ${publicUrl}`)
   } catch (e) {
    failed.push(a.slug)
    console.log(`[FAIL] ${a.slug}: ${e instanceof Error ? e.message : String(e)}`)
   }
  }
  console.log(`published ${done}/${approved.length}${failed.length ? ` · failed: ${failed.join(', ')}` : ''}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error('[publish] FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })

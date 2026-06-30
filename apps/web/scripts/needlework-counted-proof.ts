/**
 * Counted-needlework PROOF (orchestrator-sanctioned small proof, not bulk).
 *
 * Demonstrates the generation -> Tier-1 render -> publish path for COUNTED
 * needlework: blackwork (geometric backstitch line-work) and needlepoint
 * (Bargello filled cells). Generators here are the craft-owned "design" layer;
 * the existing cross-stitch engine (Pattern.data + persistPatternThumbnail) is
 * the shared render layer (the loom's Tier 1). Publishes a handful of real
 * PUBLIC needlework patterns under house-designer authorship + born-tags them.
 *
 * Run: pnpm --filter "@homemade/web" exec tsx scripts/needlework-counted-proof.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 8; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

interface Seg { x1: number; y1: number; x2: number; y2: number }

// ── Blackwork: geometric backstitch tessellations ────────────────────────────
const TILE = 4
const DIAMOND: Seg[] = [
  { x1: 2, y1: 0, x2: 4, y2: 2 }, { x1: 4, y1: 2, x2: 2, y2: 4 },
  { x1: 2, y1: 4, x2: 0, y2: 2 }, { x1: 0, y1: 2, x2: 2, y2: 0 },
]
const CROSSED_BOX: Seg[] = [
  { x1: 0, y1: 0, x2: 4, y2: 0 }, { x1: 4, y1: 0, x2: 4, y2: 4 },
  { x1: 4, y1: 4, x2: 0, y2: 4 }, { x1: 0, y1: 4, x2: 0, y2: 0 },
  { x1: 2, y1: 0, x2: 2, y2: 4 }, { x1: 0, y1: 2, x2: 4, y2: 2 },
]
const STAR: Seg[] = [
  // box outline + inscribed diamond = eight-point star when tiled
  { x1: 0, y1: 0, x2: 4, y2: 0 }, { x1: 4, y1: 0, x2: 4, y2: 4 },
  { x1: 4, y1: 4, x2: 0, y2: 4 }, { x1: 0, y1: 4, x2: 0, y2: 0 },
  ...DIAMOND,
]

function tileFill(x0: number, y0: number, w: number, h: number, tile: Seg[]): Seg[] {
  const out: Seg[] = []
  for (let ty = y0; ty < y0 + h; ty += TILE) {
    for (let tx = x0; tx < x0 + w; tx += TILE) {
      for (const s of tile) {
        out.push({ x1: s.x1 + tx, y1: s.y1 + ty, x2: s.x2 + tx, y2: s.y2 + ty })
      }
    }
  }
  return out
}

function frame(x0: number, y0: number, w: number, h: number): Seg[] {
  const rect = (a: number, b: number, ww: number, hh: number): Seg[] => [
    { x1: a, y1: b, x2: a + ww, y2: b }, { x1: a + ww, y1: b, x2: a + ww, y2: b + hh },
    { x1: a + ww, y1: b + hh, x2: a, y2: b + hh }, { x1: a, y1: b + hh, x2: a, y2: b },
  ]
  return [...rect(x0, y0, w, h), ...rect(x0 + 2, y0 + 2, w - 4, h - 4)]
}

function blackworkPattern(tile: Seg[]): object {
  const N = 52
  const fill = tileFill(4, 4, 44, 44, tile)
  const border = frame(2, 2, 48, 48)
  const backstitch = [...border, ...fill].map((s) => ({ ...s, s: 'A' }))
  return {
    schemaVersion: 1, type: 'CROSS_STITCH',
    grid: { width: N, height: N, cells: [], backstitch, frenchKnots: [], beads: [] },
    palette: [{ symbol: 'A', brand: 'DMC', code: '310', name: 'Black', rgb: '#101010', strandsFullCross: 2, strandsBackstitch: 2 }],
    fabric: { count: 28, colourRgb: '#F5EBD8', type: 'Evenweave' },
    metadata: { designer: 'Homemade', year: 2026 },
  }
}

// ── Needlepoint: Bargello flame (filled cells, graded colour bands) ──────────
function bargelloPattern(): object {
  const W = 48, H = 48
  const palette = [
    { symbol: 'a', rgb: '#E7EFE3', code: '524', name: 'Pale sage' },
    { symbol: 'b', rgb: '#BcD3B6', code: '523', name: 'Sage' },
    { symbol: 'c', rgb: '#8FB58A', code: '3053', name: 'Green grey' },
    { symbol: 'd', rgb: '#5E9078', code: '3815', name: 'Celadon' },
    { symbol: 'e', rgb: '#3C6E60', code: '3808', name: 'Teal' },
    { symbol: 'f', rgb: '#264C46', code: '3809', name: 'Deep teal' },
  ].map((p) => ({ ...p, brand: 'DMC' as const, strandsFullCross: 2, strandsBackstitch: 1 }))
  const tri = (x: number) => { const p = 16, a = 7; const t = ((x % p) + p) % p; return t < p / 2 ? (t / (p / 2)) * a : (1 - (t - p / 2) / (p / 2)) * a }
  const cells: { x: number; y: number; s: string }[] = []
  for (let x = 0; x < W; x++) {
    const base = tri(x)
    for (let y = 0; y < H; y++) {
      const band = Math.floor(((y - base) % (palette.length * 2) + palette.length * 2) / 2) % palette.length
      cells.push({ x, y, s: palette[band]!.symbol })
    }
  }
  return {
    schemaVersion: 1, type: 'CROSS_STITCH',
    grid: { width: W, height: H, cells, backstitch: [], frenchKnots: [], beads: [] },
    palette,
    fabric: { count: 18, colourRgb: '#F5EBD8', type: 'Evenweave' },
    metadata: { designer: 'Homemade', year: 2026 },
  }
}

const PATTERNS = [
  { slug: 'blackwork-diamond-lattice', name: 'Diamond lattice blackwork', sub: 'blackwork', difficulty: 'BEGINNER', tags: ['samplers', 'vintage', 'geometric'], data: blackworkPattern(DIAMOND) },
  { slug: 'blackwork-crossed-boxes', name: 'Crossed boxes blackwork', sub: 'blackwork', difficulty: 'BEGINNER', tags: ['samplers', 'vintage', 'geometric'], data: blackworkPattern(CROSSED_BOX) },
  { slug: 'blackwork-star-tile', name: 'Star tile blackwork', sub: 'blackwork', difficulty: 'INTERMEDIATE', tags: ['samplers', 'vintage', 'geometric'], data: blackworkPattern(STAR) },
  { slug: 'needlepoint-sage-bargello', name: 'Sage Bargello flame', sub: 'needlepoint', difficulty: 'INTERMEDIATE', tags: ['samplers', 'geometric', 'cottagecore'], data: bargelloPattern() },
]

async function main(): Promise<void> {
  const { prisma, parsePatternData, computePatternMetrics, Visibility, setContentTags, r2Upload, ensureHouseDesigner } = await import('@homemade/db')
  // Render + sync inline (mirrors persistPatternThumbnail) to avoid the
  // 'server-only' guard in pattern-thumbnail.ts / search-sync.ts.
  const { buildPatternDoc } = await import('@homemade/db/search-docs')
  const { syncPatternDoc } = await import('@homemade/search')
  const { renderPatternSvgString } = await import('../src/components/studio/chart/render-svg-string.js')
  const { stitchedBoundingBox } = await import('../src/components/studio/chart/render-helpers.js')
  const sharp = (await import('sharp')).default
  const TARGET_W = 960, TARGET_H = 720, BG = { r: 245, g: 240, b: 232 }

  const cat = await prisma.category.findUnique({ where: { slug: 'needlework' }, select: { id: true } })
  if (!cat) { console.error('no needlework category'); process.exit(1) }

  const designer = await ensureHouseDesigner()

  for (const def of PATTERNS) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: cat.id, slug: def.sub } },
      create: { categoryId: cat.id, slug: def.sub, name: def.sub === 'blackwork' ? 'Blackwork' : 'Needlepoint', order: 50 },
      update: {},
      select: { id: true },
    })
    const data = parsePatternData(def.data)
    const m = computePatternMetrics(data)
    const p = await prisma.pattern.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug, type: 'CROSS_STITCH', name: def.name,
        description: `A counted ${def.sub} pattern worked on evenweave.`,
        data: data as unknown as object, designerId: designer.id, subCategoryId: sub.id,
        difficulty: def.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        visibility: Visibility.PUBLIC, publishedAt: new Date(),
        widthCells: m.widthCells, heightCells: m.heightCells, colourCount: m.colourCount,
        totalStitches: m.totalStitches, hasBackstitch: m.hasBackstitch, hasFrenchKnots: m.hasFrenchKnots,
        hasBeads: m.hasBeads, hasQuarterStitches: m.hasQuarterStitches, fabricCountSuggested: data.fabric.count,
      },
      update: {
        name: def.name, data: data as unknown as object, subCategoryId: sub.id, designerId: designer.id,
        visibility: Visibility.PUBLIC, publishedAt: new Date(),
        widthCells: m.widthCells, heightCells: m.heightCells, colourCount: m.colourCount,
        totalStitches: m.totalStitches, hasBackstitch: m.hasBackstitch, hasFrenchKnots: m.hasFrenchKnots,
        hasBeads: m.hasBeads, hasQuarterStitches: m.hasQuarterStitches, fabricCountSuggested: data.fabric.count,
      },
      select: { id: true },
    })
    // Render the 960x720 beauty thumbnail from the data + upload + link.
    const bbox = stitchedBoundingBox(data)
    const margin = 2
    const region = bbox ? {
      x: Math.max(0, bbox.minX - margin),
      y: Math.max(0, bbox.minY - margin),
      width: Math.min(data.grid.width, bbox.maxX + 1 + margin) - Math.max(0, bbox.minX - margin),
      height: Math.min(data.grid.height, bbox.maxY + 1 + margin) - Math.max(0, bbox.minY - margin),
    } : undefined
    const regionW = region?.width ?? data.grid.width
    const cellPx = regionW <= 60 ? 30 : regionW <= 120 ? 18 : 12
    const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cellPx * 0.8), region })
    const png = await sharp(Buffer.from(svg)).resize(TARGET_W, TARGET_H, { fit: 'contain', background: BG }).png({ quality: 88 }).toBuffer()
    const { key, publicUrl } = await r2Upload(png, 'image/png', { prefix: 'pattern-thumbnails', filename: `${p.id}.png` })
    const media = await prisma.media.create({ data: { type: 'ILLUSTRATION', mimeType: 'image/png', r2Key: key, width: TARGET_W, height: TARGET_H, bytes: png.byteLength, status: 'READY', source: 'original', alt: `${def.name} chart` }, select: { id: true } })
    await prisma.pattern.update({ where: { id: p.id }, data: { thumbnailMediaId: media.id } })

    await setContentTags({ type: 'CROSS_STITCH_PATTERN', id: p.id }, def.tags, 'AUTHORED')
    const doc = await buildPatternDoc(p.id)
    if (doc) await syncPatternDoc(doc)
    console.log(`${def.slug.padEnd(30)} cells=${String(m.totalStitches).padStart(4)} colours=${m.colourCount}  ${publicUrl}`)
  }
  console.log('proof done.')
  await prisma.$disconnect()
}

main().catch((e) => { console.error('proof failed:', e); process.exit(1) })

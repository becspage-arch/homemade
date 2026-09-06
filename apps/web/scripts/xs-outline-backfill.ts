/**
 * xs-outline-backfill — give the catalogue its outlines.
 *
 * Every one of the 1,0xx public cross-stitch charts is a flat block of whole
 * crosses. The pattern schema has carried a `backstitch` layer and a
 * `frenchKnots` layer since the first day, the Studio editor draws both and has
 * tools for both, and the converter has never emitted a single segment or knot.
 * Next to a Vihola mouse or a Caterpillar deer — both of which outline the
 * character and dot its eye — ours look like the same drawing with the pencil
 * work rubbed out.
 *
 * This script applies the rule in `lib/studio/generation/bulk/outline.ts` to
 * every house cross-stitch Pattern: the silhouette and the strong internal
 * colour boundaries become back-stitch, and a lone dark stitch marooned in a
 * face becomes a French knot. Delft and blackwork are line work already and are
 * excluded; so is the dense showpiece tier, where a line would fight the
 * picture; so is any chart that already carries back-stitch.
 *
 * The hero IS the exact chart, so a row is only ever changed as a whole:
 *
 *   data            back-stitch segments + knots added, outline floss appended
 *                   to the palette when the chart had nothing dark of its own
 *   metrics         computePatternMetrics + stitchability, recomputed
 *   thumbnail       re-rendered through the SAME renderer the publisher uses,
 *                   uploaded to R2 as a NEW object, Media row created, and
 *                   thumbnailMediaId repointed (the old Media row is KEPT)
 *   fingerprints    thumbnailSha256 / imageHash64 / imageHash256 /
 *                   chartFingerprint recomputed off the shipped artifact
 *   outlineApplied  the reversible record: what went on, why, the previous
 *                   thumbnail media id and the previous data hash
 *   search          the pattern doc re-synced
 *
 * Idempotent and resumable: a row carrying `outlineApplied` is skipped, and the
 * derivation is a no-op on a chart that already has back-stitch. House rows
 * only — a customer's own saved chart is their work, not ours to draw on.
 *
 *   cd apps/web && HOMEMADE_ENV_FILE=../../.env.credentials \
 *     pnpm exec tsx scripts/xs-outline-backfill.ts \
 *     [--sheets] [--sample N] [--name <sheet-prefix>] [--cache <thumb-dir>] \
 *     [--out <dir>] [--limit N] [--only <slug,slug>] [--concurrency N] [--apply]
 *
 * Without --apply it reports and changes nothing. --sheets writes before/after
 * contact sheets (whole chart, and a zoom into the middle where the line work
 * can actually be judged) to <out>/sheets and exits; LOOK at them before
 * applying.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import {
  prisma,
  parsePatternData,
  computePatternMetrics,
  r2Upload,
  type PatternData,
} from '@homemade/db'
import { embellishChart, outlineModeFor, type OutlineMode } from '@/lib/studio/generation/bulk/outline'
import { laneForSize } from '@/lib/studio/generation/bulk/bare-fabric'
import { renderBeautyThumbnail, THUMB_TARGET } from '@/lib/studio/generation/bulk/beauty-thumbnail'
import { POST_SAT } from '@/lib/studio/generation/bulk/cross-stitch-style'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'
import { chartFingerprint, imageHash, sha256Hex } from '@/lib/studio/generation/bulk/similarity'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const APPLY = process.argv.includes('--apply')
const SHEETS = process.argv.includes('--sheets')
const SAMPLE = Number(arg('sample')) || 24
const LIMIT = Number(arg('limit')) || 0
const OUT_DIR = arg('out') ?? resolve(process.cwd(), '../../scratchpad/xs-outline')
const CACHE_DIR = arg('cache')
const ONLY = (arg('only') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
/** Rows in flight while applying. The hero render is the expensive part. */
const CONCURRENCY = Math.max(1, Number(arg('concurrency')) || 3)
/** Chart JSON is large; page the walk so the container never holds the lot. */
const PAGE = 50

interface Row {
  id: string
  slug: string | null
  name: string
  visibility: string
  shelf: string | null
  data: PatternData
  briefLane: string | null
  briefStyle: string | null
  briefSat: number | null
  thumbnailMediaId: string | null
  thumbnailR2Key: string | null
  alreadyOutlined: boolean
}

/**
 * The post-render saturation THIS row's thumbnail was published with. The
 * publisher uses `brief.sat != null ? 1 : POST_SAT` — a row whose brief already
 * pre-saturated the source does not get the boost twice. Mirroring it exactly
 * is what keeps the re-render the same picture, plus the outline.
 */
function postSatFor(row: Row): number {
  return row.briefSat != null ? 1 : POST_SAT
}

const SELECT = {
  id: true, slug: true, name: true, visibility: true, data: true,
  generationMeta: true, thumbnailMediaId: true, outlineApplied: true,
  subCategory: { select: { slug: true } },
  thumbnail: { select: { r2Key: true } },
} as const

function toRow(p: {
  id: string
  slug: string | null
  name: string
  visibility: string
  data: unknown
  generationMeta: unknown
  thumbnailMediaId: string | null
  outlineApplied: unknown
  subCategory: { slug: string } | null
  thumbnail: { r2Key: string | null } | null
}): Row | null {
  let data: PatternData
  try {
    data = parsePatternData(p.data)
  } catch {
    return null
  }
  const meta = (p.generationMeta ?? null) as
    | { brief?: { lane?: string; sat?: number }; style?: string }
    | null
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    visibility: p.visibility,
    shelf: p.subCategory?.slug ?? null,
    data,
    briefLane: meta?.brief?.lane ?? null,
    briefStyle: meta?.style ?? null,
    briefSat: meta?.brief?.sat ?? null,
    thumbnailMediaId: p.thumbnailMediaId,
    thumbnailR2Key: p.thumbnail?.r2Key ?? null,
    alreadyOutlined: p.outlineApplied != null,
  }
}

async function* walk(): AsyncGenerator<Row> {
  const where = {
    type: 'CROSS_STITCH' as const,
    // House catalogue only. A customer's own saved chart is their work.
    ownerUserId: null,
    ...(ONLY.length > 0 ? { slug: { in: ONLY } } : {}),
  }
  let cursor: string | undefined
  let yielded = 0
  for (;;) {
    const page = await prisma.pattern.findMany({
      where,
      orderBy: { id: 'asc' },
      take: PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: SELECT,
    })
    if (page.length === 0) return
    cursor = page[page.length - 1]!.id
    for (const p of page) {
      const row = toRow(p)
      if (!row) continue
      yield row
      yielded++
      if (LIMIT > 0 && yielded >= LIMIT) return
    }
  }
}

/** Re-read one row in full, for the pass that actually renders or writes. */
async function loadRow(id: string): Promise<Row | null> {
  const p = await prisma.pattern.findUnique({ where: { id }, select: SELECT })
  return p ? toRow(p) : null
}

function ctxFor(row: Row) {
  return { lane: row.briefLane, style: row.briefStyle, shelf: row.shelf }
}

// ───────────────────────────────────────────────────────────────────────────
// The scan
// ───────────────────────────────────────────────────────────────────────────

/**
 * What the first pass keeps. Charts are big — 29 million stitches across the
 * catalogue — so the walk drops every `data` as soon as it has judged it and
 * the second pass re-reads the handful of rows it actually touches.
 */
interface Summary {
  id: string
  slug: string | null
  shelf: string | null
  lane: string
  width: number
  height: number
  colourCount: number
  stitches: number
  mode: OutlineMode
  modeReason: string
  segments: number
  length: number
  knots: number
  addedSymbols: string[]
}

function summarise(row: Row): Summary {
  const verdict = outlineModeFor(row.data, ctxFor(row))
  const out =
    verdict.mode === 'none'
      ? null
      : embellishChart(row.data, ctxFor(row))
  return {
    id: row.id,
    slug: row.slug,
    shelf: row.shelf,
    lane: laneForSize(row.data.grid.width, row.data.grid.height),
    width: row.data.grid.width,
    height: row.data.grid.height,
    colourCount: row.data.palette.length,
    stitches: row.data.grid.cells.length,
    mode: verdict.mode,
    modeReason: verdict.reason,
    segments: out?.backstitchSegments ?? 0,
    length: out?.backstitchLength ?? 0,
    knots: out?.frenchKnots ?? 0,
    addedSymbols: out?.addedSymbols ?? [],
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Contact sheets
// ───────────────────────────────────────────────────────────────────────────

const TILE = 340
const CAPTION = 46
const GUTTER = 10

/** The published thumbnail as it stands today — cache first, then R2. */
async function storedThumb(row: Row): Promise<Buffer | null> {
  if (CACHE_DIR) {
    const file = resolve(CACHE_DIR, `${row.id}.png`)
    if (existsSync(file)) return readFileSync(file)
  }
  const base = process.env.R2_PUBLIC_BASE_URL
  if (!base || !row.thumbnailR2Key) return null
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/${row.thumbnailR2Key}`)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

/**
 * A zoom into the middle of the stitching at a cell size where the line work
 * can actually be judged. The whole-chart tile shows whether the outline fits
 * the design; this one shows whether the line itself is any good.
 */
async function zoomTile(data: PatternData, postSat: number, cells = 56): Promise<Buffer> {
  const bbox = stitchedBoundingBox(data)
  const cx = bbox ? Math.round((bbox.minX + bbox.maxX) / 2) : Math.round(data.grid.width / 2)
  const cy = bbox ? Math.round((bbox.minY + bbox.maxY) / 2) : Math.round(data.grid.height / 2)
  const w = Math.min(cells, data.grid.width)
  const h = Math.min(cells, data.grid.height)
  const region = {
    x: Math.max(0, Math.min(data.grid.width - w, cx - Math.round(w / 2))),
    y: Math.max(0, Math.min(data.grid.height - h, cy - Math.round(h / 2))),
    width: w,
    height: h,
  }
  const svg = renderPatternSvgString(data, {
    mode: 'beauty',
    cellPx: 20,
    showSymbols: false,
    showGrid: false,
    showCentreCrosshairs: false,
    padding: 8,
    region,
  })
  return sharp(Buffer.from(svg))
    .modulate({ saturation: postSat })
    .resize(TILE * 2, TILE * 2, { fit: 'inside' })
    .png()
    .toBuffer()
}

function textStrip(text: string, width: number, height: number, size: number, bold = false): Buffer {
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect width="${width}" height="${height}" fill="#ffffff"/>` +
      `<text x="6" y="${Math.round(height * 0.68)}" font-family="DejaVu Sans, Helvetica, sans-serif" ` +
      `font-size="${size}" ${bold ? 'font-weight="700" ' : ''}fill="#1c1c1c">${safe}</text></svg>`,
  )
}

async function tile(png: Buffer | null, label: string): Promise<Buffer> {
  const body = png
    ? await sharp(png)
        .resize(TILE, TILE, { fit: 'contain', background: '#ffffff' })
        .flatten({ background: '#ffffff' })
        .png()
        .toBuffer()
    : await sharp({ create: { width: TILE, height: TILE, channels: 3, background: '#f2f2f2' } }).png().toBuffer()
  return sharp({ create: { width: TILE, height: TILE + 24, channels: 3, background: '#ffffff' } })
    .composite([
      { input: body, top: 0, left: 0 },
      { input: textStrip(label, TILE, 24, 15, true), top: TILE, left: 0 },
    ])
    .png()
    .toBuffer()
}

interface SheetEntry {
  caption: string
  tiles: { png: Buffer | null; label: string }[]
}

async function contactSheet(entries: SheetEntry[], file: string): Promise<void> {
  const cols = Math.max(...entries.map((e) => e.tiles.length))
  const rowH = TILE + 24 + CAPTION + GUTTER
  const width = cols * TILE + (cols - 1) * GUTTER
  const height = entries.length * rowH
  const layers: sharp.OverlayOptions[] = []
  for (let r = 0; r < entries.length; r++) {
    const e = entries[r]!
    layers.push({ input: textStrip(e.caption, width, CAPTION, 19), top: r * rowH, left: 0 })
    for (let c = 0; c < e.tiles.length; c++) {
      const t = e.tiles[c]!
      layers.push({
        input: await tile(t.png, t.label),
        top: r * rowH + CAPTION,
        left: c * (TILE + GUTTER),
      })
    }
  }
  const png = await sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite(layers)
    .png()
    .toBuffer()
  writeFileSync(file, png)
}

/**
 * Pick the sample: a round-robin across the shelves, striding within each so the
 * pieces come from all over the catalogue rather than one alphabetical corner,
 * plus two rows the rule must NOT touch (a monochrome Delft and a showpiece).
 * Deterministic, so a re-run shows the same pieces.
 */
function pickSample(outlined: Summary[], skipped: Summary[]): { rows: Summary[]; kept: Summary[] } {
  const kept: Summary[] = []
  const mono = skipped.find((r) => r.shelf === 'monochrome')
  if (mono) kept.push(mono)
  const dense = skipped.find((r) => r.colourCount >= 60)
  if (dense) kept.push(dense)

  const byShelf = new Map<string, Summary[]>()
  for (const r of outlined) {
    const key = r.shelf ?? '-'
    const list = byShelf.get(key) ?? []
    list.push(r)
    byShelf.set(key, list)
  }
  for (const list of byShelf.values()) {
    // Stride by size lane first so a shelf contributes a mini AND a large.
    list.sort((a, b) => a.lane.localeCompare(b.lane) || (a.slug ?? a.id).localeCompare(b.slug ?? b.id))
  }

  const budget = Math.max(1, SAMPLE - kept.length)
  const shelves = [...byShelf.entries()].sort((a, b) => b[1].length - a[1].length)
  const picked: Summary[] = []
  for (let round = 0; picked.length < budget && round < 12; round++) {
    for (const [, list] of shelves) {
      if (picked.length >= budget) break
      const step = Math.max(1, Math.floor(list.length / 4))
      const i = (round * step) % list.length
      const r = list[i]
      if (!r || picked.some((p) => p.id === r.id)) continue
      picked.push(r)
    }
  }
  for (const r of outlined) {
    if (picked.length >= budget) break
    if (!picked.some((p) => p.id === r.id)) picked.push(r)
  }
  return { rows: picked.slice(0, budget), kept }
}

async function buildSheets(outlined: Summary[], skipped: Summary[]): Promise<string[]> {
  const dir = resolve(OUT_DIR, 'sheets')
  mkdirSync(dir, { recursive: true })
  let all: Summary[]
  if (ONLY.length > 0) {
    const byId = [...outlined, ...skipped]
    all = ONLY.map((slug) => byId.find((r) => r.slug === slug)).filter((r): r is Summary => r != null)
    console.log(`contact sheets: ${all.length} named rows`)
  } else {
    const { rows, kept } = pickSample(outlined, skipped)
    all = [...rows, ...kept]
    console.log(`contact sheets: ${rows.length} to outline + ${kept.length} that must stay untouched`)
  }

  const entries: SheetEntry[] = []
  for (const summary of all) {
    const row = await loadRow(summary.id)
    if (!row) continue
    const postSat = postSatFor(row)
    const out = embellishChart(row.data, ctxFor(row))
    const changed = !out.unchanged
    // The published thumbnail IS the before picture, and a cached copy costs
    // nothing; only fall back to re-rendering it when there is no cache.
    const before = (await storedThumb(row)) ?? (await renderBeautyThumbnail(row.data, postSat))
    const after = changed ? await renderBeautyThumbnail(out.data, postSat) : null
    entries.push({
      caption:
        `${row.slug ?? row.id}  ·  ${summary.lane} ${summary.width}x${summary.height}  ·  ` +
        `${summary.colourCount} colours  ·  ${row.shelf ?? '-'}  ·  ` +
        (changed
          ? `${out.mode.toUpperCase()} (${out.modeReason}): ${out.backstitchSegments} segments, ` +
            `${Math.round(out.backstitchLength)} cells of line, ${out.frenchKnots} knots` +
            (out.addedSymbols.length > 0 ? `, +${out.inkCodes.join('/')} added` : ` in ${out.inkCodes.join('/')}`)
          : `UNTOUCHED: ${out.modeReason}`),
      tiles: [
        { png: before, label: 'now' },
        { png: after, label: after ? 'outlined' : 'unchanged by the rule' },
        { png: await zoomTile(row.data, postSat), label: 'now — close up' },
        { png: changed ? await zoomTile(out.data, postSat) : null, label: 'outlined — close up' },
      ],
    })
  }

  const files: string[] = []
  const PER_SHEET = 3
  for (let i = 0; i < entries.length; i += PER_SHEET) {
    const file = resolve(dir, `${arg('name') ?? 'sheet'}-${String(i / PER_SHEET + 1).padStart(2, '0')}.png`)
    await contactSheet(entries.slice(i, i + PER_SHEET), file)
    files.push(file)
    console.log(`  wrote ${file}`)
  }
  return files
}

// ───────────────────────────────────────────────────────────────────────────
// The backfill
// ───────────────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function r2UploadRetry(png: Buffer, filename: string): Promise<{ key: string }> {
  let lastErr: unknown
  for (let i = 0; i < 4; i++) {
    try {
      return await r2Upload(png, 'image/png', { prefix: 'pattern-thumbnails', filename })
    } catch (e) {
      lastErr = e
      await sleep(1500 * (i + 1))
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('r2Upload failed')
}

async function outlineOne(row: Row): Promise<{ segments: number; knots: number } | null> {
  const out = embellishChart(row.data, ctxFor(row))
  if (out.unchanged) return null

  const previousDataSha256 = sha256Hex(Buffer.from(JSON.stringify(row.data)))
  const m = computePatternMetrics(out.data)

  // Re-render through the publisher's own renderer: the hero is the exact chart,
  // so a chart that changed gets the thumbnail that chart would have shipped with.
  const png = await renderBeautyThumbnail(out.data, postSatFor(row))
  const meta = await sharp(png).metadata()
  const hashes = await imageHash(png)
  const { key } = await r2UploadRetry(png, `${row.id}.png`)

  // Chart, metrics, thumbnail, fingerprints and the reversible record land
  // together or not at all — a row half-outlined would ship a chart whose hero
  // is the old picture.
  await prisma.$transaction(async (tx) => {
    const media = await tx.media.create({
      data: {
        type: 'ILLUSTRATION',
        mimeType: 'image/png',
        r2Key: key,
        width: meta.width ?? THUMB_TARGET,
        height: meta.height ?? THUMB_TARGET,
        bytes: png.byteLength,
        status: 'READY',
        source: 'original',
        alt: `${row.name} cross-stitch chart`,
      },
      select: { id: true },
    })
    await tx.pattern.update({
      where: { id: row.id },
      data: {
        data: out.data as unknown as object,
        thumbnailMediaId: media.id,
        colourCount: m.colourCount,
        totalStitches: m.totalStitches,
        widthCells: m.widthCells,
        heightCells: m.heightCells,
        hasBackstitch: m.hasBackstitch,
        hasFrenchKnots: m.hasFrenchKnots,
        hasBeads: m.hasBeads,
        hasQuarterStitches: m.hasQuarterStitches,
        confettiShare: m.confettiShare,
        colourChangesPer100: m.colourChangesPer100,
        medianRunLength: m.medianRunLength,
        stitchability: m.stitchability,
        thumbnailSha256: sha256Hex(png),
        imageHash64: hashes.dhash64,
        imageHash256: hashes.dhash256,
        chartFingerprint: chartFingerprint(out.data) as unknown as object,
        outlineApplied: {
          at: new Date().toISOString(),
          mode: out.mode,
          modeReason: out.modeReason,
          backstitchSegments: out.backstitchSegments,
          backstitchLength: out.backstitchLength,
          frenchKnots: out.frenchKnots,
          addedSymbols: out.addedSymbols,
          inkCodes: out.inkCodes,
          previousThumbnailMediaId: row.thumbnailMediaId,
          previousDataSha256,
          before: { totalStitches: row.data.grid.cells.length, colourCount: row.data.palette.length },
          after: { totalStitches: m.totalStitches, colourCount: m.colourCount },
        } as unknown as object,
      },
    })
  })

  // Search last: a doc built from a half-written row would be wrong, and a
  // failed sync is recoverable by re-running the sync, not the outline.
  try {
    const { buildPatternDoc } = await import('@homemade/db/search-docs')
    const { syncPatternDoc } = await import('@homemade/search')
    const doc = await buildPatternDoc(row.id)
    if (doc) await syncPatternDoc(doc)
  } catch (err) {
    console.warn(`  search sync failed for ${row.slug ?? row.id}: ${err instanceof Error ? err.message : String(err)}`)
  }

  return { segments: out.backstitchSegments, knots: out.frenchKnots }
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true })

  const outlined: Summary[] = []
  const skipped: Summary[] = []
  let alreadyDone = 0
  let seen = 0

  for await (const row of walk()) {
    seen++
    if (row.alreadyOutlined) {
      alreadyDone++
      continue
    }
    const sum = summarise(row)
    if (sum.mode !== 'none' && (sum.segments > 0 || sum.knots > 0)) outlined.push(sum)
    else skipped.push(sum)
    if (seen % 100 === 0) console.log(`  scanned ${seen}`)
  }

  const byMode = new Map<string, number>()
  for (const s of [...outlined, ...skipped]) byMode.set(s.mode, (byMode.get(s.mode) ?? 0) + 1)
  console.log(
    `\n${seen} cross-stitch patterns · to outline ${outlined.length} · left alone ${skipped.length} · already outlined ${alreadyDone}`,
  )
  console.log(`  by mode: ${[...byMode].map(([m, n]) => `${m} ${n}`).join(' · ')}`)

  if (SHEETS) {
    await buildSheets(outlined, skipped)
    await prisma.$disconnect()
    return
  }

  const totalLine = outlined.reduce((a, r) => a + r.length, 0)
  const totalKnots = outlined.reduce((a, r) => a + r.knots, 0)
  if (!APPLY) {
    console.log(
      `DRY RUN — would stitch ${Math.round(totalLine).toLocaleString()} cells of back-stitch and ` +
        `${totalKnots.toLocaleString()} French knots across ${outlined.length} charts. Re-run with --apply.`,
    )
    writeFileSync(
      resolve(OUT_DIR, 'outline-plan.json'),
      JSON.stringify({ plannedAt: new Date().toISOString(), outlined, skipped }, null, 2),
    )
    await prisma.$disconnect()
    return
  }

  let done = 0
  let failed = 0
  let segments = 0
  let knots = 0
  // A row costs one chart render (the hero, at full size) plus an upload and a
  // transaction, and the render is the expensive half. A handful of rows in
  // flight keeps the box busy without letting a thousand charts into memory at
  // once; the rows are independent, so order does not matter.
  let next = 0
  const worker = async (): Promise<void> => {
    for (;;) {
      const i = next++
      if (i >= outlined.length) return
      const sum = outlined[i]!
      try {
        // Re-read and re-judge at write time: another session may have touched
        // the row since the scan, and the rule must decide on what is there now.
        const row = await loadRow(sum.id)
        if (!row || row.alreadyOutlined) continue
        const n = await outlineOne(row)
        if (!n) continue
        segments += n.segments
        knots += n.knots
        done++
        if (done % 20 === 0) {
          console.log(`  ${done}/${outlined.length} · ${segments.toLocaleString()} segments · ${knots} knots`)
        }
      } catch (err) {
        failed++
        console.error(`  FAILED ${sum.slug ?? sum.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  console.log(
    `\nBACKFILL · outlined ${done} · failed ${failed} · left alone ${skipped.length} · already outlined ${alreadyDone}`,
  )
  console.log(`Back-stitch segments: ${segments.toLocaleString()} · French knots: ${knots.toLocaleString()}`)
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error('FAILED:', err instanceof Error ? (err.stack ?? err.message) : String(err))
  await prisma.$disconnect()
  process.exit(1)
})

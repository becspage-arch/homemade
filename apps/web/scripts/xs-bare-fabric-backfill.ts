/**
 * xs-bare-fabric-backfill — stop the catalogue stitching white backgrounds.
 *
 * A printed proof of `b07032021-cute-baby-tortoise` (9 colours, 112x112) came
 * back with the entire background stitched in DMC B5200: 8,007 stitches of white
 * floss on white aida, 64% of the chart. No stitcher would work that, and no
 * best-selling kit asks them to — the cloth is the background. The old catalogue
 * was converted with `backgroundRemoval: false`, so this is systematic.
 *
 * This script applies the binary rule in
 * `lib/studio/generation/bulk/bare-fabric.ts` to every cross-stitch Pattern and,
 * for the rows that qualify, rewrites the border-connected white cells as bare
 * fabric. The showpiece tier is full coverage by design and is excluded; interior
 * white — a white cat, the glint in an eye, a wave crest — is never touched,
 * because the flood fill never reaches it.
 *
 * The hero IS the exact chart, so a row is only ever changed as a whole:
 *
 *   data            border-connected white cells removed
 *   palette         a white entry dropped if nothing references it any more
 *   metrics         computePatternMetrics + stitchability, recomputed
 *   thumbnail       re-rendered through the SAME renderer the publisher uses,
 *                   uploaded to R2 as a NEW object, Media row created, and
 *                   thumbnailMediaId repointed (the old Media row is KEPT)
 *   fingerprints    thumbnailSha256 / imageHash64 / imageHash256 /
 *                   chartFingerprint recomputed off the shipped artifact
 *   backgroundCleared  the reversible record: what went, why, the previous
 *                   thumbnail media id and the previous data hash
 *   search          the pattern doc re-synced
 *
 * Idempotent and resumable: a row carrying `backgroundCleared` is skipped, and
 * the rewrite itself is a no-op on an already-cleared chart.
 *
 *   cd apps/web && pnpm exec tsx scripts/xs-bare-fabric-backfill.ts \
 *     [--sheets] [--sample N] [--cache <thumb-dir>] [--out <dir>] \
 *     [--limit N] [--only <slug,slug>] [--apply]
 *
 * Without --apply it reports and changes nothing. --sheets writes before/after
 * contact sheets to <out>/sheets and exits; LOOK at them before applying.
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
import {
  bareFabricVerdict,
  clearBackground,
  fullCoverageByIntent,
  laneForSize,
} from '@/lib/studio/generation/bulk/bare-fabric'
import { renderBeautyThumbnail, THUMB_TARGET } from '@/lib/studio/generation/bulk/beauty-thumbnail'
import { POST_SAT } from '@/lib/studio/generation/bulk/cross-stitch-style'
import { chartFingerprint, imageHash, sha256Hex } from '@/lib/studio/generation/bulk/similarity'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const APPLY = process.argv.includes('--apply')
const SHEETS = process.argv.includes('--sheets')
const SAMPLE = Number(arg('sample')) || 24
const LIMIT = Number(arg('limit')) || 0
const OUT_DIR = arg('out') ?? resolve(process.cwd(), '../../scratchpad/xs-fabric')
const CACHE_DIR = arg('cache')
const ONLY = (arg('only') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
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
  /** The brief's own source saturation override, if it had one. */
  briefSat: number | null
  thumbnailMediaId: string | null
  thumbnailR2Key: string | null
  alreadyCleared: boolean
}

/**
 * The post-render saturation THIS row's thumbnail was published with. The
 * publisher uses `brief.sat != null ? 1 : POST_SAT` — a row whose brief already
 * pre-saturated the source does not get the boost twice. Mirroring it exactly
 * is what keeps the re-render the same picture, minus the background.
 */
function postSatFor(row: Row): number {
  return row.briefSat != null ? 1 : POST_SAT
}

async function* walk(): AsyncGenerator<Row> {
  const where = {
    type: 'CROSS_STITCH' as const,
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
      select: {
        id: true, slug: true, name: true, visibility: true, data: true,
        generationMeta: true, thumbnailMediaId: true, backgroundCleared: true,
        subCategory: { select: { slug: true } },
        thumbnail: { select: { r2Key: true } },
      },
    })
    if (page.length === 0) return
    cursor = page[page.length - 1]!.id
    for (const p of page) {
      let data: PatternData
      try {
        data = parsePatternData(p.data)
      } catch {
        continue
      }
      const meta = (p.generationMeta ?? null) as
        | { brief?: { lane?: string; sat?: number }; style?: string }
        | null
      yield {
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
        alreadyCleared: p.backgroundCleared != null,
      }
      yielded++
      if (LIMIT > 0 && yielded >= LIMIT) return
    }
  }
}

function verdictFor(row: Row) {
  return bareFabricVerdict(row.data, {
    fullCoverageByIntent: fullCoverageByIntent({ lane: row.briefLane, style: row.briefStyle }),
  })
}

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
  borderWhiteCells: number
  borderWhiteShare: number
  interiorWhiteCells: number
  convert: boolean
  reason: string
}

function summarise(row: Row): Summary {
  const v = verdictFor(row)
  return {
    id: row.id,
    slug: row.slug,
    shelf: row.shelf,
    lane: laneForSize(v.scan.widthCells, v.scan.heightCells),
    width: v.scan.widthCells,
    height: v.scan.heightCells,
    colourCount: v.scan.colourCount,
    borderWhiteCells: v.scan.borderWhiteCells,
    borderWhiteShare: v.scan.borderWhiteShare,
    interiorWhiteCells: v.scan.interiorWhiteCells,
    convert: v.convert,
    reason: v.reason,
  }
}

/** Re-read one row in full, for the pass that actually renders or writes. */
async function loadRow(id: string): Promise<Row | null> {
  const p = await prisma.pattern.findUnique({
    where: { id },
    select: {
      id: true, slug: true, name: true, visibility: true, data: true,
      generationMeta: true, thumbnailMediaId: true, backgroundCleared: true,
      subCategory: { select: { slug: true } },
      thumbnail: { select: { r2Key: true } },
    },
  })
  if (!p) return null
  let data: PatternData
  try {
    data = parsePatternData(p.data)
  } catch {
    return null
  }
  const meta = (p.generationMeta ?? null) as { brief?: { lane?: string; sat?: number }; style?: string } | null
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
    alreadyCleared: p.backgroundCleared != null,
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
  await sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite(layers)
    .png()
    .toBuffer()
    .then((buf) => writeFileSync(file, buf))
}

/**
 * Pick the sample: a spread across the size lanes of the convert set, the
 * tortoise the whole job started with, and two monochrome Delft rows the rule
 * must NOT touch. Deterministic, so a re-run shows the same pieces.
 */
function pickSample(convert: Summary[], untouched: Summary[]): { rows: Summary[]; kept: Summary[] } {
  const kept = untouched
    .filter((r) => r.shelf === 'monochrome')
    .sort((a, b) => (a.slug ?? a.id).localeCompare(b.slug ?? b.id))
    .slice(0, 2)

  const byLane = new Map<string, Summary[]>()
  for (const r of convert) {
    const list = byLane.get(r.lane) ?? []
    list.push(r)
    byLane.set(r.lane, list)
  }
  for (const list of byLane.values()) list.sort((a, b) => (a.slug ?? a.id).localeCompare(b.slug ?? b.id))

  const budget = SAMPLE - kept.length
  const lanes = ['mini', 'small', 'medium', 'large', 'huge'].filter((l) => (byLane.get(l)?.length ?? 0) > 0)
  const perLane = Math.max(1, Math.ceil(budget / lanes.length))

  const picked: Summary[] = []
  const seed = convert.find((r) => r.slug === 'b07032021-cute-baby-tortoise')
  if (seed) picked.push(seed)

  for (const lane of lanes) {
    const list = byLane.get(lane)!
    // Even stride through the lane so the sample spans light and heavy
    // backgrounds rather than clustering on one alphabetical neighbourhood.
    const step = Math.max(1, Math.floor(list.length / perLane))
    let taken = picked.filter((p) => p.lane === lane).length
    for (let i = 0; i < list.length && taken < perLane && picked.length < budget; i += step) {
      const r = list[i]!
      if (picked.some((p) => p.id === r.id)) continue
      picked.push(r)
      taken++
    }
  }

  // Top up to the budget from whatever the lane stride skipped, so a small lane
  // running dry does not shrink the sample.
  for (const r of convert) {
    if (picked.length >= budget) break
    if (!picked.some((p) => p.id === r.id)) picked.push(r)
  }

  return { rows: picked.slice(0, budget), kept }
}

async function buildSheets(convert: Summary[], skipped: Summary[], untouched: Summary[]): Promise<string[]> {
  const dir = resolve(OUT_DIR, 'sheets')
  mkdirSync(dir, { recursive: true })
  // --only is the aiming mode: render exactly the rows named, whatever the rule
  // says about them, so a borderline threshold can be argued about by eye.
  let all: Summary[]
  if (ONLY.length > 0) {
    const byId = [...convert, ...skipped, ...untouched]
    all = ONLY.map((slug) => byId.find((r) => r.slug === slug)).filter((r): r is Summary => r != null)
    console.log(`contact sheets: ${all.length} named rows`)
  } else {
    const { rows, kept } = pickSample(convert, untouched)
    all = [...rows, ...kept]
    console.log(`contact sheets: ${rows.length} to convert + ${kept.length} that must stay untouched`)
  }

  const entries: SheetEntry[] = []
  for (const summary of all) {
    const row = await loadRow(summary.id)
    if (!row) continue
    const v = verdictFor(row)
    const cleared = clearBackground(row.data)
    const postSat = postSatFor(row)
    const stored = await storedThumb(row)
    const before = await renderBeautyThumbnail(row.data, postSat)
    const after = v.convert && cleared.removed > 0 ? await renderBeautyThumbnail(cleared.data, postSat) : null
    entries.push({
      caption:
        `${row.slug ?? row.id}  ·  ${summary.lane} ${summary.width}x${summary.height}  ·  ` +
        `${summary.colourCount} colours  ·  ${row.shelf ?? '-'}  ·  ` +
        (v.convert
          ? `CONVERT: ${cleared.removed.toLocaleString()} white stitches out (${(v.scan.borderWhiteShare * 100).toFixed(0)}% of grid), ${v.scan.interiorWhiteCells} interior white kept`
          : `KEEP: ${v.reason}`),
      tiles: [
        { png: stored, label: 'published now' },
        { png: before, label: 're-render, unchanged' },
        { png: after, label: after ? 'after — bare fabric' : 'unchanged by the rule' },
      ],
    })
  }

  const files: string[] = []
  const PER_SHEET = 4
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

async function convertOne(row: Row): Promise<number> {
  const v = verdictFor(row)
  const cleared = clearBackground(row.data)
  if (cleared.removed === 0) return 0

  const previousDataSha256 = sha256Hex(Buffer.from(JSON.stringify(row.data)))
  const m = computePatternMetrics(cleared.data)

  // Re-render through the publisher's own renderer: the hero is the exact chart,
  // so a chart that changed gets the thumbnail that chart would have shipped with.
  const png = await renderBeautyThumbnail(cleared.data, postSatFor(row))
  const meta = await sharp(png).metadata()
  const hashes = await imageHash(png)
  const { key } = await r2UploadRetry(png, `${row.id}.png`)

  // Chart, metrics, thumbnail, fingerprints and the reversible record land
  // together or not at all — a row half-cleared would ship a chart whose hero
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
        data: cleared.data as unknown as object,
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
        chartFingerprint: chartFingerprint(cleared.data) as unknown as object,
        backgroundCleared: {
          at: new Date().toISOString(),
          reason: v.reason,
          removedStitches: cleared.removed,
          droppedSymbols: cleared.droppedSymbols,
          previousThumbnailMediaId: row.thumbnailMediaId,
          previousDataSha256,
          before: { totalStitches: row.data.grid.cells.length, colourCount: row.data.palette.length },
          after: { totalStitches: m.totalStitches, colourCount: m.colourCount },
        } as unknown as object,
      },
    })
  })

  // Search last: a doc built from a half-written row would be wrong, and a
  // failed sync is recoverable by re-running the sync, not the conversion.
  try {
    const { buildPatternDoc } = await import('@homemade/db/search-docs')
    const { syncPatternDoc } = await import('@homemade/search')
    const doc = await buildPatternDoc(row.id)
    if (doc) await syncPatternDoc(doc)
  } catch (err) {
    console.warn(`  search sync failed for ${row.slug ?? row.id}: ${err instanceof Error ? err.message : String(err)}`)
  }

  return cleared.removed
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true })

  const convert: Summary[] = []
  const skippedByRule: Summary[] = []
  const untouched: Summary[] = []
  let alreadyDone = 0
  let seen = 0

  for await (const row of walk()) {
    seen++
    if (row.alreadyCleared) {
      alreadyDone++
      continue
    }
    const sum = summarise(row)
    if (sum.convert) convert.push(sum)
    else if (sum.borderWhiteShare >= 0.08) skippedByRule.push(sum)
    else untouched.push(sum)
    if (seen % 200 === 0) console.log(`  scanned ${seen}`)
  }

  console.log(
    `\n${seen} cross-stitch patterns · convert ${convert.length} · skipped by rule ${skippedByRule.length} · untouched ${untouched.length} · already cleared ${alreadyDone}`,
  )

  if (SHEETS) {
    await buildSheets(convert, skippedByRule, untouched)
    await prisma.$disconnect()
    return
  }

  const wouldRemove = convert.reduce((a, r) => a + r.borderWhiteCells, 0)
  if (!APPLY) {
    console.log(`DRY RUN — would remove ${wouldRemove.toLocaleString()} white stitches. Re-run with --apply.`)
    writeFileSync(
      resolve(OUT_DIR, 'backfill-plan.json'),
      JSON.stringify({ plannedAt: new Date().toISOString(), convert, skippedByRule }, null, 2),
    )
    await prisma.$disconnect()
    return
  }

  let done = 0
  let failed = 0
  let removed = 0
  for (const sum of convert) {
    try {
      const row = await loadRow(sum.id)
      // Re-read and re-judge at write time: another session may have touched
      // the row since the scan, and the rule must decide on what is there now.
      if (!row || row.alreadyCleared) continue
      const n = await convertOne(row)
      if (n === 0) continue
      removed += n
      done++
      if (done % 20 === 0) console.log(`  ${done}/${convert.length} · ${removed.toLocaleString()} stitches removed`)
    } catch (err) {
      failed++
      console.error(`  FAILED ${sum.slug ?? sum.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(
    `\nBACKFILL · converted ${done} · failed ${failed} · skipped by rule ${skippedByRule.length} · untouched ${untouched.length} · already cleared ${alreadyDone}`,
  )
  console.log(`White stitches removed: ${removed.toLocaleString()}`)
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error('FAILED:', err instanceof Error ? (err.stack ?? err.message) : String(err))
  await prisma.$disconnect()
  process.exit(1)
})

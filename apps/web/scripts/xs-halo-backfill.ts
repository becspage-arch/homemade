/**
 * xs-halo-backfill: take the pale antialiased ring off the published quick wins.
 *
 * The bare-fabric clear stops at genuine white, so the soft edge Flux drew
 * between the motif and its white ground stayed stitched, as a one-cell ring of
 * light grey, grey-khaki, grey-green or blush round the subject, with the
 * back-stitch outline then traced round the ring rather than the subject. The
 * converter now peels it (`peelHalo` in bulk/bare-fabric.ts, run straight after
 * the clear); this applies the same peel to the quick-lane rows already public.
 *
 * The outline and the fractionals were derived from the ringed silhouette, so
 * they are taken off first and derived again after the peel, exactly as the
 * converter orders it (clear, peel, outline, fractionals). Taking them off is
 * exact: the outline only ever ADDS back-stitch (and on these lanes no knots),
 * and a fractional pair tiles the cell whose full cross it replaced, so the
 * three-quarter's colour is that cross. The script checks the inverse on every
 * row (re-deriving the un-peeled base must reproduce the stored chart) and
 * skips a row where it does not.
 *
 *   cd apps/web
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx --conditions=react-server \
 *     scripts/xs-halo-backfill.ts --work <dir> [--only=a,b]            dry run: <dir>/ba/<slug>.png
 *   ... --work <dir> --out <archive-dir> --apply [--only=a,b]           write
 *
 * --apply writes the row the way xs-chart-fix and the bare-fabric backfill do:
 * data, metrics, a NEW thumbnail Media (the old one is kept), fingerprints, a
 * search re-sync, and the reversible record on `generationMeta.haloPeel`
 * (previous thumbnail id, previous data hash, the gzipped old chart in
 * <out>/backup). Rows already carrying `haloPeel` are skipped. `flossSummary`
 * is left to the trigger and the page: a rewritten chart's stored key is
 * cleared and rebuilt on its next view.
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: process.env.HOMEMADE_ENV_FILE ?? '../../.env.credentials', quiet: true })
import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import sharp from 'sharp'
import { prisma, parsePatternData, computePatternMetrics, r2Upload, Visibility } from '@homemade/db'
import { peelHalo } from '@/lib/studio/generation/bulk/bare-fabric'
import { unembellish, reembellish, sameChart, type GenMeta } from './xs-halo-backfill/lib'
import { renderBeautyThumbnail, THUMB_TARGET } from '@/lib/studio/generation/bulk/beauty-thumbnail'
import { POST_SAT } from '@/lib/studio/generation/bulk/cross-stitch-style'
import { chartFingerprint, imageHash, sha256Hex } from '@/lib/studio/generation/bulk/similarity'

function flag(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const WORK = flag('work') ?? '../../scratchpad/xs-halo'
const OUT = flag('out')
const APPLY = process.argv.includes('--apply')
const ONLY = (process.argv.find((a) => a.startsWith('--only='))?.slice(7) ?? '').split(',').filter(Boolean)
const LANE = 'quick'

async function sideBySide(a: Buffer, b: Buffer, label: string): Promise<Buffer> {
  const S = 640
  const A = await sharp(a).resize(S, S, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#fff' }).png().toBuffer()
  const B = await sharp(b).resize(S, S, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#fff' }).png().toBuffer()
  const txt = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S * 2 + 10}" height="30"><text x="6" y="21" font-size="15" font-family="DejaVu Sans">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`)
  return sharp({ create: { width: S * 2 + 10, height: S + 30, channels: 3, background: '#ffffff' } })
    .composite([{ input: txt, left: 0, top: 0 }, { input: A, left: 0, top: 30 }, { input: B, left: S + 10, top: 30 }])
    .png()
    .toBuffer()
}

async function main(): Promise<void> {
  if (APPLY && !OUT) throw new Error('--apply needs --out <archive-dir> for the backups and before/after images')
  mkdirSync(`${WORK}/ba`, { recursive: true })
  if (APPLY) mkdirSync(`${OUT}/backup`, { recursive: true })

  const rows = await prisma.pattern.findMany({
    where: {
      type: 'CROSS_STITCH',
      ownerUserId: null,
      visibility: Visibility.PUBLIC,
      generationMeta: { path: ['brief', 'lane'], equals: LANE },
      ...(ONLY.length ? { slug: { in: ONLY } } : {}),
    },
    select: { id: true, slug: true, name: true, thumbnailMediaId: true, generationMeta: true, thumbnail: { select: { r2Key: true } } },
    orderBy: { slug: 'asc' },
  })
  const tally = { rows: rows.length, peeled: 0, noHalo: 0, alreadyDone: 0, inverseMismatch: 0, applied: 0, removed: 0 }

  for (const r of rows) {
    const slug = r.slug ?? r.id
    const gm = (r.generationMeta ?? {}) as GenMeta
    if (gm.haloPeel) { tally.alreadyDone++; console.log(`DONE     ${slug}`); continue }
    const full = await prisma.pattern.findUnique({ where: { id: r.id }, select: { data: true } })
    const stored = parsePatternData(full!.data)

    const base = unembellish(stored)
    if (!sameChart(reembellish(base, gm), stored)) {
      tally.inverseMismatch++
      console.log(`MISMATCH ${slug}: re-deriving the un-peeled base does not give the stored chart; skipped`)
      continue
    }
    const peeled = peelHalo(base)
    if (peeled.removed === 0) { tally.noHalo++; console.log(`NOHALO   ${slug}: ${peeled.reason}`); continue }
    const after = reembellish(peeled.data, gm)
    tally.peeled++
    tally.removed += peeled.removed

    const png = await renderBeautyThumbnail(after, gm.brief?.sat != null ? 1 : POST_SAT)
    const was = Buffer.from(await (await fetch(`${process.env.R2_PUBLIC_BASE_URL}/${r.thumbnail!.r2Key}`)).arrayBuffer())
    const label = `${slug.slice(0, 52)}  -${peeled.removed} (${peeled.haloColours.map((h) => h.code).join(',')})  bs ${stored.grid.backstitch.length}->${after.grid.backstitch.length}`
    writeFileSync(`${WORK}/ba/${slug}.png`, await sideBySide(was, png, label))
    console.log(`PEEL     ${slug}: ${peeled.reason}; cells ${stored.grid.cells.length}->${after.grid.cells.length}, colours ${stored.palette.length}->${after.palette.length}, bs ${stored.grid.backstitch.length}->${after.grid.backstitch.length}, fr ${stored.grid.fractional.length}->${after.grid.fractional.length}`)
    if (!APPLY) continue

    writeFileSync(`${OUT}/backup/${slug}.json.gz`, gzipSync(JSON.stringify({ id: r.id, slug, thumbnailMediaId: r.thumbnailMediaId, data: full!.data })))
    const m = computePatternMetrics(after)
    const meta = await sharp(png).metadata()
    const hashes = await imageHash(png)
    const { key } = await r2Upload(png, 'image/png', { prefix: 'pattern-thumbnails', filename: `${r.id}.png` })
    await prisma.$transaction(async (tx) => {
      const media = await tx.media.create({
        data: { type: 'ILLUSTRATION', mimeType: 'image/png', r2Key: key, width: meta.width ?? THUMB_TARGET, height: meta.height ?? THUMB_TARGET, bytes: png.byteLength, status: 'READY', source: 'original', alt: `${r.name} cross-stitch chart` },
        select: { id: true },
      })
      await tx.pattern.update({
        where: { id: r.id },
        select: { id: true },
        data: {
          data: after as unknown as object,
          thumbnailMediaId: media.id,
          colourCount: m.colourCount, totalStitches: m.totalStitches, widthCells: m.widthCells, heightCells: m.heightCells,
          hasBackstitch: m.hasBackstitch, hasFrenchKnots: m.hasFrenchKnots, hasBeads: m.hasBeads, hasQuarterStitches: m.hasQuarterStitches,
          confettiShare: m.confettiShare, colourChangesPer100: m.colourChangesPer100, medianRunLength: m.medianRunLength, stitchability: m.stitchability,
          thumbnailSha256: sha256Hex(png), imageHash64: hashes.dhash64, imageHash256: hashes.dhash256,
          chartFingerprint: chartFingerprint(after) as unknown as object,
          generationMeta: {
            ...gm,
            haloPeel: {
              at: new Date().toISOString(),
              by: 'xs-halo-backfill',
              reason: peeled.reason,
              removed: peeled.removed,
              colours: peeled.haloColours.map((h) => h.code),
              droppedSymbols: peeled.droppedSymbols,
              previousThumbnailMediaId: r.thumbnailMediaId,
              previousDataSha256: sha256Hex(Buffer.from(JSON.stringify(full!.data))),
              backup: `${OUT}/backup/${slug}.json.gz`,
              before: { cells: stored.grid.cells.length, colours: stored.palette.length, backstitch: stored.grid.backstitch.length },
              after: { cells: after.grid.cells.length, colours: after.palette.length, backstitch: after.grid.backstitch.length },
            },
          } as unknown as object,
        },
      })
    })
    try {
      const { buildPatternDoc } = await import('@homemade/db/search-docs')
      const { syncPatternDoc } = await import('@homemade/search')
      const doc = await buildPatternDoc(r.id)
      if (doc) await syncPatternDoc(doc)
    } catch (e) {
      console.log(`  search re-sync failed for ${slug}: ${e instanceof Error ? e.message : String(e)}`)
    }
    tally.applied++
    console.log(`  APPLIED ${slug}`)
  }
  console.log(JSON.stringify(tally))
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

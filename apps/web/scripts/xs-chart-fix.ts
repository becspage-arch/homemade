/**
 * xs-chart-fix: repair small faults in a stored cross-stitch chart, re-render its
 * hero the way the publisher does, and publish the pass the way a kept candidate
 * is published.
 *
 * Built for the nearly-there pass of 17 October 2026 (200 rejected candidates
 * whose fault was a signature, a frame band, floating strays or a stray block).
 * The ops live in `xs-chart-fix/ops.ts`; nothing here redraws or regenerates a
 * design. A person or session LOOKS at every before/after before applying.
 *
 *   cd apps/web
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx --conditions=react-server \
 *     scripts/xs-chart-fix.ts fix <spec.json> --work <dir> [--only=a,b] [--sheet=name] [--grid]
 *   ... fix <spec.json> --work <dir> --out <archive-dir> --apply
 *   ... publish <spec.json> [--apply]
 *
 * spec.json: { "<slug>": { "ops": [Op, ...], "tags"?: ["<CollectionTag.slug>", ...] } }
 *
 * fix      dry run by default: writes <work>/fix/<slug>.ba.png (stored hero beside
 *          the re-render). --apply writes the row exactly as xs-bare-fabric-backfill
 *          does (data, metrics, NEW thumbnail Media, fingerprints) and records
 *          `generationMeta.chartFix`; the old chart is gzipped to <out>/backup and
 *          the before/after kept in <out>/before-after.
 * publish  only rows carrying `chartFix`: the duplicate guard against the PUBLIC
 *          catalogue, public-name uniqueness, then `keepCandidates` (PUBLIC, KEPT,
 *          search sync), shelf-derived (DERIVED) and title-keyword (BACKFILL) tags
 *          as the close-out did, the spec's own looked-at tags (VISION), and a
 *          search re-sync. The sitemap is dynamic, so it lists the row at once.
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: process.env.HOMEMADE_ENV_FILE ?? '../../.env.credentials', quiet: true })
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import sharp from 'sharp'
import { prisma, parsePatternData, computePatternMetrics, r2Upload, Visibility } from '@homemade/db'
import { keepCandidates } from '@/lib/studio/generation/bulk/candidates'
import { loadPublicCrossStitchFingerprints, findDuplicate } from '@/lib/studio/generation/bulk/dedupe-guard'
import type { ChartFingerprint } from '@/lib/studio/generation/bulk/similarity'
import { renderBeautyThumbnail, THUMB_TARGET } from '@/lib/studio/generation/bulk/beauty-thumbnail'
import { POST_SAT } from '@/lib/studio/generation/bulk/cross-stitch-style'
import { chartFingerprint, imageHash, sha256Hex } from '@/lib/studio/generation/bulk/similarity'
import { applyOps, gridView, type Op } from './xs-chart-fix/ops'

function flag(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const SCR = flag('work') ?? '../../scratchpad/xs-chart-fix'
const OUT = flag('out')
const BACKUP = `${OUT}/backup`
const BA = `${OUT}/before-after`
type Spec = Record<string, { ops: Op[]; tags?: string[] }>
interface GenMeta { brief?: { sat?: number }; chartFix?: unknown; [k: string]: unknown }
async function sideBySide(a: Buffer, b: Buffer, label: string): Promise<Buffer> {
  const S = 640
  const A = await sharp(a).resize(S, S, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#fff' }).png().toBuffer()
  const B = await sharp(b).resize(S, S, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#fff' }).png().toBuffer()
  const txt = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S * 2 + 10}" height="30"><text x="6" y="21" font-size="16" font-family="DejaVu Sans">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`)
  return sharp({ create: { width: S * 2 + 10, height: S + 30, channels: 3, background: '#ffffff' } })
    .composite([{ input: txt, left: 0, top: 0 }, { input: A, left: 0, top: 30 }, { input: B, left: S + 10, top: 30 }]).png().toBuffer()
}

async function cmdFix(spec: Spec): Promise<void> {
  const APPLY = process.argv.includes('--apply')
  if (APPLY && !OUT) throw new Error('--apply needs --out <archive-dir> for the backups and before/after images')
  const GRID = process.argv.includes('--grid')
  const only = (process.argv.find((a) => a.startsWith('--only='))?.slice(7) ?? '').split(',').filter(Boolean)
  mkdirSync(`${SCR}/fix`, { recursive: true })
  if (APPLY) { mkdirSync(BACKUP, { recursive: true }); mkdirSync(BA, { recursive: true }) }
  for (const [slug, s] of Object.entries(spec)) {
    if (only.length && !only.includes(slug)) continue
    const p = await prisma.pattern.findUnique({ where: { slug }, select: { id: true, name: true, data: true, generationMeta: true, thumbnailMediaId: true, visibility: true, thumbnail: { select: { r2Key: true } } } })
    if (!p) { console.log('missing', slug); continue }
    const gm = (p.generationMeta ?? {}) as GenMeta
    if (gm.chartFix) { console.log('already fixed', slug); continue }
    const before = parsePatternData(p.data)
    const after = applyOps(before, s.ops)
    const postSat = gm.brief?.sat != null ? 1 : POST_SAT
    const png = await renderBeautyThumbnail(after, postSat)
    const storedF = `${SCR}/view/${slug}.stored.png`
    let stored: Buffer
    if (existsSync(storedF)) stored = readFileSync(storedF)
    else { const r = await fetch(`${process.env.R2_PUBLIC_BASE_URL}/${p.thumbnail!.r2Key}`); stored = Buffer.from(await r.arrayBuffer()); mkdirSync(`${SCR}/view`, { recursive: true }); writeFileSync(storedF, stored) }
    const dCells = before.grid.cells.length - after.grid.cells.length
    const label = `${slug}  cells ${before.grid.cells.length}->${after.grid.cells.length}  bs ${before.grid.backstitch.length}->${after.grid.backstitch.length}  pal ${before.palette.length}->${after.palette.length}`
    writeFileSync(`${SCR}/fix/${slug}.ba.png`, await sideBySide(stored, png, label))
    writeFileSync(`${SCR}/fix/${slug}.after.png`, png)
    if (GRID) writeFileSync(`${SCR}/fix/${slug}.agrid.png`, await gridView(after, undefined, after.grid.width > 120 ? 6 : 10))
    console.log(label, `removed=${dCells}`)
    if (!APPLY) continue
    // ── write, exactly as the bare-fabric backfill does ──
    writeFileSync(`${BACKUP}/${slug}.json.gz`, gzipSync(JSON.stringify({ id: p.id, slug, thumbnailMediaId: p.thumbnailMediaId, data: p.data })))
    writeFileSync(`${BA}/${slug}.png`, await sideBySide(stored, png, `${slug}  before | after`))
    const m = computePatternMetrics(after)
    const meta = await sharp(png).metadata()
    const hashes = await imageHash(png)
    const { key } = await r2Upload(png, 'image/png', { prefix: 'pattern-thumbnails', filename: `${p.id}.png` })
    await prisma.$transaction(async (tx) => {
      const media = await tx.media.create({ data: { type: 'ILLUSTRATION', mimeType: 'image/png', r2Key: key, width: meta.width ?? THUMB_TARGET, height: meta.height ?? THUMB_TARGET, bytes: png.byteLength, status: 'READY', source: 'original', alt: `${p.name} cross-stitch chart` }, select: { id: true } })
      await tx.pattern.update({ where: { id: p.id }, select: { id: true }, data: {
        data: after as unknown as object, thumbnailMediaId: media.id,
        colourCount: m.colourCount, totalStitches: m.totalStitches, widthCells: m.widthCells, heightCells: m.heightCells,
        hasBackstitch: m.hasBackstitch, hasFrenchKnots: m.hasFrenchKnots, hasBeads: m.hasBeads, hasQuarterStitches: m.hasQuarterStitches,
        confettiShare: m.confettiShare, colourChangesPer100: m.colourChangesPer100, medianRunLength: m.medianRunLength, stitchability: m.stitchability,
        thumbnailSha256: sha256Hex(png), imageHash64: hashes.dhash64, imageHash256: hashes.dhash256, chartFingerprint: chartFingerprint(after) as unknown as object,
        generationMeta: { ...gm, chartFix: { at: new Date().toISOString(), by: 'xs-chart-fix', ops: s.ops, previousThumbnailMediaId: p.thumbnailMediaId, previousDataSha256: sha256Hex(Buffer.from(JSON.stringify(p.data))), backup: `${BACKUP}/${slug}.json.gz`, before: { cells: before.grid.cells.length, colours: before.palette.length }, after: { cells: after.grid.cells.length, colours: after.palette.length } } } as unknown as object,
      } })
    })
    console.log('  APPLIED', slug)
  }
  // pair sheets of before/after, two per image, for looking
  const tag = process.argv.find((a) => a.startsWith('--sheet='))?.slice(8)
  if (tag) {
    const files = Object.keys(spec).filter((k) => !only.length || only.includes(k)).map((k) => `${SCR}/fix/${k}.ba.png`).filter((f) => existsSync(f))
    for (let i = 0; i < files.length; i += 2) {
      const ims = files.slice(i, i + 2)
      const metas = await Promise.all(ims.map((f) => sharp(f).metadata()))
      const H = metas.reduce((a, m) => a + (m.height ?? 0), 0), W = Math.max(...metas.map((m) => m.width ?? 0))
      let y = 0
      await sharp({ create: { width: W, height: H, channels: 3, background: '#fff' } }).composite(ims.map((f, j) => { const o = { input: f, left: 0, top: y }; y += metas[j]!.height ?? 0; return o })).png().toFile(`${SCR}/fix/${tag}-${i / 2 + 1}.png`)
    }
    console.log(`sheets: ${Math.ceil(files.length / 2)} at ${SCR}/fix/${tag}-N.png`)
  }
}

/** Publish chart-fixed nearly-there rows the way a kept candidate is published, plus the close-out extras. */
const JUDGE = process.env.XS_CHART_FIX_JUDGE ?? 'xs-chart-fix'
async function shelfDerivedTags(shelf: string): Promise<string[]> {
  const ids = (await prisma.pattern.findMany({ where: { type: 'CROSS_STITCH', visibility: 'PUBLIC', ownerUserId: null, subCategory: { slug: shelf } }, select: { id: true } })).map((r) => r.id)
  if (ids.length < 5) return []
  const g = await prisma.collectionTagAssignment.groupBy({ by: ['tagId'], where: { contentType: 'CROSS_STITCH_PATTERN', source: 'DERIVED', contentId: { in: ids } }, _count: true })
  return g.filter((x) => x._count >= ids.length * 0.8).map((x) => x.tagId)
}
async function cmdPublish(spec: Spec): Promise<void> {
  const slugs = Object.keys(spec)
  const APPLY = process.argv.includes('--apply')
  const tags = await prisma.collectionTag.findMany({ select: { id: true, slug: true, aliases: true } })
  const words = tags.map((t) => ({ id: t.id, slug: t.slug, re: new RegExp(`\\b(${[t.slug.replace(/-/g, ' '), ...t.aliases].map((w) => w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})s?\\b`) }))
  const publicCat = await loadPublicCrossStitchFingerprints()
  const publicIds = new Set((await prisma.pattern.findMany({ where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC }, select: { id: true } })).map((r) => r.id))
  const catalogue = publicCat.filter((e) => publicIds.has(e.id))
  const publicNames = new Set((await prisma.pattern.findMany({ where: { type: 'CROSS_STITCH', visibility: 'PUBLIC' }, select: { name: true } })).map((r) => r.name.toLowerCase()))
  const shelfCache = new Map<string, string[]>()
  for (const slug of slugs) {
    const p = await prisma.pattern.findUnique({ where: { slug }, select: { id: true, name: true, visibility: true, candidateStatus: true, subjectKey: true, thumbnailSha256: true, imageHash64: true, imageHash256: true, chartFingerprint: true, generationMeta: true, subCategory: { select: { slug: true } } } })
    if (!p) { console.log(`MISSING ${slug}`); continue }
    if (!(p.generationMeta as GenMeta | null)?.chartFix) { console.log(`NOFIX ${slug} (chart not fixed; refusing)`); continue }
    if (p.visibility === 'PUBLIC') { console.log(`ALREADY ${slug}`); continue }
    const dup = findDuplicate({ sha256: p.thumbnailSha256!, dhash64: p.imageHash64!, dhash256: p.imageHash256!, chart: p.chartFingerprint as unknown as ChartFingerprint, subjectKey: p.subjectKey ?? '' }, catalogue)
    if (dup) { console.log(`DUPLICATE ${slug}: ${dup.reason} (${dup.slug})`); continue }
    if (publicNames.has(p.name.toLowerCase())) { console.log(`NAMECLASH ${slug}: "${p.name}"`); continue }
    const shelf = p.subCategory?.slug ?? ''
    if (!shelfCache.has(shelf)) shelfCache.set(shelf, await shelfDerivedTags(shelf))
    const derived = shelfCache.get(shelf)!
    const lname = p.name.toLowerCase()
    const backfill = words.filter((w) => w.re.test(lname) && !derived.includes(w.id)).map((w) => w.id)
    const vision = (spec[slug]?.tags ?? []).map((ts) => { const t = tags.find((x) => x.slug === ts); if (!t) throw new Error(`unknown tag ${ts}`); return t.id }).filter((id) => !derived.includes(id) && !backfill.includes(id))
    const tagSlugs = [...derived, ...backfill, ...vision].map((id) => tags.find((t) => t.id === id)!.slug)
    console.log(`${APPLY ? 'PUBLISH' : 'WOULD'} ${slug} [${shelf}] tags=${tagSlugs.join(',')}`)
    if (!APPLY) continue
    const out = await keepCandidates([slug], JUDGE)
    if (out.changed !== 1) { console.log('  keep outcome', JSON.stringify(out)); continue }
    await prisma.pattern.update({ where: { id: p.id }, select: { id: true }, data: { judgeReasons: ['kept after chart fix (nearly-there pass)'] } })
    if (derived.length) await prisma.collectionTagAssignment.createMany({ data: derived.map((tagId) => ({ tagId, contentType: 'CROSS_STITCH_PATTERN' as const, contentId: p.id, source: 'DERIVED' as const })), skipDuplicates: true })
    if (backfill.length) await prisma.collectionTagAssignment.createMany({ data: backfill.map((tagId) => ({ tagId, contentType: 'CROSS_STITCH_PATTERN' as const, contentId: p.id, source: 'BACKFILL' as const })), skipDuplicates: true })
    if (vision.length) await prisma.collectionTagAssignment.createMany({ data: vision.map((tagId) => ({ tagId, contentType: 'CROSS_STITCH_PATTERN' as const, contentId: p.id, source: 'VISION' as const })), skipDuplicates: true })
    // re-sync search so the doc carries the tags
    try {
      const { buildPatternDoc } = await import('@homemade/db/search-docs')
      const { syncPatternDoc } = await import('@homemade/search')
      const doc = await buildPatternDoc(p.id); if (doc) await syncPatternDoc(doc)
    } catch (e) { console.log('  search resync failed', e instanceof Error ? e.message : e) }
    publicNames.add(p.name.toLowerCase())
    catalogue.push({ id: p.id, slug, name: p.name, subjectKey: p.subjectKey, image: { sha256: p.thumbnailSha256!, dhash64: p.imageHash64!, dhash256: p.imageHash256!, chart: p.chartFingerprint as unknown as ChartFingerprint } })
  }
}

async function main(): Promise<void> {
  const [cmd, specPath] = process.argv.slice(2)
  if (!specPath || (cmd !== 'fix' && cmd !== 'publish')) throw new Error('usage: xs-chart-fix.ts fix|publish <spec.json> [flags]')
  const spec = JSON.parse(readFileSync(specPath, 'utf8')) as Spec
  if (cmd === 'fix') await cmdFix(spec)
  else await cmdPublish(spec)
  await prisma.$disconnect()
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })

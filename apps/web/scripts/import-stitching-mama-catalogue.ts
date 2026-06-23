/**
 * Phase C — Stitching Mama catalogue import.
 *
 * Walks every pattern folder on Rebecca's K: drive at
 * STITCHING_MAMA_SOURCE_ROOT, extracts the chart via the Ursa
 * Full-Color-PDF parser (apps/web/scripts/import-lib/parse-stitching-mama-pdf),
 * uploads the finished-piece hero photograph + up to 4 gallery photos
 * to R2, archives the source .CHART file into the repo, and writes
 * Pattern + PatternLicense rows. Also updates the Stitching Mama
 * Designer row with a full profile and flips the cross-stitch Category
 * isPublicVisible flag once at least one pattern lands.
 *
 * Idempotent — re-running upserts on Pattern.slug + PatternLicense
 * (one-per-pattern). Safe to run twice.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/import-stitching-mama-catalogue.ts
 *
 * The script ONLY reads from K: drive; it never modifies, moves, or
 * deletes anything in the source folder. Allow-list is hard-coded in the
 * file-collection helpers; anything not on the list is skipped.
 *
 * The Designer pseudonym is "Stitching Mama". No real-name reference
 * appears anywhere in this codebase — see project memory.
 */

import 'dotenv/config'
import { readdir, readFile, mkdir, copyFile, stat } from 'node:fs/promises'
import { join, basename } from 'node:path'

import sharp from 'sharp'

import {
  prisma,
  computePatternMetrics,
  Visibility,
  LicenseType,
} from '@homemade/db'

import { r2UploadScript as r2Upload } from './import-lib/r2-script'
import { parseStitchingMamaPdf, type ParsedStitchingMamaPattern } from './import-lib/parse-stitching-mama-pdf'
import { toPatternData, deriveDifficulty, deriveEstimatedHours, deriveRecommendedHoopInches } from './import-lib/to-pattern-data'
import { readCatalogue, STITCHING_MAMA_SOURCE_ROOT, type CatalogueEntry } from './import-lib/catalogue'
import { buildDescription } from './import-lib/describe'

const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : Infinity
const ONLY_ARG = process.argv.find(a => a.startsWith('--only='))
const ONLY = ONLY_ARG ? ONLY_ARG.split('=')[1].split(',') : null

const CHART_ARCHIVE_ROOT = join(
  process.cwd(),
  '..', '..', // apps/web → repo root
  'assets', 'stitching-mama-source-charts',
)

/** Designer bio in Homemade voice. No real-name reference; no marketing
 *  language; no em dashes. */
const DESIGNER_BIO = [
  'Stitching Mama designs counted cross-stitch charts: animals, florals,',
  'pride pieces, and short quote samplers. Charts are full cross, with',
  'tightly-judged DMC palettes and the finished-piece photograph on the',
  'cover so stitchers know what they are working towards. Beginner-friendly',
  'count, no specialty stitches.',
].join(' ')

const LICENSE_ATTRIBUTION = 'Pattern designed by Stitching Mama, available free at Homemade.education'

// ─────────────────────────────────────────────────────────────────────────
// File helpers
// ─────────────────────────────────────────────────────────────────────────

interface PatternFiles {
  stitchedJpgPath: string | null
  fullColorPdfPath: string | null
  patternKeeperPdfPath: string | null
  chartFilePath: string | null
  patternCoverPdfPath: string | null
  galleryJpgPaths: string[]
}

async function collectAllowListedFiles(entry: CatalogueEntry): Promise<PatternFiles> {
  const files: PatternFiles = {
    stitchedJpgPath: null,
    fullColorPdfPath: null,
    patternKeeperPdfPath: null,
    chartFilePath: null,
    patternCoverPdfPath: null,
    galleryJpgPaths: [],
  }
  const top = await readdir(entry.folderPath, { withFileTypes: true })
  for (const f of top) {
    if (f.isFile()) {
      const lower = f.name.toLowerCase()
      if (lower.endsWith(' stitched.jpg')) files.stitchedJpgPath = join(entry.folderPath, f.name)
      else if (lower.startsWith('pattern -') && lower.includes('full color') && lower.endsWith('.pdf')) files.fullColorPdfPath = join(entry.folderPath, f.name)
      else if (lower.startsWith('pattern -') && lower.includes('pattern keeper') && lower.endsWith('.pdf')) files.patternKeeperPdfPath = join(entry.folderPath, f.name)
    } else if (f.isDirectory()) {
      const sub = join(entry.folderPath, f.name)
      if (f.name === 'Components') {
        const sf = await readdir(sub, { withFileTypes: true })
        for (const cf of sf) {
          if (!cf.isFile()) continue
          if (cf.name.toLowerCase().endsWith('.chart')) {
            files.chartFilePath = join(sub, cf.name)
          } else if (cf.name.startsWith('Pattern Cover - ') && cf.name.toLowerCase().endsWith('.pdf')) {
            files.patternCoverPdfPath = join(sub, cf.name)
          }
        }
      } else if (f.name === 'Etsy Photo Listings' || f.name === 'Etsy Listing Photos') {
        const gf = await readdir(sub, { withFileTypes: true })
        for (const g of gf) {
          if (!g.isFile()) continue
          const lower = g.name.toLowerCase()
          if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
            files.galleryJpgPaths.push(join(sub, g.name))
          }
        }
      }
      // All other directories deliberately not descended into.
    }
  }
  return files
}

// ─────────────────────────────────────────────────────────────────────────
// Image processing
// ─────────────────────────────────────────────────────────────────────────

const HERO_LONG_EDGE_PX = 1600
const GALLERY_LONG_EDGE_PX = 1200

async function processHeroJpg(srcPath: string): Promise<{ buf: Buffer; width: number; height: number; bytes: number }> {
  const raw = await readFile(srcPath)
  const out = await sharp(raw)
    .rotate()
    .resize({ width: HERO_LONG_EDGE_PX, height: HERO_LONG_EDGE_PX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer({ resolveWithObject: true })
  return {
    buf: out.data,
    width: out.info.width,
    height: out.info.height,
    bytes: out.info.size,
  }
}

async function processGalleryJpg(srcPath: string): Promise<{ buf: Buffer; width: number; height: number; bytes: number }> {
  const raw = await readFile(srcPath)
  const out = await sharp(raw)
    .rotate()
    .resize({ width: GALLERY_LONG_EDGE_PX, height: GALLERY_LONG_EDGE_PX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer({ resolveWithObject: true })
  return { buf: out.data, width: out.info.width, height: out.info.height, bytes: out.info.size }
}

interface UploadedMedia {
  mediaId: string
}

async function uploadHeroAndCreateMedia(
  srcPath: string,
  altText: string,
  slug: string,
): Promise<UploadedMedia> {
  const processed = await processHeroJpg(srcPath)
  if (DRY_RUN) {
    console.log(`   DRY hero: ${processed.width}×${processed.height} ${(processed.bytes/1024).toFixed(0)} KB`)
    return { mediaId: 'DRY_RUN_HERO_' + slug }
  }
  const { key } = await r2Upload(processed.buf, 'image/jpeg', {
    filename: basename(srcPath),
    prefix: `patterns/${slug}/hero`,
  })
  const media = await prisma.media.create({
    data: {
      type: 'PHOTO',
      mimeType: 'image/jpeg',
      filename: basename(srcPath),
      alt: altText,
      width: processed.width,
      height: processed.height,
      bytes: processed.bytes,
      status: 'READY',
      r2Key: key,
      source: 'original',
      creatorName: 'Stitching Mama',
      requiresAttribution: false,
    },
    select: { id: true },
  })
  return { mediaId: media.id }
}

async function uploadGalleryPhoto(
  srcPath: string,
  altText: string,
  slug: string,
  index: number,
): Promise<UploadedMedia> {
  const processed = await processGalleryJpg(srcPath)
  if (DRY_RUN) {
    console.log(`   DRY gallery[${index}]: ${processed.width}×${processed.height} ${(processed.bytes/1024).toFixed(0)} KB`)
    return { mediaId: `DRY_RUN_GALLERY_${slug}_${index}` }
  }
  const { key } = await r2Upload(processed.buf, 'image/jpeg', {
    filename: basename(srcPath),
    prefix: `patterns/${slug}/gallery`,
  })
  const media = await prisma.media.create({
    data: {
      type: 'PHOTO',
      mimeType: 'image/jpeg',
      filename: basename(srcPath),
      alt: altText,
      width: processed.width,
      height: processed.height,
      bytes: processed.bytes,
      status: 'READY',
      r2Key: key,
      source: 'original',
      creatorName: 'Stitching Mama',
      requiresAttribution: false,
    },
    select: { id: true },
  })
  return { mediaId: media.id }
}

/** Pick up to 4 gallery photos from the candidate list, biasing for
 *  diversity by spacing through the available files. */
function pickGalleryPhotos(candidates: string[]): string[] {
  if (candidates.length <= 4) return candidates
  // Even-spacing pick of 4 across the sorted candidate list.
  const sorted = candidates.slice().sort()
  const out: string[] = []
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor((i + 0.5) * sorted.length / 4)
    out.push(sorted[idx])
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────
// Designer update
// ─────────────────────────────────────────────────────────────────────────

async function ensureDesigner(): Promise<{ id: string; slug: string }> {
  if (DRY_RUN) return { id: 'DRY_RUN_DESIGNER', slug: 'stitching-mama' }
  return prisma.designer.upsert({
    where: { slug: 'stitching-mama' },
    // Stitching Mama is an INDEPENDENT designer, not the Homemade house label.
    // isHouseDesigner MUST stay false: the content gate keys premium status on
    // it (non-house designer ⇒ premium content), and the designer spotlight
    // only ever features non-house designers. Flipping this to true would
    // silently make all ~38 patterns read as free.
    create: {
      slug: 'stitching-mama',
      displayName: 'Stitching Mama',
      bio: DESIGNER_BIO,
      isHouseDesigner: false,
    },
    update: {
      displayName: 'Stitching Mama',
      bio: DESIGNER_BIO,
      isHouseDesigner: false,
    },
    select: { id: true, slug: true },
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-categories
// ─────────────────────────────────────────────────────────────────────────

async function loadSubCategoryMap(): Promise<Map<string, string>> {
  if (DRY_RUN) {
    return new Map([
      ['animals', 'DRY_RUN_ANIMALS'],
      ['florals', 'DRY_RUN_FLORALS'],
      ['quotes-and-sayings', 'DRY_RUN_QUOTES'],
      ['pride-and-inclusive', 'DRY_RUN_PRIDE'],
    ])
  }
  const rows = await prisma.subCategory.findMany({
    where: { category: { slug: 'cross-stitch' } },
    select: { id: true, slug: true },
  })
  return new Map(rows.map(r => [r.slug, r.id]))
}

// ─────────────────────────────────────────────────────────────────────────
// .CHART archive
// ─────────────────────────────────────────────────────────────────────────

async function archiveChartFile(chartPath: string, slug: string): Promise<void> {
  await mkdir(CHART_ARCHIVE_ROOT, { recursive: true })
  const dst = join(CHART_ARCHIVE_ROOT, `${slug}.CHART`)
  try {
    const dstStat = await stat(dst)
    const srcStat = await stat(chartPath)
    if (dstStat.size === srcStat.size) return // already archived
  } catch { /* not present, will copy */ }
  await copyFile(chartPath, dst)
}

// ─────────────────────────────────────────────────────────────────────────
// Per-pattern import
// ─────────────────────────────────────────────────────────────────────────

interface ImportOutcome {
  entry: CatalogueEntry
  ok: boolean
  reason?: string
  parsed?: ParsedStitchingMamaPattern
  patternId?: string
  matchedCells?: number
  paletteSize?: number
  warnings: string[]
}

async function importPattern(
  entry: CatalogueEntry,
  designerId: string,
  subCatMap: Map<string, string>,
): Promise<ImportOutcome> {
  const outcome: ImportOutcome = { entry, ok: false, warnings: [] }
  console.log(`\n→ ${entry.theme}: ${entry.name} (${entry.slug})`)

  // 1. Collect allow-listed files
  const files = await collectAllowListedFiles(entry)
  if (!files.fullColorPdfPath) {
    outcome.reason = 'no Full Color PDF found'
    return outcome
  }
  // Fall back to the first Etsy Listing Photo when no top-level
  // <name> stitched.jpg exists. A handful of Stitching Mama's older
  // listings ship the finished-piece photo only in the Etsy folder.
  if (!files.stitchedJpgPath && files.galleryJpgPaths.length > 0) {
    const fallback = files.galleryJpgPaths.slice().sort()[0]
    files.stitchedJpgPath = fallback
    outcome.warnings.push(`no top-level stitched.jpg; using ${basename(fallback)} from Etsy Listing Photos as hero`)
  }
  if (!files.stitchedJpgPath) {
    outcome.reason = 'no stitched.jpg or fallback photo found'
    return outcome
  }

  // 2. Parse chart
  let parsed: ParsedStitchingMamaPattern
  try {
    const pdfBuffer = await readFile(files.fullColorPdfPath)
    parsed = await parseStitchingMamaPdf(pdfBuffer)
  } catch (err) {
    outcome.reason = `parse failed: ${(err as Error).message}`
    return outcome
  }
  outcome.parsed = parsed
  outcome.matchedCells = parsed.cells.length
  outcome.paletteSize = parsed.palette.length

  if (parsed.gridWidth === 0 || parsed.gridHeight === 0) {
    outcome.reason = `parse failed: grid dimensions zero (${parsed.gridWidth}x${parsed.gridHeight})`
    return outcome
  }
  if (parsed.palette.length === 0) {
    outcome.reason = 'parse failed: empty palette'
    return outcome
  }
  if (parsed.cells.length < 100) {
    outcome.reason = `parse failed: too few matched cells (${parsed.cells.length})`
    return outcome
  }

  const yearMatch = parsed.copyrightLine?.match(/©\s*(\d{4})/)
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null

  // 3. Build Pattern.data + Zod validate
  let patternData
  try {
    patternData = toPatternData(parsed, {
      designer: 'Stitching Mama',
      year,
      license: 'Homemade Library — free with attribution',
    })
  } catch (err) {
    outcome.reason = `Zod validation failed: ${(err as Error).message}`
    return outcome
  }
  const metrics = computePatternMetrics(patternData)
  const difficulty = deriveDifficulty(parsed)
  const estimatedHours = deriveEstimatedHours(parsed, difficulty)
  const hoopInches = deriveRecommendedHoopInches(parsed)
  const description = buildDescription(entry, parsed)
  const subCategoryId = subCatMap.get(entry.subCategorySlug) ?? null
  if (!subCategoryId) {
    outcome.warnings.push(`no sub-category found for slug ${entry.subCategorySlug}`)
  }

  console.log(`   parsed: ${metrics.widthCells}×${metrics.heightCells}, ${metrics.colourCount} colours, ${metrics.totalStitches.toLocaleString()} stitches, ${difficulty}`)

  // 4. Hero upload
  console.log(`   uploading hero…`)
  const heroAlt = `${entry.name} cross-stitch design by Stitching Mama, finished piece`
  const hero = await uploadHeroAndCreateMedia(files.stitchedJpgPath, heroAlt, entry.slug)

  // 5. Gallery upload
  const galleryPicks = pickGalleryPhotos(files.galleryJpgPaths)
  console.log(`   uploading ${galleryPicks.length} gallery photos…`)
  const galleryMediaIds: string[] = []
  for (let i = 0; i < galleryPicks.length; i++) {
    const alt = `${entry.name} cross-stitch, alternative view ${i + 1}`
    const u = await uploadGalleryPhoto(galleryPicks[i], alt, entry.slug, i)
    galleryMediaIds.push(u.mediaId)
  }

  // 6. .CHART archive (best-effort; missing source file is a warning, not failure)
  if (files.chartFilePath) {
    try { await archiveChartFile(files.chartFilePath, entry.slug) }
    catch (err) { outcome.warnings.push(`.CHART archive failed: ${(err as Error).message}`) }
  } else {
    outcome.warnings.push('no .CHART source file found in Components/')
  }

  if (DRY_RUN) {
    outcome.ok = true
    outcome.patternId = 'DRY_RUN_' + entry.slug
    return outcome
  }

  // 7. Upsert Pattern + PatternLicense in a single transaction
  const pattern = await prisma.pattern.upsert({
    where: { slug: entry.slug },
    create: {
      slug: entry.slug,
      type: 'CROSS_STITCH',
      name: entry.name,
      description,
      data: patternData as unknown as object,
      thumbnailMediaId: hero.mediaId,
      heroMediaId: hero.mediaId,
      galleryMediaIds: galleryMediaIds,
      widthCells: metrics.widthCells,
      heightCells: metrics.heightCells,
      colourCount: metrics.colourCount,
      totalStitches: metrics.totalStitches,
      designerId,
      subCategoryId,
      difficulty,
      estimatedHours,
      premium: false,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date('2026-06-08T12:00:00Z'),
      hasBackstitch: metrics.hasBackstitch,
      hasFrenchKnots: metrics.hasFrenchKnots,
      hasBeads: metrics.hasBeads,
      hasQuarterStitches: metrics.hasQuarterStitches,
      fabricCountSuggested: parsed.fabricCount,
      recommendedHoopInches: hoopInches ?? undefined,
    },
    update: {
      name: entry.name,
      description,
      data: patternData as unknown as object,
      thumbnailMediaId: hero.mediaId,
      heroMediaId: hero.mediaId,
      galleryMediaIds: galleryMediaIds,
      widthCells: metrics.widthCells,
      heightCells: metrics.heightCells,
      colourCount: metrics.colourCount,
      totalStitches: metrics.totalStitches,
      designerId,
      subCategoryId,
      difficulty,
      estimatedHours,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date('2026-06-08T12:00:00Z'),
      hasBackstitch: metrics.hasBackstitch,
      hasFrenchKnots: metrics.hasFrenchKnots,
      hasBeads: metrics.hasBeads,
      hasQuarterStitches: metrics.hasQuarterStitches,
      fabricCountSuggested: parsed.fabricCount,
      recommendedHoopInches: hoopInches ?? undefined,
    },
    select: { id: true, slug: true },
  })

  await prisma.patternLicense.upsert({
    where: { patternId: pattern.id },
    create: {
      patternId: pattern.id,
      licenseType: LicenseType.LIBRARY_FREE,
      attributionRequired: true,
      commercialUseAllowed: false,
      redistributionAllowed: false,
      attributionText: LICENSE_ATTRIBUTION,
    },
    update: {
      licenseType: LicenseType.LIBRARY_FREE,
      attributionRequired: true,
      commercialUseAllowed: false,
      redistributionAllowed: false,
      attributionText: LICENSE_ATTRIBUTION,
    },
  })

  outcome.ok = true
  outcome.patternId = pattern.id
  console.log(`   ✓ Pattern ${pattern.id}, hero ${hero.mediaId}, ${galleryMediaIds.length} gallery`)
  return outcome
}

// ─────────────────────────────────────────────────────────────────────────
// Phase B demo license backfill
// ─────────────────────────────────────────────────────────────────────────

async function backfillPhaseBDemoLicenses(): Promise<number> {
  if (DRY_RUN) return 0
  const demos = await prisma.pattern.findMany({
    where: { slug: { in: ['demo-blue-hydrangea', 'demo-pink-peony', 'demo-african-elephant'] } },
    select: { id: true, slug: true, license: { select: { id: true } } },
  })
  let added = 0
  for (const p of demos) {
    if (p.license) continue
    await prisma.patternLicense.create({
      data: {
        patternId: p.id,
        licenseType: LicenseType.LIBRARY_FREE,
        attributionRequired: true,
        commercialUseAllowed: true, // Wikimedia photos are commercial-OK
        redistributionAllowed: false,
        attributionText: 'Photo from Wikimedia Commons (CC). Chart generated via the Homemade photo-to-chart pipeline.',
      },
    })
    added++
  }
  return added
}

// ─────────────────────────────────────────────────────────────────────────
// Cross-stitch category visibility flip
// ─────────────────────────────────────────────────────────────────────────

async function flipCategoryVisibility(): Promise<void> {
  if (DRY_RUN) return
  // The column may be named isPublicVisible or publiclyVisible; try both.
  await prisma.category.update({
    where: { slug: 'cross-stitch' },
    data: { isPublicVisible: true } as never,
  }).catch(async () => {
    await prisma.category.update({
      where: { slug: 'cross-stitch' },
      data: { publiclyVisible: true } as never,
    })
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Phase C — Stitching Mama catalogue import ${DRY_RUN ? '[DRY RUN]' : ''}`)
  console.log(`Source: ${STITCHING_MAMA_SOURCE_ROOT}`)

  // 1. Catalogue
  let entries = await readCatalogue(STITCHING_MAMA_SOURCE_ROOT)
  if (ONLY) entries = entries.filter(e => ONLY.includes(e.slug))
  if (entries.length > LIMIT) entries = entries.slice(0, LIMIT)
  console.log(`Catalogue: ${entries.length} pattern(s) to import\n`)

  // 2. Designer
  const designer = await ensureDesigner()
  console.log(`Designer: ${designer.slug} (${designer.id})`)

  // 3. Sub-category map
  const subCatMap = await loadSubCategoryMap()
  console.log(`Sub-categories: ${[...subCatMap.keys()].join(', ')}`)

  // 4. Per-pattern import
  const outcomes: ImportOutcome[] = []
  for (const entry of entries) {
    try {
      const o = await importPattern(entry, designer.id, subCatMap)
      outcomes.push(o)
    } catch (err) {
      console.error(`   ✗ ${entry.slug} threw:`, (err as Error).message)
      outcomes.push({ entry, ok: false, reason: `threw: ${(err as Error).message}`, warnings: [] })
    }
  }

  // 5. Phase B demo license backfill
  console.log(`\nBackfilling Phase B demo licenses…`)
  const backfilled = await backfillPhaseBDemoLicenses()
  console.log(`   backfilled ${backfilled} license rows`)

  // 6. Category visibility flip — only if any patterns landed
  const succeeded = outcomes.filter(o => o.ok)
  if (succeeded.length > 0) {
    console.log(`\nFlipping cross-stitch category isPublicVisible=true…`)
    try { await flipCategoryVisibility() } catch (err) {
      console.error('   ✗ visibility flip failed:', (err as Error).message)
    }
  }

  // 7. Refresh Designer.patternCount
  if (!DRY_RUN) {
    const count = await prisma.pattern.count({
      where: { designerId: designer.id, visibility: 'PUBLIC' },
    })
    await prisma.designer.update({
      where: { id: designer.id },
      data: { patternCount: count },
    })
    console.log(`\nDesigner.patternCount → ${count}`)
  }

  // 8. Summary
  console.log(`\n--- Summary ---`)
  console.log(`Total processed: ${outcomes.length}`)
  console.log(`Imported:        ${succeeded.length}`)
  console.log(`Failed/skipped:  ${outcomes.length - succeeded.length}`)
  for (const o of outcomes.filter(o => !o.ok)) {
    console.log(`  ✗ ${o.entry.slug}: ${o.reason}`)
  }
  const warnings = outcomes.flatMap(o => o.warnings.map(w => `${o.entry.slug}: ${w}`))
  if (warnings.length) {
    console.log(`\nWarnings:`)
    for (const w of warnings) console.log(`  ! ${w}`)
  }
  // Per-sub-cat counts
  const subCatCounts = new Map<string, number>()
  for (const o of succeeded) {
    subCatCounts.set(o.entry.subCategorySlug, (subCatCounts.get(o.entry.subCategorySlug) ?? 0) + 1)
  }
  console.log(`\nSub-category counts (Stitching Mama only):`)
  for (const [k, v] of subCatCounts) console.log(`  ${k}: ${v}`)
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(async () => {
    if (!DRY_RUN) {
      try { await prisma.$disconnect() } catch { /* DATABASE_URL missing in dry-run + similar — safe to ignore */ }
    }
  })

/**
 * Pipeline B — Fal img2img hero generation with synthetic-source control.
 *
 * For each candidate Pattern (cross-stitch) or CrochetPattern, this script:
 *   1. Renders the synthetic chart image from chartData (the truth).
 *   2. Uploads the synthetic to R2 as a public control image.
 *   3. Sends it to Fal FLUX.1-dev image-to-image at denoise 0.4 with the
 *      pattern-specific prompt.
 *   4. Downloads the Fal output, computes dHash + histogram cosine
 *      against the synthetic, decides pass / fail.
 *   5. On pass: uploads the Fal output to R2, creates a Media row, sets
 *      heroMediaId, sets heroGenerationStatus = SUCCESS.
 *   6. On fail: retries once at denoise 0.3.
 *   7. On second fail: marks heroGenerationStatus = SYNTHETIC_FALLBACK
 *      (renderer falls through to thumbnail per Option B).
 *
 * Supports both crafts via --craft:
 *   --craft cross-stitch    Pattern rows (Stitching Mama + future Studio).
 *                            Uses renderPatternSvgString in 'beauty' mode
 *                            (the existing finished-piece renderer).
 *   --craft crochet         CrochetPattern rows. SCAFFOLDED — the crochet
 *                            synthetic finished-piece renderer is not yet
 *                            implemented; the script throws if called
 *                            without --skip-synthetic-check.
 *
 * Filters:
 *   --sample-count N        Process only the first N matching rows. Cheap
 *                            sanity-check for new prompts / new endpoints.
 *   --slug X                Process only the row with slug X.
 *   --force                 Reprocess rows that already have a SUCCESS or
 *                            SYNTHETIC_FALLBACK heroGenerationStatus.
 *
 * Behaviour:
 *   --dry-run               No Fal calls; renders synthetic + prints prompts.
 *   --no-swap               Generates + saves Media but never updates
 *                            heroMediaId. Use for retrofit preview runs
 *                            where Rebecca eyeballs the Fal outputs before
 *                            authorising the swap.
 *   --confirm               Required for any real-spend run.
 *
 * Cost: ~£0.02 per hero at FLUX.1-dev. The script caps spend by counting
 * Fal calls and exiting if it would cross --max-spend (default £4).
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import sharp from 'sharp'
import { r2Upload } from '../src/r2.js'
import {
  generateWithFluxImg2Img,
  FluxBillingError,
} from '../../../apps/web/src/lib/image-sourcing/flux-img2img.js'
import { renderPatternSvgString } from '../../../apps/web/src/components/studio/chart/render-svg-string.js'
import type { PatternData } from '../src/pattern.js'
import { verifyAgainstControl } from './lib/image-verification.js'

const DRY_RUN = process.argv.includes('--dry-run')
const CONFIRM = process.argv.includes('--confirm')
const FORCE = process.argv.includes('--force')
const NO_SWAP = process.argv.includes('--no-swap')

const CRAFT_INDEX = process.argv.indexOf('--craft')
const CRAFT = CRAFT_INDEX >= 0 ? process.argv[CRAFT_INDEX + 1] : null
const SLUG_INDEX = process.argv.indexOf('--slug')
const ONLY_SLUG = SLUG_INDEX >= 0 ? process.argv[SLUG_INDEX + 1] : null
const SAMPLE_INDEX = process.argv.indexOf('--sample-count')
const SAMPLE_COUNT = SAMPLE_INDEX >= 0 ? Number(process.argv[SAMPLE_INDEX + 1] ?? 0) : 0
const SPEND_INDEX = process.argv.indexOf('--max-spend')
const MAX_SPEND_GBP = SPEND_INDEX >= 0 ? Number(process.argv[SPEND_INDEX + 1] ?? 4) : 4

const COST_PER_CALL_GBP = 0.02

if (!CRAFT || !['cross-stitch', 'crochet'].includes(CRAFT)) {
  console.error('[hero-img2img] --craft cross-stitch|crochet required.')
  process.exit(2)
}
if (!DRY_RUN && !CONFIRM) {
  console.error('[hero-img2img] Pass --dry-run to preview, --confirm to spend.')
  process.exit(2)
}

async function svgToPng(svg: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(svg)).resize(size, size, { fit: 'inside' }).png().toBuffer()
}

function buildCrochetPrompt(pattern: { name: string; description: string | null }): string {
  const subject = pattern.name
  const desc = pattern.description?.slice(0, 200) ?? ''
  return (
    'Close-up photograph of finished crochet, natural fibre yarn, individual stitches visible with thread texture, ' +
    'soft daylight, gentle fabric drape, professional handmade craft photography. ' +
    `Subject: ${subject}. ${desc}`
  )
}

function buildCrossStitchPrompt(pattern: {
  name: string
  description: string | null
  fabricCountSuggested: number
}): string {
  const subject = pattern.name
  return (
    'Editorial photograph of finished cross-stitch on linen aida fabric, individual X-stitches in cotton floss clearly visible, ' +
    'soft warm daylight, slight fabric texture, magazine-quality slow-living craft photography. ' +
    `Subject: ${subject}. ${pattern.fabricCountSuggested}-count aida.`
  )
}

const NEGATIVE_PROMPT =
  'blurry, plastic, low quality, watermark, text, marketing graphic, render, ' +
  'digital, illustration, painting, sketch, 3d, cgi'

interface ProcessOutcome {
  slug: string
  status: 'SUCCESS' | 'SYNTHETIC_FALLBACK' | 'FAILED_VERIFICATION' | 'DRY_RUN' | 'SKIPPED' | 'ERROR'
  details: string
  controlMediaUrl?: string
  falMediaId?: string
  verification?: string
  costSpentGBP?: number
}

interface RunStats {
  processed: number
  success: number
  syntheticFallback: number
  failed: number
  skipped: number
  errors: number
  costGBP: number
  samples: ProcessOutcome[]
}

async function processOne(
  prisma: typeof import('../src/index.js').prisma,
  craft: 'cross-stitch' | 'crochet',
  row: {
    id: string
    slug: string | null
    name: string
    description: string | null
    data?: PatternData | null
    chartData?: unknown
    fabricCountSuggested?: number
    heroMediaId: string | null
    thumbnailMediaId: string | null
    heroGenerationStatus: string
  },
  stats: RunStats,
): Promise<ProcessOutcome> {
  const slug = row.slug ?? row.id

  if (!FORCE && row.heroGenerationStatus !== 'PENDING' && row.heroGenerationStatus !== 'RUNNING') {
    return { slug, status: 'SKIPPED', details: `already ${row.heroGenerationStatus}` }
  }

  // ── Step 1: render synthetic ──
  let synthPng: Buffer
  if (craft === 'cross-stitch') {
    if (!row.data) {
      return { slug, status: 'SKIPPED', details: 'no PatternData on Pattern.data' }
    }
    const svg = renderPatternSvgString(row.data, { mode: 'beauty', cellPx: 18 })
    synthPng = await svgToPng(svg, 1024)
  } else {
    // crochet — finished-piece synthetic renderer is not yet implemented.
    // The CraftChart renderer produces a working chart (glyphs on a grid),
    // not the finished motif view. When the crochet synthetic renderer
    // ships, drop it in here.
    return {
      slug,
      status: 'SKIPPED',
      details: 'crochet finished-piece synthetic renderer not implemented yet (waiting on Worker C content)',
    }
  }

  // ── Step 2: upload synthetic to R2 as the control image ──
  const controlFilename = `${slug}-control.png`
  let controlUrl: string
  let controlMediaId: string
  try {
    const { publicUrl, key } = await r2Upload(synthPng, 'image/png', {
      filename: controlFilename,
      prefix: 'hero-control',
    })
    controlUrl = publicUrl
    const controlMedia = await prisma.media.create({
      data: {
        r2Key: key,
        type: 'DIAGRAM',
        status: 'READY',
        filename: controlFilename,
        mimeType: 'image/png',
        alt: `${row.name} chart render (control image for img2img)`,
        width: 1024,
        height: 1024,
        bytes: synthPng.length,
        source: 'in-house-chart-engine',
        licenceCode: 'PROPRIETARY',
        requiresAttribution: false,
        verificationStatus: 'VERIFIED',
        verificationReason: 'Synthetic chart render, geometric truth.',
        verifiedAt: new Date(),
      },
    })
    controlMediaId = controlMedia.id
  } catch (err) {
    return { slug, status: 'ERROR', details: `control upload failed: ${err instanceof Error ? err.message : String(err)}` }
  }

  if (DRY_RUN) {
    return {
      slug,
      status: 'DRY_RUN',
      details: 'control uploaded; Fal call skipped',
      controlMediaUrl: controlUrl,
    }
  }

  // ── Step 3: Fal img2img — primary + retry ──
  const prompt =
    craft === 'cross-stitch'
      ? buildCrossStitchPrompt({
          name: row.name,
          description: row.description,
          fabricCountSuggested: row.fabricCountSuggested ?? 14,
        })
      : buildCrochetPrompt({ name: row.name, description: row.description })

  await prisma.pattern
    .update({ where: { id: row.id }, data: { heroGenerationStatus: 'RUNNING' } })
    .catch(() => {})

  let lastVerification = ''
  for (const [attemptIndex, strength] of [
    [1, 0.4],
    [2, 0.3],
  ] as const) {
    const projectedSpend = stats.costGBP + COST_PER_CALL_GBP
    if (projectedSpend > MAX_SPEND_GBP) {
      return {
        slug,
        status: 'ERROR',
        details: `would cross max-spend cap of £${MAX_SPEND_GBP.toFixed(2)} (currently £${stats.costGBP.toFixed(2)})`,
        controlMediaUrl: controlUrl,
      }
    }

    let falResult
    try {
      falResult = await generateWithFluxImg2Img({
        imageUrl: controlUrl,
        prompt,
        negativePrompt: NEGATIVE_PROMPT,
        strength,
        imageSize: 'square_hd',
      })
    } catch (err) {
      if (err instanceof FluxBillingError) {
        return {
          slug,
          status: 'ERROR',
          details: 'fal billing exhausted',
          controlMediaUrl: controlUrl,
          costSpentGBP: COST_PER_CALL_GBP,
        }
      }
      throw err
    }
    stats.costGBP += COST_PER_CALL_GBP

    if (!falResult) {
      lastVerification = `attempt ${attemptIndex} (strength ${strength}): fal returned null`
      continue
    }

    // ── Download Fal output ──
    const dl = await fetch(falResult.url)
    if (!dl.ok) {
      lastVerification = `attempt ${attemptIndex}: download failed http ${dl.status}`
      continue
    }
    const falBuf = Buffer.from(await dl.arrayBuffer())

    // ── Verify ──
    const verification = await verifyAgainstControl(synthPng, falBuf)
    lastVerification = `attempt ${attemptIndex} (strength ${strength}): ${verification.summary}`

    if (!verification.passed) {
      continue
    }

    // ── Pass: upload Fal output + create Media + maybe swap hero ──
    const falFilename = `${slug}-hero.png`
    const { key: falKey } = await r2Upload(falBuf, 'image/png', {
      filename: falFilename,
      prefix: 'pattern-heroes',
    })
    const falMedia = await prisma.media.create({
      data: {
        r2Key: falKey,
        type: 'PHOTO',
        status: 'READY',
        filename: falFilename,
        mimeType: 'image/png',
        alt: `${row.name} finished piece`,
        width: falResult.width,
        height: falResult.height,
        bytes: falBuf.length,
        source: 'flux-dev-img2img',
        sourceUrl: falResult.pageUrl,
        licenceCode: 'PROPRIETARY',
        requiresAttribution: false,
        verificationStatus: 'VERIFIED',
        verificationReason: `Fal img2img output passed structural gate: ${verification.summary}.`,
        verifiedAt: new Date(),
      },
    })

    if (!NO_SWAP && craft === 'cross-stitch') {
      await prisma.pattern.update({
        where: { id: row.id },
        data: { heroMediaId: falMedia.id, heroGenerationStatus: 'SUCCESS' },
      })
    } else if (!NO_SWAP && craft === 'crochet') {
      await prisma.crochetPattern.update({
        where: { id: row.id },
        data: { heroMediaId: falMedia.id, heroGenerationStatus: 'SUCCESS' },
      })
    } else {
      // --no-swap: keep existing hero, just record the status outcome.
      const targetUpdate = { heroGenerationStatus: 'SUCCESS' as const }
      if (craft === 'cross-stitch') {
        await prisma.pattern.update({ where: { id: row.id }, data: targetUpdate })
      } else {
        await prisma.crochetPattern.update({ where: { id: row.id }, data: targetUpdate })
      }
    }

    return {
      slug,
      status: 'SUCCESS',
      details: NO_SWAP ? 'verified pass; Media saved but heroMediaId untouched (--no-swap)' : 'verified pass; hero swapped',
      controlMediaUrl: controlUrl,
      falMediaId: falMedia.id,
      verification: verification.summary,
      costSpentGBP: COST_PER_CALL_GBP * attemptIndex,
    }
  }

  // ── Both attempts failed verification ──
  const fallbackStatus = 'SYNTHETIC_FALLBACK' as const
  if (craft === 'cross-stitch') {
    await prisma.pattern.update({ where: { id: row.id }, data: { heroGenerationStatus: fallbackStatus } })
  } else {
    await prisma.crochetPattern.update({ where: { id: row.id }, data: { heroGenerationStatus: fallbackStatus } })
  }

  return {
    slug,
    status: 'SYNTHETIC_FALLBACK',
    details: lastVerification,
    controlMediaUrl: controlUrl,
    costSpentGBP: COST_PER_CALL_GBP * 2,
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  if (!DRY_RUN && !process.env.FAL_KEY) {
    console.error('[hero-img2img] FAL_KEY missing in env.')
    process.exit(2)
  }

  const stats: RunStats = {
    processed: 0,
    success: 0,
    syntheticFallback: 0,
    failed: 0,
    skipped: 0,
    errors: 0,
    costGBP: 0,
    samples: [],
  }

  let rows: Array<{
    id: string
    slug: string | null
    name: string
    description: string | null
    data?: PatternData | null
    chartData?: unknown
    fabricCountSuggested?: number
    heroMediaId: string | null
    thumbnailMediaId: string | null
    heroGenerationStatus: string
  }> = []

  if (CRAFT === 'cross-stitch') {
    const where: Record<string, unknown> = { visibility: 'PUBLIC' }
    if (ONLY_SLUG) where.slug = ONLY_SLUG
    const fetched = await prisma.pattern.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        data: true,
        fabricCountSuggested: true,
        heroMediaId: true,
        thumbnailMediaId: true,
        heroGenerationStatus: true,
      },
      orderBy: { publishedAt: 'desc' },
    })
    rows = fetched.map((f) => ({
      ...f,
      data: f.data as unknown as PatternData,
    }))
  } else {
    const where: Record<string, unknown> = { visibility: 'PUBLIC' }
    if (ONLY_SLUG) where.slug = ONLY_SLUG
    rows = await prisma.crochetPattern.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        chartData: true,
        heroMediaId: true,
        thumbnailMediaId: true,
        heroGenerationStatus: true,
      },
      orderBy: { publishedAt: 'desc' },
    })
  }

  if (SAMPLE_COUNT > 0) rows = rows.slice(0, SAMPLE_COUNT)

  console.log(
    `[hero-img2img] craft=${CRAFT} rows=${rows.length} dryRun=${DRY_RUN} confirm=${CONFIRM} noSwap=${NO_SWAP} maxSpend=£${MAX_SPEND_GBP.toFixed(2)}`,
  )

  for (const row of rows) {
    const outcome = await processOne(prisma, CRAFT as 'cross-stitch' | 'crochet', row, stats)
    console.log(`  ${(row.slug ?? row.id).padEnd(40)} ${outcome.status.padEnd(20)} ${outcome.details}`)
    stats.processed++
    if (outcome.status === 'SUCCESS') stats.success++
    else if (outcome.status === 'SYNTHETIC_FALLBACK') stats.syntheticFallback++
    else if (outcome.status === 'FAILED_VERIFICATION') stats.failed++
    else if (outcome.status === 'SKIPPED') stats.skipped++
    else if (outcome.status === 'ERROR') stats.errors++
    stats.samples.push(outcome)
  }

  console.log(
    `\n[hero-img2img] Done. processed=${stats.processed} success=${stats.success} syntheticFallback=${stats.syntheticFallback} skipped=${stats.skipped} errors=${stats.errors}  spend=£${stats.costGBP.toFixed(2)}`,
  )

  // Emit sample summary so the hand-off picks up the control + Fal URLs.
  console.log('\n=== Per-row sample summary ===')
  for (const s of stats.samples) {
    console.log(`  ${s.slug}: ${s.status}`)
    if (s.controlMediaUrl) console.log(`    control: ${s.controlMediaUrl}`)
    if (s.falMediaId) console.log(`    falMediaId: ${s.falMediaId}`)
    if (s.verification) console.log(`    verification: ${s.verification}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[hero-img2img] Unhandled:', err)
  process.exit(1)
})

/**
 * Pipeline C — render a 256x256 PNG of each Stitch's chartSymbol glyph,
 * upload to R2, and set Stitch.previewMediaId.
 *
 * The chart-symbols library at apps/web/src/lib/craft-charts/chart-symbols.ts
 * stores each glyph as an SVG fragment centred on (0,0) in a 24x24 box.
 * This script wraps each fragment in a full SVG document, rasterises via
 * sharp at 256x256, uploads the PNG to R2, creates a Media row, and patches
 * Stitch.previewMediaId.
 *
 * Idempotent — Stitch rows that already have a previewMediaId pointing at
 * an existing READY Media are skipped unless --force is passed.
 *
 * Pure in-house. No Fal, no public-domain sourcing. Cost = zero.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-stitch-previews.ts --dry-run
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-stitch-previews.ts --confirm
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-stitch-previews.ts --confirm --force
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-stitch-previews.ts --confirm --slug crochet-treble
 *
 * Env: CLOUDFLARE_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY (same
 *      as seed-crochet-pattern-photos.ts). DB connection per prisma.config.ts.
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
  getChartSymbol,
  type ChartSymbolDefinition,
} from '../../../apps/web/src/lib/craft-charts/chart-symbols.js'
import type { Craft } from '../../../apps/web/src/lib/craft-charts/types.js'

const DRY_RUN = process.argv.includes('--dry-run')
const CONFIRM = process.argv.includes('--confirm')
const FORCE = process.argv.includes('--force')
const SLUG_ARG_INDEX = process.argv.indexOf('--slug')
const ONLY_SLUG = SLUG_ARG_INDEX >= 0 ? process.argv[SLUG_ARG_INDEX + 1] : null

if (!DRY_RUN && !CONFIRM) {
  console.error(
    '[stitch-prev] Pass --dry-run to preview or --confirm to write to DB + R2.\n',
  )
  process.exit(2)
}

const PNG_SIZE = 256

/**
 * Wrap a 24x24 centred SVG fragment in a full SVG document at PNG_SIZE.
 * Background is cream (matches the public stitch directory aesthetic);
 * the glyph is rendered in dark charcoal so it reads on a cream card
 * without further treatment. currentColor in the fragment resolves to
 * the color attribute on the root <svg>.
 */
function wrapGlyph(fragment: string): string {
  // 24x24 viewBox centred on (0,0) → -12 -12 24 24.
  // 8% padding so the glyph doesn't kiss the card edge.
  const padded = 24 / 0.84 // pad to ~84% of canvas
  const half = padded / 2
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="${-half} ${-half} ${padded} ${padded}" ` +
    `width="${PNG_SIZE}" height="${PNG_SIZE}" ` +
    `color="#2a2018">` +
    `<rect x="${-half}" y="${-half}" width="${padded}" height="${padded}" fill="#f6f0e6"/>` +
    fragment +
    `</svg>`
  )
}

async function rasterise(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg))
    .resize(PNG_SIZE, PNG_SIZE)
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  if (!DRY_RUN) {
    const required = ['CLOUDFLARE_ACCOUNT_ID']
    for (const e of required) {
      if (!process.env[e]) {
        console.error(`[stitch-prev] ${e} missing in env. Set it in .env.credentials.`)
        process.exit(2)
      }
    }
  }

  const stitches = await prisma.stitch.findMany({
    where: {
      chartSymbol: { not: null },
      ...(ONLY_SLUG ? { slug: ONLY_SLUG } : {}),
    },
    select: {
      id: true,
      slug: true,
      craft: true,
      canonicalName: true,
      chartSymbol: true,
      previewMediaId: true,
      preview: { select: { id: true, status: true, r2Key: true } },
    },
    orderBy: [{ craft: 'asc' }, { slug: 'asc' }],
  })

  let toProcess = 0
  let skippedHasPreview = 0
  let skippedNoSymbol = 0
  let renderedOk = 0
  let renderedFail = 0

  for (const s of stitches) {
    if (!s.chartSymbol) {
      skippedNoSymbol++
      continue
    }
    const hasReadyPreview =
      s.preview && s.preview.status === 'READY' && s.preview.r2Key
    if (hasReadyPreview && !FORCE) {
      skippedHasPreview++
      continue
    }

    const symbol: ChartSymbolDefinition | null = getChartSymbol(
      s.craft as Craft,
      s.chartSymbol,
    )
    if (!symbol) {
      console.warn(
        `[stitch-prev] SKIP ${s.slug} — chartSymbol "${s.chartSymbol}" not in chart-symbols library for craft="${s.craft}"`,
      )
      renderedFail++
      continue
    }

    toProcess++
    const svg = wrapGlyph(symbol.svg)

    if (DRY_RUN) {
      console.log(`[stitch-prev] would render: ${s.slug.padEnd(30)} (${symbol.label})`)
      continue
    }

    try {
      const png = await rasterise(svg)
      const filename = `${s.slug}-preview.png`
      const { key } = await r2Upload(png, 'image/png', {
        filename,
        prefix: 'stitch-previews',
      })

      const media = await prisma.media.create({
        data: {
          r2Key: key,
          type: 'DIAGRAM',
          status: 'READY',
          filename,
          mimeType: 'image/png',
          alt: `${s.canonicalName} chart symbol`,
          caption: symbol.label,
          width: PNG_SIZE,
          height: PNG_SIZE,
          bytes: png.length,
          source: 'in-house-chart-engine',
          licenceCode: 'PROPRIETARY',
          requiresAttribution: false,
          verificationStatus: 'VERIFIED',
          verificationReason: 'Rendered in-house from chart-symbols library.',
          verifiedAt: new Date(),
        },
      })

      await prisma.stitch.update({
        where: { id: s.id },
        data: { previewMediaId: media.id },
      })

      console.log(`[stitch-prev] OK ${s.slug.padEnd(30)} → media=${media.id}`)
      renderedOk++
    } catch (err) {
      console.error(`[stitch-prev] FAIL ${s.slug}:`, err)
      renderedFail++
    }
  }

  console.log(
    `\n[stitch-prev] Done. total=${stitches.length} toProcess=${toProcess} ok=${renderedOk} fail=${renderedFail} skippedHasPreview=${skippedHasPreview} skippedNoSymbol=${skippedNoSymbol}`,
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[stitch-prev] Unhandled:', err)
  process.exit(1)
})

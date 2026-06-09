/**
 * At-scale runner — render small stitch-in-context swatches for every
 * crochet `Stitch` row that needs one. This complements
 * `render-stitch-previews.ts` (Pipeline C), which renders the chartSymbol
 * GLYPH at 256x256 for rows that have a chartSymbol.
 *
 * This script targets:
 *   1. Stitch rows whose `chartSymbol` is null — currently the three
 *      joining methods (join-as-you-go, slip-stitch seam, whipstitch).
 *      Pipeline C can't render those because there's no symbol.
 *
 *   2. Optionally, stitch rows whose chartSymbol resolves to a stitch in
 *      the renderer's stitch-shapes/index.ts. Useful when a row's
 *      Pipeline C glyph is too abstract; a 3-4-row swatch reads better.
 *      Off by default — pass --include-shapeful to include them.
 *
 * Idempotent — rows that already have a `previewMediaId` pointing at a
 * READY Media row are skipped unless --force is passed.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-stitch-swatches.ts --dry-run
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-stitch-swatches.ts --confirm
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-stitch-swatches.ts --confirm --force --slug crochet-join-as-you-go
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

import { r2Upload } from '../src/r2.js'
import {
  renderSwatchToPng,
  hasStitchShape,
} from '../../../apps/web/src/lib/crochet/renderer/index.js'

const DRY_RUN = process.argv.includes('--dry-run')
const CONFIRM = process.argv.includes('--confirm')
const FORCE = process.argv.includes('--force')
const INCLUDE_SHAPEFUL = process.argv.includes('--include-shapeful')
const SLUG_ARG_INDEX = process.argv.indexOf('--slug')
const ONLY_SLUG = SLUG_ARG_INDEX >= 0 ? process.argv[SLUG_ARG_INDEX + 1] : null

if (!DRY_RUN && !CONFIRM) {
  console.error(
    '[stitch-swatch] Pass --dry-run to preview or --confirm to write to DB + R2.\n',
  )
  process.exit(2)
}

const SWATCH_PX = 400

/**
 * Map a Stitch's slug to a symbol key the renderer knows. By default the
 * slug itself with the `crochet-` prefix stripped maps to the symbol key
 * (e.g. `crochet-join-as-you-go` → `join-as-you-go`). Hand-coded overrides
 * cover slug ↔ key mismatches.
 */
function slugToSymbolKey(slug: string): string {
  const base = slug.startsWith('crochet-') ? slug.slice('crochet-'.length) : slug
  // Hand-coded overrides where the slug doesn't match the symbol key.
  const overrides: Record<string, string> = {
    'double-uk': 'double-crochet-uk',
    'flo-dc': 'front-loop',
    'flo-htr': 'front-loop',
    'flo-tr': 'front-loop',
    'blo-dc': 'back-loop',
    'blo-htr': 'back-loop',
    'blo-tr': 'back-loop',
    'front-loop-only': 'front-loop',
    'back-loop-only': 'back-loop',
    'invisible-decrease': 'invisible-dec',
    'bpdc': 'back-post',
    'bptr': 'back-post',
    'fpdc': 'front-post',
    'fptr': 'front-post',
    'granny-cluster': 'granny-cluster',
    'cross-stitch-crochet': 'cross-stitch-crochet',
  }
  return overrides[base] ?? base
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  if (!DRY_RUN && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.error('[stitch-swatch] CLOUDFLARE_ACCOUNT_ID missing in env.')
    process.exit(2)
  }

  const stitches = await prisma.stitch.findMany({
    where: {
      craft: 'crochet',
      ...(ONLY_SLUG ? { slug: ONLY_SLUG } : {}),
      ...(INCLUDE_SHAPEFUL ? {} : { chartSymbol: null }),
    },
    select: {
      id: true,
      slug: true,
      canonicalName: true,
      category: true,
      chartSymbol: true,
      previewMediaId: true,
      preview: { select: { id: true, status: true, r2Key: true } },
    },
    orderBy: [{ category: 'asc' }, { slug: 'asc' }],
  })

  let renderedOk = 0
  let renderedFail = 0
  let skippedExisting = 0
  let skippedNoShape = 0

  for (const s of stitches) {
    const hasReadyPreview =
      s.preview && s.preview.status === 'READY' && s.preview.r2Key
    if (hasReadyPreview && !FORCE) {
      skippedExisting++
      console.log(`[stitch-swatch] SKIP ${s.slug} — preview already attached.`)
      continue
    }

    const symbolKey = slugToSymbolKey(s.slug)
    if (!hasStitchShape(symbolKey)) {
      skippedNoShape++
      console.warn(
        `[stitch-swatch] SKIP ${s.slug} — symbol key "${symbolKey}" not in stitch-shapes registry; ` +
          `add the shape to apps/web/src/lib/crochet/renderer/stitch-shapes/ before re-running.`,
      )
      continue
    }

    if (DRY_RUN) {
      console.log(`[stitch-swatch] would render ${s.slug.padEnd(36)} via "${symbolKey}"`)
      continue
    }

    try {
      const { png, ok, reason } = await renderSwatchToPng({
        symbol: symbolKey,
        pixelSize: SWATCH_PX,
        rows: 4,
        columns: 6,
      })
      if (!ok) {
        console.error(`[stitch-swatch] FAIL ${s.slug}: ${reason}`)
        renderedFail++
        continue
      }

      const filename = `${s.slug}-swatch.png`
      const { key } = await r2Upload(png, 'image/png', {
        filename,
        prefix: 'stitch-swatches',
      })

      const media = await prisma.media.create({
        data: {
          r2Key: key,
          type: 'DIAGRAM',
          status: 'READY',
          filename,
          mimeType: 'image/png',
          alt: `${s.canonicalName} swatch`,
          caption: `${s.canonicalName} rendered as a 4-row swatch by the in-house chart engine.`,
          width: SWATCH_PX,
          height: SWATCH_PX,
          bytes: png.length,
          source: 'in-house-chart-engine',
          licenceCode: 'PROPRIETARY',
          requiresAttribution: false,
          verificationStatus: 'VERIFIED',
          verificationReason: 'Rendered in-house from stitch-shapes registry.',
          verifiedAt: new Date(),
        },
      })

      await prisma.stitch.update({
        where: { id: s.id },
        data: { previewMediaId: media.id },
      })

      console.log(`[stitch-swatch] OK ${s.slug.padEnd(36)} preview=${media.id}`)
      renderedOk++
    } catch (err) {
      console.error(`[stitch-swatch] UPLOAD-FAIL ${s.slug}:`, err)
      renderedFail++
    }
  }

  console.log(
    `\n[stitch-swatch] Done. selected=${stitches.length} ok=${renderedOk} fail=${renderedFail} skippedExisting=${skippedExisting} skippedNoShape=${skippedNoShape}`,
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[stitch-swatch] Unhandled:', err)
  process.exit(1)
})

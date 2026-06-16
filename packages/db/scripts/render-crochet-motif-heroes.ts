/**
 * At-scale runner — render finished-piece heroes for every CrochetPattern
 * whose `shapeCategory` is MOTIF, using the in-house chart engine at
 * `apps/web/src/lib/crochet/renderer/`.
 *
 * Idempotent — patterns that already have a valid heroMediaId pointing at
 * a READY Media row are skipped unless --force is passed.
 *
 * No AI image generation. Pure SVG → PNG.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-motif-heroes.ts --dry-run
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-motif-heroes.ts --confirm
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-motif-heroes.ts --confirm --force
 *   pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-motif-heroes.ts --confirm --slug granny-square-basic-three-round
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
import { renderPattern, rasterise } from '../../../apps/web/src/lib/crochet/renderer/index.js'
import type { ChartDefinition } from '../../../apps/web/src/lib/craft-charts/types.js'

const DRY_RUN = process.argv.includes('--dry-run')
const CONFIRM = process.argv.includes('--confirm')
const FORCE = process.argv.includes('--force')
const SLUG_ARG_INDEX = process.argv.indexOf('--slug')
const ONLY_SLUG = SLUG_ARG_INDEX >= 0 ? process.argv[SLUG_ARG_INDEX + 1] : null

if (!DRY_RUN && !CONFIRM) {
  console.error(
    '[motif-heroes] Pass --dry-run to preview or --confirm to write to DB + R2.\n',
  )
  process.exit(2)
}

const HERO_PX = 1200
const UNIT_PX = 36 // tuned so a typical 3-ring motif fills ~1100 of 1200 px

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  if (!DRY_RUN && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.error('[motif-heroes] CLOUDFLARE_ACCOUNT_ID missing in env.')
    process.exit(2)
  }

  const motifs = await prisma.crochetPattern.findMany({
    where: {
      shapeCategory: 'MOTIF',
      ...(ONLY_SLUG ? { slug: ONLY_SLUG } : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      chartData: true,
      heroMediaId: true,
      hero: { select: { id: true, status: true, r2Key: true } },
      thumbnailMediaId: true,
    },
    orderBy: { slug: 'asc' },
  })

  let renderedOk = 0
  let renderedFail = 0
  let skipped = 0
  let noChartData = 0

  for (const p of motifs) {
    const hasReadyHero = p.hero && p.hero.status === 'READY' && p.hero.r2Key
    if (hasReadyHero && !FORCE) {
      skipped++
      console.log(`[motif-heroes] SKIP ${p.slug} — hero already attached.`)
      continue
    }

    if (!p.chartData) {
      noChartData++
      console.log(`[motif-heroes] SKIP ${p.slug} — no chartData.`)
      continue
    }

    const chart = p.chartData as unknown as ChartDefinition
    let result: ReturnType<typeof renderPattern>
    try {
      result = renderPattern(chart, { unitPx: UNIT_PX })
    } catch (err) {
      console.error(`[motif-heroes] RENDER-FAIL ${p.slug}:`, err)
      renderedFail++
      continue
    }

    if (!result.verify.ok) {
      console.warn(
        `[motif-heroes] VERIFY-FAIL ${p.slug} (${result.verify.issues.length} issue${result.verify.issues.length === 1 ? '' : 's'}):`,
      )
      for (const issue of result.verify.issues) {
        console.warn(`    - ${issue}`)
      }
      renderedFail++
      continue
    }

    if (DRY_RUN) {
      console.log(
        `[motif-heroes] would render ${p.slug!.padEnd(40)} ` +
          `(${result.motifShape.kind}, ${result.verify.stitchCount} stitches)`,
      )
      continue
    }

    try {
      const png = await rasterise(result.svg, { width: HERO_PX, height: HERO_PX })
      const filenamePng = `${p.slug}-hero.png`
      const filenameSvg = `${p.slug}-hero.svg`

      const { key: pngKey } = await r2Upload(png, 'image/png', {
        filename: filenamePng,
        prefix: 'crochet-pattern-heroes',
      })
      const { key: svgKey } = await r2Upload(
        Buffer.from(result.svg),
        'image/svg+xml',
        { filename: filenameSvg, prefix: 'crochet-pattern-heroes' },
      )

      const media = await prisma.media.create({
        data: {
          r2Key: pngKey,
          type: 'PHOTO',
          status: 'READY',
          filename: filenamePng,
          mimeType: 'image/png',
          alt: `${p.name} — finished piece render`,
          caption: `${p.name} rendered from chartData by the in-house chart engine.`,
          width: HERO_PX,
          height: HERO_PX,
          bytes: png.length,
          source: 'in-house-chart-engine',
          licenceCode: 'PROPRIETARY',
          requiresAttribution: false,
          verificationStatus: 'VERIFIED',
          verificationReason: 'Rendered in-house from CrochetPattern.chartData.',
          verifiedAt: new Date(),
        },
      })

      await prisma.crochetPattern.update({
        where: { id: p.id },
        data: {
          heroMediaId: media.id,
          ...(p.thumbnailMediaId ? {} : { thumbnailMediaId: media.id }),
        },
      })

      console.log(
        `[motif-heroes] OK ${p.slug!.padEnd(40)} hero=${media.id} svgKey=${svgKey}`,
      )
      renderedOk++
    } catch (err) {
      console.error(`[motif-heroes] UPLOAD-FAIL ${p.slug}:`, err)
      renderedFail++
    }
  }

  console.log(
    `\n[motif-heroes] Done. motifs=${motifs.length} ok=${renderedOk} fail=${renderedFail} skippedExisting=${skipped} noChartData=${noChartData}`,
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[motif-heroes] Unhandled:', err)
  process.exit(1)
})

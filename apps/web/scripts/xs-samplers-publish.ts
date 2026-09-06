/**
 * xs-samplers-publish — put the sampler catalogue on the shelf.
 *
 * Every piece goes through the SAME publish path as the rest of the house
 * catalogue: the duplicate guard against the whole live catalogue, the
 * fingerprints, the house designer, the persisted beauty thumbnail, the
 * stitchability metrics and the search sync. `publishCrossStitchGem` does all
 * of that; this script builds the chart, hands it over, and then writes the two
 * things a sampler needs on top — the lettering recipe, so the piece can be
 * re-lettered with somebody else's name, and a picture of the design with no
 * words on it, which is what the personalise preview draws under the new ones.
 *
 * Dry run by default. Nothing is written without `--apply`.
 *
 * Run from apps/web:
 *
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-publish.ts
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-publish.ts --apply
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-publish.ts --apply --only sampler-birth-rose-wreath
 */
import { readFileSync } from 'node:fs'

function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    /* env from the shell */
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? '.env.credentials')

import sharp from 'sharp'
import { prisma, r2Upload, computePatternMetrics } from '@homemade/db'
import { SAMPLER_DESIGNS } from '@/lib/studio/generation/samplers/designs'
import { buildSampler } from '@/lib/studio/generation/samplers/build'
import { SAMPLER_KINDS } from '@/lib/studio/generation/samplers/kinds'
import { artChart } from '@/lib/studio/generation/samplers/preview'
import { clipArt } from '@/lib/studio/generation/samplers/art'
import { renderBeautyThumbnail } from '@/lib/studio/generation/bulk/beauty-thumbnail'
import { POST_SAT } from '@/lib/studio/generation/bulk/cross-stitch-style'
import { publishCrossStitchGem } from '@/lib/studio/generation/bulk/cross-stitch'
import {
  fingerprintCandidate,
  findDuplicate,
  loadPublicCrossStitchFingerprints,
} from '@/lib/studio/generation/bulk/dedupe-guard'
import type { CrossStitchBrief } from '@/lib/studio/generation/bulk/planner'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { SHELF_DESCRIPTION, SHELF_NAME, SHELF_SLUG } from '@/lib/studio/generation/samplers/shelf'

const APPLY = process.argv.includes('--apply')

function arg(name: string, fallback = ''): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? (process.argv[i + 1] ?? fallback) : fallback
}

/**
 * The picture the personalise preview draws under a maker's own words: the
 * design with nothing written on it, rendered over the WHOLE grid with no
 * padding, so cell (x, y) lands at a fixed fraction of the image and the
 * browser can put the new lettering exactly where it belongs.
 */
const PREVIEW_BASE_PX = 900

async function renderPreviewBase(
  design: (typeof SAMPLER_DESIGNS)[number],
): Promise<Buffer> {
  const art = clipArt(await design.art(), design.width, design.height)
  const chart = artChart(art, design.width, design.height)
  const cellPx = Math.max(3, Math.round(PREVIEW_BASE_PX / Math.max(chart.grid.width, chart.grid.height)))
  const svg = renderPatternSvgString(chart, {
    mode: 'beauty',
    cellPx,
    showSymbols: false,
    showGrid: false,
    showCentreCrosshairs: false,
    padding: 0,
  })
  return sharp(Buffer.from(svg))
    .modulate({ saturation: POST_SAT })
    .resize(PREVIEW_BASE_PX, PREVIEW_BASE_PX, { fit: 'inside' })
    .png({ quality: 90 })
    .toBuffer()
}

async function main(): Promise<void> {
  const only = arg('only')
  const designs = SAMPLER_DESIGNS.filter((d) => !only || only.split(',').includes(d.slug))
  console.log(`${designs.length} sampler${designs.length === 1 ? '' : 's'}, ${APPLY ? 'PUBLISHING' : 'dry run'}\n`)

  const catalogue = await loadPublicCrossStitchFingerprints({ includePending: true })
  console.log(`compared against ${catalogue.length} catalogue rows\n`)

  let published = 0
  let blocked = 0
  let failed = 0

  for (const design of designs) {
    try {
      const built = await buildSampler(design)
      const renderPng = await renderBeautyThumbnail(built.data, POST_SAT)
      const m = computePatternMetrics(built.data)

      const fingerprints = await fingerprintCandidate(renderPng, built.data, design.name)
      const hit = findDuplicate(fingerprints, catalogue)
      if (hit) {
        blocked++
        console.log(`BLOCKED ${design.slug}: ${hit.reason}`)
        continue
      }
      // Keep the just-published piece in the comparison set so two samplers in
      // this same run cannot duplicate each other.
      catalogue.push({
        id: design.slug,
        slug: design.slug,
        name: design.name,
        subjectKey: fingerprints.subjectKey,
        image: {
          sha256: fingerprints.sha256,
          dhash64: fingerprints.dhash64,
          dhash256: fingerprints.dhash256,
          chart: fingerprints.chart,
        },
      })

      if (!APPLY) {
        console.log(
          `would publish ${design.slug.padEnd(40)} ${m.widthCells}x${m.heightCells} ${m.colourCount}c ${m.totalStitches} st`,
        )
        published++
        continue
      }

      const brief: CrossStitchBrief = {
        slug: design.slug,
        // The publisher titles the row from the subject, so the subject IS the
        // catalogue title. It is also what the duplicate guard's subject key is
        // derived from, which is what we want here: two samplers are the same
        // idea when they are the same design, not when they share a wreath.
        subject: design.name,
        subjectKey: fingerprints.subjectKey,
        style: 'botanical',
        w: design.width,
        h: design.height,
        colours: m.colourCount,
        lane: 'sampler',
        source: 'sampler',
        plannerMode: 'constrained',
        dressed: false,
        shelf: SHELF_SLUG,
        shelfName: SHELF_NAME,
        themeId: 'samplers',
      }

      const gem = await publishCrossStitchGem(
        brief,
        {
          data: built.data,
          renderPng,
          colourCount: m.colourCount,
          widthCells: m.widthCells,
          heightCells: m.heightCells,
          // No AI source image: the words are set from font outlines and the
          // art is composed from cached motif charts, so there is no single
          // generated PNG this chart came from.
          sourceSha256: '',
          pro: false,
          model: 'deterministic-sampler',
          imageSize: `${design.width}x${design.height}`,
          credit: 'Homemade-original (sampler design)',
          requestedColours: m.colourCount,
        },
        { fingerprints, gate: { verdict: 'keep', reasons: ['sampler design, judged by eye'] } },
      )

      const previewBase = await renderPreviewBase(design)
      const { publicUrl } = await r2Upload(previewBase, 'image/png', {
        prefix: 'sampler-preview-bases',
        filename: `${design.slug}.png`,
      })

      const row = await prisma.pattern.findUnique({
        where: { id: gem.patternId },
        select: { generationMeta: true },
      })
      const meta =
        row?.generationMeta && typeof row.generationMeta === 'object' && !Array.isArray(row.generationMeta)
          ? (row.generationMeta as Record<string, unknown>)
          : {}

      await prisma.pattern.update({
        where: { id: gem.patternId },
        data: {
          description: design.description,
          generationMeta: {
            ...meta,
            sampler: {
              ...built.meta,
              look: design.look,
              previewBaseUrl: publicUrl,
              motifs: design.motifs ?? [],
            },
          } as unknown as object,
        },
      })

      published++
      console.log(
        `published ${design.slug.padEnd(40)} ${m.widthCells}x${m.heightCells} ${m.colourCount}c ${m.totalStitches} st  ${gem.publicUrl}`,
      )
    } catch (err) {
      failed++
      console.error(`FAILED ${design.slug}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (APPLY) {
    await describeShelf()
  }

  console.log(`\n${published} published, ${blocked} blocked as duplicates, ${failed} failed.`)
  const byKind = new Map<string, number>()
  for (const d of designs) byKind.set(d.kind, (byKind.get(d.kind) ?? 0) + 1)
  for (const [kind, n] of byKind) console.log(`  ${SAMPLER_KINDS[kind as keyof typeof SAMPLER_KINDS].label}: ${n}`)
  if (failed > 0) process.exitCode = 1
}

/**
 * Give the shelf its one-line description, in the same plain-list voice as the
 * other cross-stitch shelves. Idempotent: only writes when the text differs.
 * The row itself is created by the publisher on the first sampler, exactly as
 * every other shelf row was.
 */
async function describeShelf(): Promise<void> {
  const cat = await prisma.category.findUnique({ where: { slug: 'cross-stitch' }, select: { id: true } })
  if (!cat) return
  const sub = await prisma.subCategory.findUnique({
    where: { categoryId_slug: { categoryId: cat.id, slug: SHELF_SLUG } },
    select: { id: true, description: true, name: true },
  })
  if (!sub) {
    console.log('shelf row not found — nothing was published')
    return
  }
  if (sub.description === SHELF_DESCRIPTION && sub.name === SHELF_NAME) return
  await prisma.subCategory.update({
    where: { id: sub.id },
    data: { name: SHELF_NAME, description: SHELF_DESCRIPTION },
  })
  console.log(`shelf description written for “${SHELF_NAME}”`)
}

main()
  .catch((e) => {
    console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

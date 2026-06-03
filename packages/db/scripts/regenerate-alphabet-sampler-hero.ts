/**
 * Pattern-aware Fal hero calibration — regenerates the
 * `cross-stitch-alphabet-sampler-border` hero using the new
 * pattern-aware Flux prompt that takes the chart's palette + fabric
 * count + subject into account.
 *
 * Phase location_climate_paper_001 — Part 6 calibration.
 *
 * One-off script. Re-runnable; each run creates a new Media row,
 * snapshots the previous tutorial state into TutorialVersion, then
 * repoints heroMediaId at the fresh image.
 *
 * Flags:
 *   --dry-run   Print the prompt + skip the Fal call + skip the DB write.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/regenerate-alphabet-sampler-hero.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let envDir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(envDir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(envDir); if (p === envDir) break; envDir = p
}

import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'
import { generateWithFluxSchnell, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-schnell'

const TUTORIAL_SLUG = 'cross-stitch-alphabet-sampler-border'
const DRY_RUN = process.argv.includes('--dry-run')

interface TipTapNode {
  type?: string
  attrs?: { definition?: unknown }
  content?: TipTapNode[]
}

interface CrossStitchChartShape {
  title?: string
  fabricCount?: number
  finishedSizeText?: string
  palette?: Array<{ name?: string; hex?: string }>
}

function findFirstCrossStitchChart(body: unknown): CrossStitchChartShape | null {
  if (!body || typeof body !== 'object') return null
  const doc = body as TipTapNode
  if (!Array.isArray(doc.content)) return null
  for (const node of doc.content) {
    if (node.type === 'crossStitchChart') {
      const def = node.attrs?.definition
      if (def && typeof def === 'object') return def as CrossStitchChartShape
    }
  }
  return null
}

function extFromContentType(ct: string | null): { ext: string; mime: string } {
  const c = (ct ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/jpeg' || c === 'image/jpg') return { ext: 'jpg', mime: 'image/jpeg' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

async function main(): Promise<void> {
  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const tutorial = await prisma.tutorial.findUnique({
    where: { slug: TUTORIAL_SLUG },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      body: true,
      status: true,
      heroMediaId: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
    },
  })
  if (!tutorial) {
    console.error(`tutorial '${TUTORIAL_SLUG}' not found`)
    process.exit(1)
  }

  const chart = findFirstCrossStitchChart(tutorial.body)
  if (!chart) {
    console.error(`tutorial '${TUTORIAL_SLUG}' has no crossStitchChart in body`)
    process.exit(1)
  }

  const paletteNames = (chart.palette ?? [])
    .map((p) => p.name)
    .filter((n): n is string => Boolean(n))

  const subjectHint = 'cross-stitch alphabet sampler border with all 26 letters'

  console.log(`[regen-sampler] tutorial: ${tutorial.slug}`)
  console.log(`[regen-sampler] palette: ${paletteNames.join(', ') || '(none)'}`)
  console.log(`[regen-sampler] fabric: ${chart.fabricCount ?? '(unset)'}-count`)
  console.log(`[regen-sampler] size: ${chart.finishedSizeText ?? '(unset)'}`)

  if (DRY_RUN) {
    console.log(`[regen-sampler] DRY RUN — not calling Fal, not writing DB`)
    await prisma.$disconnect()
    return
  }

  let img
  try {
    img = await generateWithFluxSchnell({
      title: tutorial.title,
      category: tutorial.category.slug,
      subCategory: tutorial.subCategory?.slug ?? null,
      ingredients: [],
      pattern: {
        kind: 'cross-stitch',
        paletteNames,
        fabricCount: chart.fabricCount,
        finishedSizeText: chart.finishedSizeText,
        subjectHint,
      },
    })
  } catch (err) {
    if (err instanceof FluxBillingError) {
      console.error('[regen-sampler] Fal billing exhausted — top up and re-run')
      process.exit(2)
    }
    throw err
  }
  if (!img) {
    console.error('[regen-sampler] flux returned null (FAL_KEY missing or all retries failed)')
    process.exit(1)
  }

  console.log(`[regen-sampler] downloaded prompt result: ${img.url}`)

  const dl = await fetch(img.url, {
    headers: {
      'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
      Accept: 'image/*,*/*;q=0.8',
    },
  })
  if (!dl.ok) {
    console.error(`[regen-sampler] download failed: ${dl.status}`)
    process.exit(1)
  }
  const buf = Buffer.from(await dl.arrayBuffer())
  const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
  const filename = `${tutorial.slug}-hero-pattern-aware.${ext}`
  const { key, publicUrl } = await r2Upload(buf, mime, {
    filename,
    prefix: 'tutorials/pattern-aware-hero',
  })
  console.log(`[regen-sampler] uploaded to R2: ${publicUrl}`)

  const newMedia = await prisma.media.create({
    data: {
      r2Key: key,
      type: 'ILLUSTRATION',
      status: 'READY',
      filename,
      mimeType: mime,
      width: img.width,
      height: img.height,
      bytes: buf.length,
      source: 'flux-schnell',
      sourceUrl: img.pageUrl,
      creatorName: null,
      licenceCode: 'PROPRIETARY',
      licenceUrl: null,
      requiresAttribution: false,
      verificationStatus: 'UNVERIFIED',
    },
  })

  await prisma.$transaction(async (tx) => {
    await tx.tutorialVersion.create({
      data: {
        tutorialId: tutorial.id,
        title: tutorial.title,
        subtitle: tutorial.subtitle,
        excerpt: tutorial.excerpt,
        body: tutorial.body as Prisma.InputJsonValue,
        status: tutorial.status,
        authorId: author.id,
        changeNote: 'pattern-aware Flux hero (alphabet-sampler calibration)',
      },
    })
    await tx.tutorial.update({
      where: { id: tutorial.id },
      data: {
        heroMediaId: newMedia.id,
        heroImageStrategy: 'AI_GENERATED',
      },
    })
  })

  console.log(`[regen-sampler] DONE — heroMediaId=${newMedia.id}`)
  console.log(`[regen-sampler] live URL: https://homemade.education/needlework/${TUTORIAL_SLUG}`)
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })

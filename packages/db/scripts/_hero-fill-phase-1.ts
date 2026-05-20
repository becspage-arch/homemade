/**
 * Phase 1 hero fill: source PD / free-licensed hero images for the 11 review
 * tutorials authored in this session. Uses the existing image-sourcing
 * orchestrator with the Flux Schnell fallback DISABLED (the worker prompt
 * forbids auto-generation on these specifically — PD/free real images
 * only).
 *
 * Slugs covered (DRAFT status, hero=null at start):
 *   needlework:
 *     cross-stitch-alphabet-sampler-border  (already shipped reference)
 *     how-to-cross-stitch                   (new foundational)
 *     start-and-end-a-thread-cleanly        (re-author foundational)
 *   crochet:
 *     crochet-magic-ring                    (already shipped reference)
 *     granny-square-basic-three-round       (already shipped reference)
 *     how-to-hold-a-crochet-hook            (new foundational)
 *     how-to-work-a-treble                  (new foundational)
 *   knitting:
 *     how-to-work-a-knit-stitch             (new foundational)
 *     long-tail-cast-on                     (re-author foundational)
 *     stocking-stitch-dishcloth             (re-author)
 *   sewing:
 *     running-and-backstitch-by-hand        (re-author)
 *     simple-drawstring-bag                 (re-author)
 *   garden:
 *     growing-strawberries                  (re-author)
 *     growing-tomatoes-from-seed            (re-author)
 *
 * On each tutorial:
 *   1. Call sourceHeroImage with excludeSources: ['flux-schnell'].
 *   2. If outcome === 'free' and image bytes download cleanly, push to R2,
 *      create Media row, attach as hero, append a TutorialVersion.
 *   3. If outcome === 'failed' (all free sources exhausted), leave hero=null
 *      and report so the hand-off can name the gap.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const SLUGS = [
  'cross-stitch-alphabet-sampler-border',
  'how-to-cross-stitch',
  'start-and-end-a-thread-cleanly',
  'crochet-magic-ring',
  'granny-square-basic-three-round',
  'how-to-hold-a-crochet-hook',
  'how-to-work-a-treble',
  'how-to-work-a-knit-stitch',
  'long-tail-cast-on',
  'stocking-stitch-dishcloth',
  'running-and-backstitch-by-hand',
  'simple-drawstring-bag',
  'growing-strawberries',
  'growing-tomatoes-from-seed',
]

function extFromContentType(ct: string | null): { ext: string; mime: string } {
  const c = (ct ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/avif') return { ext: 'avif', mime: 'image/avif' }
  if (c === 'image/jpeg' || c === 'image/jpg') return { ext: 'jpg', mime: 'image/jpeg' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

async function main() {
  const { prisma, r2Upload } = await import('../src/index.js')
  const { sourceHeroImage } = await import('../../../apps/web/src/lib/image-sourcing/orchestrator.js')

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const rows: Array<{ slug: string; outcome: string; source?: string | null; mediaId?: string; pageUrl?: string }> = []

  for (const slug of SLUGS) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: {
        id: true, slug: true, title: true, subtitle: true, excerpt: true,
        body: true, status: true, heroMediaId: true,
        category: { select: { slug: true } },
        subCategory: { select: { slug: true } },
      },
    })
    if (!t) { console.log(`${slug}: NOT FOUND`); rows.push({ slug, outcome: 'not-found' }); continue }
    if (t.heroMediaId) { console.log(`${slug}: SKIP — hero already set (${t.heroMediaId})`); rows.push({ slug, outcome: 'skip-has-hero' }); continue }

    let result
    try {
      result = await sourceHeroImage({
        title: t.title,
        category: t.category.slug,
        subCategory: t.subCategory?.slug ?? null,
        ingredients: [],
      }, { excludeSources: ['flux-schnell'] })
    } catch (e) {
      console.log(`${slug}: ERROR during sourceHeroImage — ${String((e as Error).message)}`)
      rows.push({ slug, outcome: 'error', source: String((e as Error).message) })
      continue
    }

    if (result.outcome !== 'free' || !result.image) {
      console.log(`${slug}: NO FREE MATCH — tried [${result.triedSources.join(', ')}]`)
      rows.push({ slug, outcome: 'no-free-match' })
      continue
    }
    const img = result.image

    const dl = await fetch(img.url, {
      headers: {
        'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
        Accept: 'image/*,*/*;q=0.8',
      },
    })
    if (!dl.ok) {
      console.log(`${slug}: ERROR download ${dl.status} from ${img.source}`)
      rows.push({ slug, outcome: 'download-error', source: img.source })
      continue
    }
    const buf = Buffer.from(await dl.arrayBuffer())
    if (buf.length === 0) {
      console.log(`${slug}: ERROR empty body from ${img.source}`)
      rows.push({ slug, outcome: 'empty-body', source: img.source })
      continue
    }

    const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
    const filename = `${t.slug}-hero.${ext}`
    const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/phase-1-hero-fill' })

    const media = await prisma.media.create({
      data: {
        r2Key: key,
        type: 'ILLUSTRATION',
        status: 'READY',
        filename,
        mimeType: mime,
        width: img.width,
        height: img.height,
        bytes: buf.length,
        source: img.source,
        sourceUrl: img.pageUrl,
        creatorName: img.creatorName,
        licenceCode: img.licenceCode,
        licenceUrl: img.licenceUrl,
        requiresAttribution: img.requiresAttribution,
      },
    })

    await prisma.$transaction(async (tx) => {
      await tx.tutorialVersion.create({
        data: {
          tutorialId: t.id,
          title: t.title,
          subtitle: t.subtitle,
          excerpt: t.excerpt,
          body: t.body as any,
          status: t.status,
          authorId: author.id,
          changeNote: `phase-1-hero-fill: attach ${img.source} hero (PD/free).`,
        },
      })
      await tx.tutorial.update({
        where: { id: t.id },
        data: {
          heroMediaId: media.id,
          heroImageStrategy: 'REAL_PHOTO',
        },
      })
    })

    console.log(`${slug}: OK ${img.source} ${img.width}x${img.height}  media=${media.id}`)
    rows.push({ slug, outcome: 'attached', source: img.source, mediaId: media.id, pageUrl: img.pageUrl ?? undefined })
  }

  console.log('\n=== summary ===')
  for (const r of rows) {
    console.log(`  ${r.slug.padEnd(40)} ${r.outcome.padEnd(20)} ${r.source ?? ''}`)
  }

  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })

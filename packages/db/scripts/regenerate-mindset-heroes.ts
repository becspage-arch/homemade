/**
 * Replace every PUBLISHED mindset tutorial's hero with a freshly-generated
 * Flux image using the new sub-category-specific prompts in flux-schnell.ts.
 *
 * The 2026-05-25 audit found mindset content was collapsing to the same
 * "candle + notebook + linen" template regardless of practice type because
 * the old generic prompt dominated the single {title} interpolation. The
 * updated buildMindsetPrompt branches on subCategory and gives each
 * practice a distinct scene anchor. This script propagates that fix to
 * the existing corpus.
 *
 * Per tutorial:
 *   1. Generate a new Flux image from the current prompt builder
 *   2. Download bytes, push to R2 under tutorials/mindset-regen/
 *   3. Create a new Media row UNVERIFIED
 *   4. In a tx: snapshot TutorialVersion, point Tutorial.heroMediaId at
 *      the new Media, ensure heroImageStrategy = AI_GENERATED
 *
 * Idempotent on retry via the FluxBillingError detection — if balance
 * runs out mid-run, the notification fires once, the script exits, and
 * re-running picks up where it left off (no double-write because the
 * skipped tutorials still point at their existing Media).
 *
 * Flags:
 *   --limit N      Process at most N tutorials. Default all.
 *   --sub SLUG     Only process this mindset sub-category. Default all.
 *   --dry-run      Print what would change, don't write.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/regenerate-mindset-heroes.ts
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}

import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'
import { generateWithFluxSchnell, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-schnell'
import { writeFluxBillingHalt } from '../../../apps/web/src/lib/image-sourcing/flux-billing-halt'

interface CliFlags {
  limit: number | null
  sub: string | null
  dryRun: boolean
}

function parseCliFlags(argv: string[]): CliFlags {
  let limit: number | null = null
  let sub: string | null = null
  let dryRun = false
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--dry-run') dryRun = true
    else if (a === '--limit') limit = Number(argv[++i]) || null
    else if (a.startsWith('--limit=')) limit = Number(a.slice('--limit='.length)) || null
    else if (a === '--sub') sub = argv[++i] ?? null
    else if (a.startsWith('--sub=')) sub = a.slice('--sub='.length)
  }
  return { limit, sub, dryRun }
}

function extFromContentType(ct: string | null): { ext: string; mime: string } {
  const c = (ct ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/avif') return { ext: 'avif', mime: 'image/avif' }
  if (c === 'image/jpeg' || c === 'image/jpg') return { ext: 'jpg', mime: 'image/jpeg' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2))
  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const tutorials = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      category: { slug: 'mindset' },
      ...(flags.sub ? { subCategory: { slug: flags.sub } } : {}),
    },
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
    orderBy: { slug: 'asc' },
  })

  const total = flags.limit ? Math.min(flags.limit, tutorials.length) : tutorials.length
  console.log(`regenerate-mindset-heroes: ${tutorials.length} candidates. Processing ${total}.`)
  console.log(`  filter: sub=${flags.sub ?? 'all'}, dryRun=${flags.dryRun}`)

  let regenerated = 0
  let failed = 0
  const failures: { slug: string; reason: string }[] = []

  for (let i = 0; i < total; i++) {
    const t = tutorials[i]!
    const tag = `[${i + 1}/${total}] ${t.slug}`
    try {
      let img
      try {
        img = await generateWithFluxSchnell({
          title: t.title,
          category: t.category.slug,
          subCategory: t.subCategory?.slug ?? null,
          ingredients: [],
        })
      } catch (err) {
        if (err instanceof FluxBillingError) {
          await writeFluxBillingHalt(err, {
            script: 'regenerate-mindset-heroes',
            processed: i,
            total,
            extra: { regeneratedSoFar: regenerated, failedSoFar: failed },
            prisma,
          })
          process.exit(2)
        }
        throw err
      }
      if (!img) {
        failed += 1
        failures.push({ slug: t.slug, reason: 'flux returned null' })
        console.log(`${tag} FAILED — flux returned null`)
        continue
      }
      if (flags.dryRun) {
        regenerated += 1
        console.log(`${tag} DRY (${t.subCategory?.slug ?? '?'})`)
        continue
      }
      const dl = await fetch(img.url, {
        headers: {
          'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
          Accept: 'image/*,*/*;q=0.8',
        },
      })
      if (!dl.ok) {
        failed += 1
        failures.push({ slug: t.slug, reason: `download ${dl.status}` })
        console.log(`${tag} FAILED — download ${dl.status}`)
        continue
      }
      const buf = Buffer.from(await dl.arrayBuffer())
      const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
      const filename = `${t.slug}-hero-mindset-regen.${ext}`
      const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/mindset-regen' })

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
            tutorialId: t.id,
            title: t.title,
            subtitle: t.subtitle,
            excerpt: t.excerpt,
            body: t.body as Prisma.InputJsonValue,
            status: t.status,
            authorId: author.id,
            changeNote: `mindset-regen: new Flux prompt for ${t.subCategory?.slug ?? '?'}`,
          },
        })
        await tx.tutorial.update({
          where: { id: t.id },
          data: {
            heroMediaId: newMedia.id,
            heroImageStrategy: 'AI_GENERATED',
          },
        })
      })

      regenerated += 1
      console.log(`${tag} OK (${t.subCategory?.slug ?? '?'})`)
    } catch (err) {
      failed += 1
      const reason = err instanceof Error ? err.message : String(err)
      failures.push({ slug: t.slug, reason })
      console.log(`${tag} ERROR ${reason}`)
    }
  }

  console.log(`\nDONE`)
  console.log(`  regenerated: ${regenerated}`)
  console.log(`  failed:      ${failed}`)
  if (failures.length > 0 && failures.length <= 30) {
    for (const f of failures) console.log(`    - ${f.slug}: ${f.reason}`)
  } else if (failures.length > 30) {
    console.log(`  (${failures.length} failures; re-run script to retry)`)
  }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })

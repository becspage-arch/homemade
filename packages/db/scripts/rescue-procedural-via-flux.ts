/**
 * Targeted rescue: for every tutorial currently on procedural-card
 * (heroImageStrategy = PROCEDURAL_CARD), call Flux Schnell directly and
 * attach the result. Skips the orchestrator's free-source loop — those
 * sources have already been excluded for these tutorials.
 *
 * Faster than re-running apply-relevance-verdicts.ts because it only
 * processes the entries that need rescuing, not the whole 1,722 verdicts.
 *
 * Flow per tutorial:
 *   1. Generate a Flux hero from the title (with retry/backoff via the
 *      existing flux-schnell client).
 *   2. Download bytes, push to R2 under tutorials/flux-rescue/.
 *   3. Create a new Media row UNVERIFIED.
 *   4. In a tx: snapshot TutorialVersion, point Tutorial.heroMediaId at
 *      the new Media, flip heroImageStrategy back to AI_GENERATED.
 *   5. Leave the old (REJECTED_USED_PROCEDURAL) Media row as-is — it just
 *      stops being attached as any tutorial's hero.
 *
 * Idempotent: re-running picks up only the remaining procedural cards.
 *
 * Flags:
 *   --limit N    Process at most N tutorials. Default all.
 *   --dry-run    Print what would change, don't write.
 *   --category C Filter by Tutorial.category.slug.
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
  dryRun: boolean
  category: string | null
}

function parseCliFlags(argv: string[]): CliFlags {
  let limit: number | null = null
  let dryRun = false
  let category: string | null = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--dry-run') dryRun = true
    else if (a === '--limit') limit = Number(argv[++i]) || null
    else if (a.startsWith('--limit=')) limit = Number(a.slice('--limit='.length)) || null
    else if (a === '--category') category = argv[++i] ?? null
    else if (a.startsWith('--category=')) category = a.slice('--category='.length)
  }
  return { limit, dryRun, category }
}

function extFromContentType(ct: string | null): { ext: string; mime: string } {
  const c = (ct ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/avif') return { ext: 'avif', mime: 'image/avif' }
  if (c === 'image/jpeg' || c === 'image/jpg') return { ext: 'jpg', mime: 'image/jpeg' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

async function topIngredients(tutorialId: string): Promise<string[]> {
  const rows = await prisma.recipeIngredient.findMany({
    where: { tutorialId },
    select: { ingredient: { select: { name: true } } },
    orderBy: { position: 'asc' },
    take: 3,
  })
  return rows.map((r) => r.ingredient.name.toLowerCase())
}

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2))
  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const stuck = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      heroImageStrategy: 'PROCEDURAL_CARD',
      ...(flags.category ? { category: { slug: flags.category } } : {}),
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

  const total = flags.limit ? Math.min(flags.limit, stuck.length) : stuck.length
  console.log(`rescue-procedural-via-flux: ${stuck.length} stuck tutorials. Processing ${total}.`)

  let recovered = 0
  let failed = 0
  const failures: { slug: string; reason: string }[] = []

  for (let i = 0; i < total; i++) {
    const t = stuck[i]!
    const tag = `[${i + 1}/${total}] ${t.slug}`
    try {
      const ingredients = await topIngredients(t.id)
      let img
      try {
        img = await generateWithFluxSchnell({
          title: t.title,
          category: t.category.slug,
          subCategory: t.subCategory?.slug ?? null,
          ingredients,
        })
      } catch (err) {
        if (err instanceof FluxBillingError) {
          writeFluxBillingHalt(err, {
            script: 'rescue-procedural-via-flux',
            processed: i,
            total,
            extra: { recoveredSoFar: recovered, failedSoFar: failed },
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
        recovered += 1
        console.log(`${tag} DRY would recover via flux-schnell`)
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
      const filename = `${t.slug}-hero-flux-rescue.${ext}`
      const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/flux-rescue' })

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
            changeNote: 'flux-rescue: procedural → AI_GENERATED hero',
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

      recovered += 1
      console.log(`${tag} RECOVERED`)
    } catch (err) {
      failed += 1
      const reason = err instanceof Error ? err.message : String(err)
      failures.push({ slug: t.slug, reason })
      console.log(`${tag} ERROR ${reason}`)
    }
  }

  console.log(`\nDONE`)
  console.log(`  recovered:  ${recovered}`)
  console.log(`  failed:     ${failed}`)
  if (failures.length > 0 && failures.length <= 30) {
    console.log(`  failures:`)
    for (const f of failures) console.log(`    - ${f.slug}: ${f.reason}`)
  } else if (failures.length > 30) {
    console.log(`  failures: ${failures.length} (full list omitted; re-run script to retry)`)
  }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })

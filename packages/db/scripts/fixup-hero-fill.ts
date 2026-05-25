/**
 * Bulk hero image fill — Phase 8 pre-launch.
 *
 * Walks every PUBLISHED Tutorial where no Media row is attached (per the
 * 2026-05-16 audit: 536 rows) and asks the image-sourcing orchestrator to
 * find one. On success, downloads the bytes, pushes to R2, creates a Media
 * row, attaches as hero, flips `heroImageStrategy` to REAL_PHOTO or
 * AI_GENERATED. On failure (free + AI both blank) the row stays on its
 * procedural card.
 *
 * Snapshots TutorialVersion before each mutation. Writes one summary
 * AuditLog row at the end.
 *
 * Resumable: skip rows that already have heroMediaId. Re-running just
 * picks up where it left off.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/fixup-hero-fill.ts [--limit N] [--dry-run]
 *     [--category slug,slug,...] [--no-ai-fallback] [--delay-ms N]
 *
 * --category   Only process tutorials in these category slug(s).
 * --no-ai-fallback  Skip Flux Schnell; stamp PROCEDURAL_CARD on failure.
 * --delay-ms N  Sleep N ms between tutorials (rate-limit safety). Default 0.
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
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

import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'
import { sourceHeroImage } from '../../../apps/web/src/lib/image-sourcing/orchestrator'
import { FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-schnell'
import { writeFluxBillingHalt } from '../../../apps/web/src/lib/image-sourcing/flux-billing-halt'
import { buildRelevancePrompt } from '../../../apps/web/src/lib/image-sourcing/relevance'
import { cacheKeyFor, downloadToCache } from '../../../apps/web/src/lib/image-sourcing/verify'
import { mkdir, writeFile } from 'node:fs/promises'

interface RelevanceQueueEntry {
  mediaId: string
  tutorialId: string
  tutorialSlug: string
  tutorialTitle: string
  tutorialSubtitle: string | null
  tutorialExcerpt: string | null
  category: string
  subCategory: string | null
  keyIngredients: string[]
  imageUrl: string
  imageSource: string
  licenceCode: string | null
  imagePath: string
  promptHints: string
  existingVerificationStatus: string
}

interface CliFlags {
  limit: number | null
  dryRun: boolean
  /** Filter to specific category slugs (comma-separated on CLI). */
  categories: string[] | null
  /** Skip Flux Schnell — pass excludeSources: ['flux-schnell'] to orchestrator. */
  noAiFallback: boolean
  /** ms to sleep between tutorials — keeps API calls within quota. Default 0. */
  delayMs: number
  /** When set, write a relevance queue manifest alongside the run that the
   *  autopilot worker session immediately scores + applies. This is the
   *  per-batch relevance gate documented in docs/relevance-gate-autopilot.md. */
  emitRelevanceQueue: string | null
}

function parseCliFlags(argv: string[]): CliFlags {
  let limit: number | null = null
  let dryRun = false
  let categories: string[] | null = null
  let noAiFallback = false
  let delayMs = 0
  let emitRelevanceQueue: string | null = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--dry-run') dryRun = true
    else if (a === '--no-ai-fallback') noAiFallback = true
    else if (a === '--limit') {
      const v = Number(argv[++i])
      if (Number.isFinite(v) && v > 0) limit = v
    } else if (a.startsWith('--limit=')) {
      const v = Number(a.slice('--limit='.length))
      if (Number.isFinite(v) && v > 0) limit = v
    } else if (a === '--delay-ms') {
      const v = Number(argv[++i])
      if (Number.isFinite(v) && v >= 0) delayMs = v
    } else if (a.startsWith('--delay-ms=')) {
      const v = Number(a.slice('--delay-ms='.length))
      if (Number.isFinite(v) && v >= 0) delayMs = v
    } else if (a === '--category') {
      const raw = argv[++i] ?? ''
      categories = raw.split(',').map((s) => s.trim()).filter(Boolean)
    } else if (a.startsWith('--category=')) {
      const raw = a.slice('--category='.length)
      categories = raw.split(',').map((s) => s.trim()).filter(Boolean)
    } else if (a === '--emit-relevance-queue') {
      emitRelevanceQueue = argv[++i] ?? null
    } else if (a.startsWith('--emit-relevance-queue=')) {
      emitRelevanceQueue = a.slice('--emit-relevance-queue='.length)
    }
  }
  return { limit, dryRun, categories, noAiFallback, delayMs, emitRelevanceQueue }
}

function extFromContentType(ct: string | null): { ext: string; mime: string } {
  const c = (ct ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/avif') return { ext: 'avif', mime: 'image/avif' }
  if (c === 'image/jpeg' || c === 'image/jpg') return { ext: 'jpg', mime: 'image/jpeg' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

interface TopIngredient { name: string; position: number }

async function topIngredients(tutorialId: string): Promise<string[]> {
  const rows = await prisma.recipeIngredient.findMany({
    where: { tutorialId },
    select: {
      position: true,
      ingredient: { select: { name: true } },
    },
    orderBy: { position: 'asc' },
    take: 5,
  })
  const ranked: TopIngredient[] = rows
    .map((r) => ({ name: r.ingredient.name, position: r.position }))
    .filter((r) => r.name && r.name.length > 0)
  return ranked.slice(0, 3).map((r) => r.name.toLowerCase())
}

interface PerTutorialResult {
  slug: string
  outcome: 'free' | 'ai-generated' | 'failed' | 'skipped-no-bytes' | 'error'
  source?: string | null
  requiresAttribution?: boolean
  triedSources?: string[]
  errorMessage?: string
  mediaId?: string
}

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2))
  console.log(
    `hero-fill: dryRun=${flags.dryRun}, limit=${flags.limit ?? 'none'}, ` +
    `categories=${flags.categories?.join(',') ?? 'all'}, noAiFallback=${flags.noAiFallback}`,
  )

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const candidates = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      heroMediaId: null,
      ...(flags.categories ? { category: { slug: { in: flags.categories } } } : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      body: true,
      status: true,
      categoryId: true,
      subCategoryId: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })

  const total = flags.limit ? Math.min(flags.limit, candidates.length) : candidates.length
  console.log(`hero-fill: ${candidates.length} candidates (heroMediaId IS NULL). Processing ${total}.`)

  const counts: Record<string, number> = {
    'unsplash': 0,
    'pexels': 0,
    'wikimedia': 0,
    'pixabay': 0,
    'flux-schnell': 0,
    'failed': 0,
    'error': 0,
  }
  const results: PerTutorialResult[] = []
  const relevanceQueue: RelevanceQueueEntry[] = []
  // Once fal.ai billing fails for any tutorial, skip Flux for the rest
  // of this run. Tutorials that need Flux stay UNSET — they get picked
  // up automatically on the next batch when balance is healthy. Notify
  // Rebecca once via SYSTEM notification + push.
  let fluxUnavailable = false

  for (let i = 0; i < total; i++) {
    const t = candidates[i]!
    const tag = `[${i + 1}/${total}] ${t.slug}`

    try {
      const ingredients = await topIngredients(t.id)
      // If a prior tutorial in this run hit a fal.ai billing error,
      // skip Flux for the remainder. Tutorials that would have needed
      // Flux land as outcome='failed' and stay UNSET — the next batch
      // retries them automatically when balance is healthy.
      const skipFlux = flags.noAiFallback || fluxUnavailable
      const result = await sourceHeroImage(
        {
          title: t.title,
          category: t.category.slug,
          subCategory: t.subCategory?.slug ?? null,
          ingredients,
        },
        skipFlux ? { excludeSources: ['flux-schnell' as const] } : {},
      )

      if (result.outcome === 'failed' || !result.image) {
        counts['failed'] += 1
        results.push({ slug: t.slug, outcome: 'failed', triedSources: result.triedSources })
        console.log(`${tag} FAILED — tried ${result.triedSources.join(', ')}`)
        if (flags.noAiFallback && !flags.dryRun) {
          // Explicitly stamp PROCEDURAL_CARD so the renderer knows this was
          // intentional (free sources exhausted, AI deliberately skipped).
          await prisma.tutorial.update({
            where: { id: t.id },
            data: { heroImageStrategy: 'PROCEDURAL_CARD' },
          })
        }
        continue
      }

      const img = result.image
      if (flags.dryRun) {
        counts[img.source] = (counts[img.source] ?? 0) + 1
        results.push({
          slug: t.slug,
          outcome: result.outcome,
          source: img.source,
          requiresAttribution: img.requiresAttribution,
          triedSources: result.triedSources,
        })
        console.log(`${tag} DRY ${result.outcome} via ${img.source} (${img.width}x${img.height})`)
        continue
      }

      // Download bytes from the upstream URL. Wikimedia requires a
      // descriptive User-Agent on every request including media downloads.
      // Other hosts ignore it.
      const dl = await fetch(img.url, {
        headers: {
          'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
          Accept: 'image/*,*/*;q=0.8',
        },
      })
      if (!dl.ok) {
        counts['error'] += 1
        results.push({ slug: t.slug, outcome: 'error', errorMessage: `download ${dl.status}`, source: img.source })
        console.log(`${tag} ERROR download ${dl.status} from ${img.source}`)
        continue
      }
      const buf = Buffer.from(await dl.arrayBuffer())
      if (buf.length === 0) {
        counts['error'] += 1
        results.push({ slug: t.slug, outcome: 'skipped-no-bytes', source: img.source })
        console.log(`${tag} SKIP empty body from ${img.source}`)
        continue
      }

      const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
      const filename = `${t.slug}-hero.${ext}`

      const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/hero-fill' })

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
            body: t.body as Prisma.InputJsonValue,
            status: t.status,
            authorId: author.id,
            changeNote: `fixup-hero-fill: attach ${img.source} hero (${img.requiresAttribution ? 'attribution required' : 'no attribution'})`,
          },
        })
        await tx.tutorial.update({
          where: { id: t.id },
          data: {
            heroMediaId: media.id,
            heroImageStrategy: img.source === 'flux-schnell' ? 'AI_GENERATED' : 'REAL_PHOTO',
          },
        })
      })

      counts[img.source] = (counts[img.source] ?? 0) + 1
      results.push({
        slug: t.slug,
        outcome: result.outcome,
        source: img.source,
        requiresAttribution: img.requiresAttribution,
        triedSources: result.triedSources,
        mediaId: media.id,
      })

      // When --emit-relevance-queue is set, capture the entry for the
      // post-batch relevance gate. Cache the bytes we already downloaded
      // so the worker doesn't fetch them again.
      if (flags.emitRelevanceQueue) {
        const ingNames = ingredients
        const promptHints = buildRelevancePrompt({
          tutorialTitle: t.title,
          tutorialSubtitle: t.subtitle ?? null,
          tutorialExcerpt: t.excerpt ?? null,
          category: t.category.slug,
          subCategory: t.subCategory?.slug ?? null,
          keyIngredients: ingNames,
          imageSource: img.source,
          imageUrl: img.url,
        })
        const cacheDir = resolve(__dirname, '..', '..', '..', '.claude', 'tmp', 'relevance-cache')
        await mkdir(cacheDir, { recursive: true })
        const cachedPath = resolve(cacheDir, `${media.id}-${cacheKeyFor(img.url)}.${ext}`)
        await writeFile(cachedPath, buf)
        relevanceQueue.push({
          mediaId: media.id,
          tutorialId: t.id,
          tutorialSlug: t.slug,
          tutorialTitle: t.title,
          tutorialSubtitle: t.subtitle ?? null,
          tutorialExcerpt: t.excerpt ?? null,
          category: t.category.slug,
          subCategory: t.subCategory?.slug ?? null,
          keyIngredients: ingNames,
          imageUrl: img.url,
          imageSource: img.source,
          licenceCode: img.licenceCode,
          imagePath: cachedPath,
          promptHints,
          existingVerificationStatus: 'UNVERIFIED',
        })
      }

      console.log(`${tag} OK ${img.source} (${img.width}x${img.height})${img.requiresAttribution ? ' [attr]' : ''}`)
    } catch (err) {
      if (err instanceof FluxBillingError) {
        // First time this run we see a billing error: notify Rebecca,
        // then flip into skip-Flux mode for the rest of this batch.
        // Don't exit — keep processing for tutorials that the free
        // sources can satisfy without Flux.
        if (!fluxUnavailable) {
          await writeFluxBillingHalt(err, {
            script: 'fixup-hero-fill',
            processed: i,
            total,
            extra: { ...counts },
            prisma,
          })
          fluxUnavailable = true
        }
        counts['failed'] += 1
        results.push({
          slug: t.slug,
          outcome: 'failed',
          triedSources: [],
          errorMessage: 'flux billing — left UNSET for next batch',
        })
        console.log(`${tag} flux-billing → left UNSET; next batch retries`)
        continue
      }
      counts['error'] += 1
      const message = err instanceof Error ? err.message : String(err)
      results.push({ slug: t.slug, outcome: 'error', errorMessage: message })
      console.error(`${tag} ERROR ${message}`)
    }

    // Persist progress every 25 tutorials so a crash doesn't lose the report.
    if ((i + 1) % 25 === 0) {
      const file = resolve(__dirname, '..', '..', '..', 'docs', 'hero-fill-progress.json')
      writeFileSync(file, JSON.stringify({ counts, results }, null, 2), 'utf8')
    }

    if (flags.delayMs > 0 && i < total - 1) {
      await new Promise((r) => setTimeout(r, flags.delayMs))
    }
  }

  const file = resolve(__dirname, '..', '..', '..', 'docs', 'hero-fill-progress.json')
  writeFileSync(file, JSON.stringify({ counts, results }, null, 2), 'utf8')

  if (!flags.dryRun) {
    await prisma.auditLog.create({
      data: {
        actorId: author.id,
        action: 'tutorial.fixup-hero-fill',
        resource: 'tutorials',
        metadata: {
          runDate: new Date().toISOString().slice(0, 10),
          processed: total,
          categories: flags.categories ?? 'all',
          noAiFallback: flags.noAiFallback,
          counts,
        } as Prisma.InputJsonValue,
      },
    })
  }

  if (flags.emitRelevanceQueue && relevanceQueue.length > 0) {
    const queueFile = {
      generatedAt: new Date().toISOString(),
      totalCandidates: relevanceQueue.length,
      enqueued: relevanceQueue.length,
      filter: {
        category: flags.categories ? flags.categories.join(',') : 'all',
        sources: ['unsplash', 'pexels', 'wikimedia', 'pixabay', 'flux-schnell'],
        stratify: false,
      },
      entries: relevanceQueue,
    }
    const queuePath = resolve(process.cwd(), flags.emitRelevanceQueue)
    await mkdir(dirname(queuePath), { recursive: true })
    await writeFile(queuePath, JSON.stringify(queueFile, null, 2), 'utf8')
    console.log(`\nrelevance queue written to ${queuePath}`)
    console.log(
      `Next step (autopilot worker): score each entry against its promptHints, ` +
        `write verdicts JSON, run apply-relevance-verdicts.ts. See ` +
        `docs/relevance-gate-autopilot.md.`,
    )
  }

  console.log('\nDONE')
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })

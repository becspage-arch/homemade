/**
 * Image verification — propose a batch.
 *
 * Pulls a batch of Media rows currently UNVERIFIED that are attached as a
 * Tutorial hero. For each, downloads the image bytes to a local cache and
 * writes a manifest the worker session reads inline. The worker:
 *
 *   1. Reads `docs/image-verification-queue.json`.
 *   2. Opens each `imagePath` with its built-in Read tool (multimodal image
 *      capability — no paid API needed).
 *   3. Decides verified / rejected against the prompt hints embedded in the
 *      manifest.
 *   4. Writes verdicts to `docs/image-verification-verdicts.json`.
 *   5. Runs `apply-media-verdicts.ts` to commit the verdicts and regenerate
 *      hero images for rejected entries.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/verify-media-batch.ts \
 *     [--batch-size N] [--category cooking|baking|mindset|all] \
 *     [--status UNVERIFIED|REJECTED|all]
 *
 * Flags:
 *   --batch-size N   How many Media rows to enqueue (default 50).
 *   --category C     Filter by Tutorial.category.slug. Default `all`.
 *   --status S       Filter by Media.verificationStatus. Default UNVERIFIED.
 *   --resume         Skip Media IDs already present in the latest queue file.
 *   --queue PATH     Path to write the queue manifest (default
 *                    docs/image-verification-queue.json).
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
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

import { prisma } from '../src'
import {
  buildVerificationPromptHints,
  cacheKeyFor,
} from '../../../apps/web/src/lib/image-sourcing/verify'

interface CliFlags {
  batchSize: number
  category: string
  status: string
  resume: boolean
  queuePath: string
}

function parseCliFlags(argv: string[]): CliFlags {
  let batchSize = 50
  let category = 'all'
  let status = 'UNVERIFIED'
  let resume = false
  let queuePath = ''
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    const next = () => argv[++i]!
    if (a === '--batch-size') batchSize = Number(next()) || batchSize
    else if (a.startsWith('--batch-size=')) batchSize = Number(a.slice('--batch-size='.length)) || batchSize
    else if (a === '--category') category = next()
    else if (a.startsWith('--category=')) category = a.slice('--category='.length)
    else if (a === '--status') status = next()
    else if (a.startsWith('--status=')) status = a.slice('--status='.length)
    else if (a === '--resume') resume = true
    else if (a === '--queue') queuePath = next()
    else if (a.startsWith('--queue=')) queuePath = a.slice('--queue='.length)
  }
  if (!queuePath) {
    queuePath = resolve(__dirname, '..', '..', '..', 'docs', 'image-verification-queue.json')
  }
  return { batchSize, category, status, resume, queuePath }
}

interface QueueEntry {
  mediaId: string
  tutorialId: string
  tutorialSlug: string
  tutorialTitle: string
  category: string
  subCategory: string | null
  keyIngredients: string[]
  imageUrl: string
  imageSource: string | null
  licenceCode: string | null
  imagePath: string
  promptHints: string
}

interface QueueFile {
  generatedAt: string
  totalUnverified: number
  enqueued: number
  entries: QueueEntry[]
}

const CACHE_DIR = resolve(__dirname, '..', '..', '..', '.claude', 'tmp', 'verify-cache')

async function downloadAndCache(url: string, mediaId: string): Promise<string> {
  const ext = pickExtension(url)
  const localPath = resolve(CACHE_DIR, `${mediaId}-${cacheKeyFor(url)}.${ext}`)
  if (existsSync(localPath)) return localPath
  await mkdir(dirname(localPath), { recursive: true })
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
      Accept: 'image/*,*/*;q=0.8',
    },
  })
  if (!res.ok) {
    throw new Error(`download failed (${res.status}) for ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(localPath, buf)
  return localPath
}

function pickExtension(url: string): string {
  const m = url.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif)(\?|$)/)
  if (!m) return 'jpg'
  const e = m[1]
  return e === 'jpeg' ? 'jpg' : e!
}

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
  return rows
    .map((r) => r.ingredient.name)
    .filter((n): n is string => Boolean(n))
    .slice(0, 5)
    .map((n) => n.toLowerCase())
}

async function loadExistingQueueMediaIds(queuePath: string): Promise<Set<string>> {
  if (!existsSync(queuePath)) return new Set()
  try {
    const raw = readFileSync(queuePath, 'utf8')
    const parsed = JSON.parse(raw) as QueueFile
    return new Set(parsed.entries.map((e) => e.mediaId))
  } catch {
    return new Set()
  }
}

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2))
  console.log(
    `verify-media-batch: batchSize=${flags.batchSize}, category=${flags.category}, ` +
      `status=${flags.status}, resume=${flags.resume}`,
  )

  const statusFilter: 'UNVERIFIED' | 'REJECTED' | undefined =
    flags.status === 'all' ? undefined : (flags.status as 'UNVERIFIED' | 'REJECTED')

  const whereTutorial =
    flags.category === 'all' ? undefined : { category: { slug: flags.category } }

  const tutorials = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      heroMediaId: { not: null },
      ...(whereTutorial ?? {}),
      hero: {
        is: statusFilter ? { verificationStatus: statusFilter } : undefined,
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      categoryId: true,
      heroMediaId: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
      hero: {
        select: {
          id: true,
          r2Key: true,
          cloudflareId: true,
          source: true,
          sourceUrl: true,
          licenceCode: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { slug: 'asc' },
  })

  const totalUnverified = tutorials.length
  console.log(`verify-media-batch: ${totalUnverified} candidate tutorials match filter.`)

  const skip = flags.resume ? await loadExistingQueueMediaIds(flags.queuePath) : new Set<string>()

  const entries: QueueEntry[] = []
  for (const t of tutorials) {
    if (entries.length >= flags.batchSize) break
    if (!t.hero || !t.heroMediaId) continue
    if (skip.has(t.hero.id)) continue
    const url = imageUrlFor(t.hero)
    if (!url) continue
    try {
      const localPath = await downloadAndCache(url, t.hero.id)
      const ingredients = await topIngredients(t.id)
      const promptHints = buildVerificationPromptHints({
        imageUrl: url,
        imageSource: t.hero.source ?? 'unknown',
        tutorialTitle: t.title,
        keyIngredients: ingredients,
        cuisine: t.subCategory?.slug ?? null,
        mealType: null,
        category: t.category.slug,
      })
      entries.push({
        mediaId: t.hero.id,
        tutorialId: t.id,
        tutorialSlug: t.slug,
        tutorialTitle: t.title,
        category: t.category.slug,
        subCategory: t.subCategory?.slug ?? null,
        keyIngredients: ingredients,
        imageUrl: url,
        imageSource: t.hero.source,
        licenceCode: t.hero.licenceCode,
        imagePath: localPath,
        promptHints,
      })
      console.log(`  + ${t.slug} (${entries.length}/${flags.batchSize})`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`  ! ${t.slug} skipped: ${msg}`)
    }
  }

  const queue: QueueFile = {
    generatedAt: new Date().toISOString(),
    totalUnverified,
    enqueued: entries.length,
    entries,
  }

  await mkdir(dirname(flags.queuePath), { recursive: true })
  await writeFile(flags.queuePath, JSON.stringify(queue, null, 2), 'utf8')
  console.log(
    `\nverify-media-batch: wrote ${entries.length} entries to ${flags.queuePath}`,
  )
  console.log('Next: worker reads manifest, views each imagePath with Read tool,')
  console.log('writes verdicts to docs/image-verification-verdicts.json, then runs')
  console.log('`pnpm --filter @homemade/db exec tsx scripts/apply-media-verdicts.ts`.')
}

interface HeroSubset {
  id: string
  r2Key: string | null
  cloudflareId: string | null
  source: string | null
  sourceUrl: string | null
  licenceCode: string | null
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED' | 'REJECTED_USED_PROCEDURAL'
}

function imageUrlFor(hero: HeroSubset): string | null {
  // The cleanest URL to show the worker is the public CDN: it serves R2 via
  // the Cloudflare image transform. Falls back to the upstream sourceUrl
  // when no R2 key is present (shouldn't happen for our pipeline-attached
  // images but the field is nullable so handle it).
  if (hero.r2Key) {
    return `https://media.homemade.education/${hero.r2Key}`
  }
  if (hero.sourceUrl && hero.sourceUrl.match(/^https?:\/\//)) {
    return hero.sourceUrl
  }
  return null
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })

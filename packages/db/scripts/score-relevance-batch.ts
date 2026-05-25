/**
 * Subject-relevance scoring — enqueue a batch.
 *
 * Companion to verify-media-batch.ts. Where the existing 2-tier verification
 * runs lenient subject-checks (the rubric let the Yorkshire-pudding-pasta
 * and thyme-cough-syrup-bee images through), this batch enqueues the same
 * pool against the strict 3-tier rubric in relevance.ts.
 *
 * Output: a queue manifest (default docs/image-relevance-queue.json) with
 * one entry per Media row. The worker session reads each cached image with
 * its Read tool, evaluates against the embedded prompt, writes verdicts to
 * docs/image-relevance-verdicts.json, then runs apply-relevance-verdicts.ts
 * to commit + re-source WRONG entries.
 *
 * Defaults:
 *   - status filter: PUBLISHED only (DRAFT is covered by the voice/UX session)
 *   - source filter: real-photo + flux-schnell (skip procedural-card / null)
 *   - batch size: 50 per manifest
 *
 * Flags:
 *   --batch-size N        Max entries to write to this manifest. Default 50.
 *   --category SLUG       Filter by Tutorial.category.slug. Default 'all'.
 *   --sources LIST        Comma-separated list of Media.source values to
 *                         include. Default 'unsplash,pexels,wikimedia,pixabay,flux-schnell'.
 *   --stratify            Pull a stratified sample across categories (best
 *                         used with a small --batch-size for a calibration pass).
 *   --resume              Skip Media IDs already present in the manifest.
 *   --skip-mediaids PATH  Skip Media IDs listed in JSON file at PATH
 *                         (array of strings). Used to avoid re-scoring across
 *                         multiple batched runs.
 *   --queue PATH          Output manifest path. Default
 *                         docs/image-relevance-queue.json.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/score-relevance-batch.ts \
 *     [flags as above]
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
  buildRelevancePrompt,
  type RelevanceInput,
} from '../../../apps/web/src/lib/image-sourcing/relevance'
import { cacheKeyFor } from '../../../apps/web/src/lib/image-sourcing/verify'

interface CliFlags {
  batchSize: number
  category: string
  sources: string[]
  stratify: boolean
  resume: boolean
  skipMediaIdsPath: string
  queuePath: string
  /** When true, only Media rows with verificationStatus = UNVERIFIED are
   *  enqueued. Used by the autopilot's per-batch relevance gate: run
   *  fixup-hero-fill (attaches new UNVERIFIED rows) → score-relevance-batch
   *  --unverified-only (picks up just those rows) → apply verdicts. */
  unverifiedOnly: boolean
}

function parseCliFlags(argv: string[]): CliFlags {
  let batchSize = 50
  let category = 'all'
  let sources: string[] = ['unsplash', 'pexels', 'wikimedia', 'pixabay', 'flux-schnell']
  let stratify = false
  let resume = false
  let skipMediaIdsPath = ''
  let queuePath = ''
  let unverifiedOnly = false
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    const next = () => argv[++i]!
    if (a === '--batch-size') batchSize = Number(next()) || batchSize
    else if (a.startsWith('--batch-size=')) batchSize = Number(a.slice('--batch-size='.length)) || batchSize
    else if (a === '--category') category = next()
    else if (a.startsWith('--category=')) category = a.slice('--category='.length)
    else if (a === '--sources') sources = next().split(',').map((s) => s.trim()).filter(Boolean)
    else if (a.startsWith('--sources=')) sources = a.slice('--sources='.length).split(',').map((s) => s.trim()).filter(Boolean)
    else if (a === '--stratify') stratify = true
    else if (a === '--resume') resume = true
    else if (a === '--unverified-only') unverifiedOnly = true
    else if (a === '--skip-mediaids') skipMediaIdsPath = next()
    else if (a.startsWith('--skip-mediaids=')) skipMediaIdsPath = a.slice('--skip-mediaids='.length)
    else if (a === '--queue') queuePath = next()
    else if (a.startsWith('--queue=')) queuePath = a.slice('--queue='.length)
  }
  if (!queuePath) {
    queuePath = resolve(__dirname, '..', '..', '..', 'docs', 'image-relevance-queue.json')
  }
  return { batchSize, category, sources, stratify, resume, skipMediaIdsPath, queuePath, unverifiedOnly }
}

interface QueueEntry {
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
  /** Pre-existing 2-tier verification status — useful in the audit to see
   *  how often the lenient rubric let WRONG-subject images through. */
  existingVerificationStatus: string
}

interface QueueFile {
  generatedAt: string
  totalCandidates: number
  enqueued: number
  filter: {
    category: string
    sources: string[]
    stratify: boolean
  }
  entries: QueueEntry[]
}

const CACHE_DIR = resolve(__dirname, '..', '..', '..', '.claude', 'tmp', 'relevance-cache')

async function downloadAndCache(url: string, mediaId: string): Promise<string> {
  const ext = pickExtension(url)
  const localPath = resolve(CACHE_DIR, `${mediaId}-${cacheKeyFor(url)}.${ext}`)
  if (existsSync(localPath)) return localPath
  await mkdir(dirname(localPath), { recursive: true })
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
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

function loadSkipMediaIds(path: string): Set<string> {
  if (!path || !existsSync(path)) return new Set()
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return new Set(parsed.filter((v): v is string => typeof v === 'string'))
  } catch {}
  return new Set()
}

interface TutorialRow {
  id: string
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  categorySlug: string
  subCategorySlug: string | null
  mediaId: string
  mediaR2Key: string | null
  mediaSource: string
  mediaLicenceCode: string | null
  mediaVerificationStatus: string
  ingredients: string[]
}

async function fetchCandidates(
  category: string,
  sources: string[],
  unverifiedOnly: boolean,
): Promise<TutorialRow[]> {
  const whereCategory = category === 'all' ? undefined : { category: { slug: category } }
  const tutorials = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      heroMediaId: { not: null },
      ...(whereCategory ?? {}),
      hero: {
        is: {
          source: { in: sources },
          ...(unverifiedOnly ? { verificationStatus: 'UNVERIFIED' as const } : {}),
        },
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
      hero: {
        select: {
          id: true,
          r2Key: true,
          source: true,
          licenceCode: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { slug: 'asc' },
  })

  const rows: TutorialRow[] = []
  for (const t of tutorials) {
    if (!t.hero) continue
    rows.push({
      id: t.id,
      slug: t.slug,
      title: t.title,
      subtitle: t.subtitle ?? null,
      excerpt: t.excerpt ?? null,
      categorySlug: t.category.slug,
      subCategorySlug: t.subCategory?.slug ?? null,
      mediaId: t.hero.id,
      mediaR2Key: t.hero.r2Key,
      mediaSource: t.hero.source ?? 'unknown',
      mediaLicenceCode: t.hero.licenceCode,
      mediaVerificationStatus: t.hero.verificationStatus,
      ingredients: [],
    })
  }

  // Hydrate ingredients for recipe categories
  for (const r of rows) {
    if (['cooking', 'baking', 'herbal-medicine', 'natural-home'].includes(r.categorySlug)) {
      r.ingredients = await topIngredients(r.id)
    }
  }

  return rows
}

function stratify(rows: TutorialRow[], total: number): TutorialRow[] {
  const byCategory = new Map<string, TutorialRow[]>()
  for (const r of rows) {
    if (!byCategory.has(r.categorySlug)) byCategory.set(r.categorySlug, [])
    byCategory.get(r.categorySlug)!.push(r)
  }
  // Deterministic shuffle (stable across runs given the same input order):
  // sort each bucket by md5-style hash of mediaId to avoid alphabetic bias.
  for (const [, list] of byCategory) {
    list.sort((a, b) => hashSlug(a.mediaId).localeCompare(hashSlug(b.mediaId)))
  }
  const categories = Array.from(byCategory.keys())
  const perCat = Math.max(1, Math.floor(total / Math.max(1, categories.length)))
  const out: TutorialRow[] = []
  for (const cat of categories) {
    const bucket = byCategory.get(cat)!
    out.push(...bucket.slice(0, perCat))
  }
  // If we have leftover slots (cat count × perCat < total), fill from
  // largest buckets in round-robin.
  let i = 0
  while (out.length < total) {
    const cat = categories[i % categories.length]!
    const bucket = byCategory.get(cat)!
    const taken = out.filter((r) => r.categorySlug === cat).length
    if (bucket.length > taken) out.push(bucket[taken]!)
    i++
    if (i > 100000) break
  }
  return out.slice(0, total)
}

function hashSlug(s: string): string {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0
  return (h >>> 0).toString(16).padStart(8, '0')
}

function imageUrlFor(r: TutorialRow): string | null {
  if (r.mediaR2Key) return `https://media.homemade.education/${r.mediaR2Key}`
  return null
}

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2))
  console.log(
    `score-relevance-batch: batch-size=${flags.batchSize}, category=${flags.category}, ` +
      `sources=[${flags.sources.join(',')}], stratify=${flags.stratify}, resume=${flags.resume}, ` +
      `unverifiedOnly=${flags.unverifiedOnly}`,
  )

  const all = await fetchCandidates(flags.category, flags.sources, flags.unverifiedOnly)
  console.log(`  candidate pool: ${all.length}`)

  const resumeSkip = flags.resume ? await loadExistingQueueMediaIds(flags.queuePath) : new Set<string>()
  const externalSkip = loadSkipMediaIds(flags.skipMediaIdsPath)
  const skip = new Set<string>([...resumeSkip, ...externalSkip])
  if (skip.size > 0) console.log(`  skipping ${skip.size} already-processed entries`)

  const filtered = all.filter((r) => !skip.has(r.mediaId))
  const selected = flags.stratify ? stratify(filtered, flags.batchSize) : filtered.slice(0, flags.batchSize)

  const entries: QueueEntry[] = []
  for (const r of selected) {
    const url = imageUrlFor(r)
    if (!url) {
      console.warn(`  ! ${r.slug} skipped: no resolvable image URL`)
      continue
    }
    try {
      const localPath = await downloadAndCache(url, r.mediaId)
      const input: RelevanceInput = {
        tutorialTitle: r.title,
        tutorialSubtitle: r.subtitle,
        tutorialExcerpt: r.excerpt,
        category: r.categorySlug,
        subCategory: r.subCategorySlug,
        keyIngredients: r.ingredients,
        imageSource: r.mediaSource,
        imageUrl: url,
      }
      const promptHints = buildRelevancePrompt(input)
      entries.push({
        mediaId: r.mediaId,
        tutorialId: r.id,
        tutorialSlug: r.slug,
        tutorialTitle: r.title,
        tutorialSubtitle: r.subtitle,
        tutorialExcerpt: r.excerpt,
        category: r.categorySlug,
        subCategory: r.subCategorySlug,
        keyIngredients: r.ingredients,
        imageUrl: url,
        imageSource: r.mediaSource,
        licenceCode: r.mediaLicenceCode,
        imagePath: localPath,
        promptHints,
        existingVerificationStatus: r.mediaVerificationStatus,
      })
      console.log(`  + ${r.categorySlug.padEnd(20)} ${r.slug} (${entries.length}/${flags.batchSize})`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`  ! ${r.slug} skipped: ${msg}`)
    }
  }

  const queue: QueueFile = {
    generatedAt: new Date().toISOString(),
    totalCandidates: all.length,
    enqueued: entries.length,
    filter: {
      category: flags.category,
      sources: flags.sources,
      stratify: flags.stratify,
    },
    entries,
  }

  await mkdir(dirname(flags.queuePath), { recursive: true })
  await writeFile(flags.queuePath, JSON.stringify(queue, null, 2), 'utf8')
  console.log(`\nscore-relevance-batch: wrote ${entries.length} entries to ${flags.queuePath}`)
  console.log('Next: worker reads each imagePath with Read tool, evaluates against promptHints,')
  console.log('writes verdicts to docs/image-relevance-verdicts.json, then runs')
  console.log('`pnpm --filter @homemade/db exec tsx scripts/apply-relevance-verdicts.ts`.')
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })

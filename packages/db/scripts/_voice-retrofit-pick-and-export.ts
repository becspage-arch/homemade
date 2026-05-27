/**
 * Voice retrofit: pick and export the next batch.
 *
 * Picks 50 PUBLISHED tutorials where revisedFrom IS NULL, applies the
 * content-type spread + category-cap rules from the worker brief, writes
 * docs/voice-retrofit-<batch-id>/_slugs.json, and exports each picked
 * tutorial's body to docs/voice-retrofit-<batch-id>/<slug>.json in the
 * same shape the voice-check + apply scripts expect.
 *
 * Batch id passed as the first arg, e.g. 2026-05-25-batch1.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? 63)
const PER_CATEGORY_CAP = Number(process.env.PER_CATEGORY_CAP ?? 19)

/**
 * Content-type buckets used for the first-3-batches spread rule. Mapped from
 * Tutorial.type + Category.slug, mirrored from the voice-spec §3.
 */
function bucketFor(type: string, categorySlug: string | null | undefined): string {
  const cat = (categorySlug ?? '').toLowerCase()
  if (cat === 'cooking') return 'recipe-cooking'
  if (cat === 'baking') return 'recipe-baking'
  if (cat === 'herbal-medicine') return 'herbal'
  if (cat === 'mindset') return 'mindset'
  if (cat === 'gardening') return 'growing-guide'
  if (cat === 'home-repair') return 'home-repair'
  if (cat === 'natural-home') return 'natural-home'
  if (cat === 'sustainability') return 'sustainability'
  if (cat === 'animals-smallholding') return 'animals-smallholding'
  // Craft families split by type
  const craftCats = new Set([
    'sewing',
    'knitting',
    'crochet',
    'fibre-arts',
    'needlework',
    'paper-craft',
    'pottery-ceramics',
    'wood-craft',
  ])
  if (craftCats.has(cat)) {
    if (type === 'PATTERN') return 'craft-project'
    return 'craft-technique'
  }
  return `other-${cat || 'unknown'}`
}

async function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('usage: tsx _voice-retrofit-pick-and-export.ts <batch-id>')
    process.exit(1)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const { prisma } = await import('../src/index.js')

  const candidates: any[] = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: {
      slug: true,
      title: true,
      type: true,
      category: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })

  console.log(`[INFO] ${candidates.length} candidate(s) (PUBLISHED + voiceRetrofittedAt IS NULL)`)

  if (candidates.length === 0) {
    writeFileSync(
      resolve(outDir, '_slugs.json'),
      JSON.stringify({ batchId, slugs: [], note: 'No candidates left — retrofit complete.' }, null, 2) + '\n',
      'utf8',
    )
    console.log('[DONE] retrofit complete — 0 candidates left.')
    await prisma.$disconnect()
    return
  }

  // Group by bucket and category.
  const byBucket = new Map<string, any[]>()
  for (const c of candidates) {
    const bucket = bucketFor(c.type, c.category?.slug)
    if (!byBucket.has(bucket)) byBucket.set(bucket, [])
    byBucket.get(bucket)!.push(c)
  }

  console.log(`[INFO] candidates by bucket:`)
  for (const [bucket, items] of Array.from(byBucket.entries()).sort()) {
    console.log(`         ${bucket.padEnd(28)}  ${items.length}`)
  }

  // First-3-batches rule: ensure >=2 from every bucket that exists.
  // (Count existing voice-retrofit-* dirs to determine batch position — but
  // we don't need fs.readdirSync here: the caller will only pass batch1,
  // batch2, batch3 etc. We enforce ≥2 per bucket whenever there are enough
  // candidates in that bucket. Spread by category cap holds always.)
  const buckets = Array.from(byBucket.keys()).sort()

  const picked: any[] = []
  const perCategoryCount = new Map<string, number>()
  const pickedSlugs = new Set<string>()

  // Phase 1 — guarantee 2 from each non-empty bucket.
  for (const bucket of buckets) {
    const items = byBucket.get(bucket) ?? []
    let taken = 0
    for (const t of items) {
      if (taken >= 2) break
      const cat = t.category?.slug ?? '?'
      if ((perCategoryCount.get(cat) ?? 0) >= PER_CATEGORY_CAP) continue
      picked.push(t)
      pickedSlugs.add(t.slug)
      perCategoryCount.set(cat, (perCategoryCount.get(cat) ?? 0) + 1)
      taken++
    }
  }

  // Phase 2 — round-robin across buckets to fill to BATCH_SIZE, respecting
  // the per-category cap. We rotate so no single bucket / category fills the
  // remainder.
  let progressed = true
  while (picked.length < BATCH_SIZE && progressed) {
    progressed = false
    for (const bucket of buckets) {
      if (picked.length >= BATCH_SIZE) break
      const items = byBucket.get(bucket) ?? []
      for (const t of items) {
        if (pickedSlugs.has(t.slug)) continue
        const cat = t.category?.slug ?? '?'
        if ((perCategoryCount.get(cat) ?? 0) >= PER_CATEGORY_CAP) continue
        picked.push(t)
        pickedSlugs.add(t.slug)
        perCategoryCount.set(cat, (perCategoryCount.get(cat) ?? 0) + 1)
        progressed = true
        break // one per bucket per round
      }
    }
  }

  // If we still haven't filled (e.g. category cap blocking), fill from any
  // remaining bucket ignoring the cap as a fallback — but log.
  if (picked.length < BATCH_SIZE) {
    console.log(`[WARN] cap-constrained, filling residual from any bucket`)
    for (const t of candidates) {
      if (picked.length >= BATCH_SIZE) break
      if (pickedSlugs.has(t.slug)) continue
      picked.push(t)
      pickedSlugs.add(t.slug)
    }
  }

  console.log(`[INFO] picked ${picked.length} tutorial(s) for batch ${batchId}`)
  console.log(`[INFO] picked by bucket:`)
  const pickedByBucket = new Map<string, number>()
  for (const t of picked) {
    const b = bucketFor(t.type, t.category?.slug)
    pickedByBucket.set(b, (pickedByBucket.get(b) ?? 0) + 1)
  }
  for (const [bucket, n] of Array.from(pickedByBucket.entries()).sort()) {
    console.log(`         ${bucket.padEnd(28)}  ${n}`)
  }
  console.log(`[INFO] picked by category:`)
  for (const [cat, n] of Array.from(perCategoryCount.entries()).sort()) {
    console.log(`         ${cat.padEnd(28)}  ${n}`)
  }

  // Persist slug list.
  writeFileSync(
    resolve(outDir, '_slugs.json'),
    JSON.stringify(
      {
        batchId,
        count: picked.length,
        slugs: picked.map((t) => t.slug),
        byBucket: Object.fromEntries(pickedByBucket),
        byCategory: Object.fromEntries(perCategoryCount),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  // Export each picked tutorial body.
  for (const sel of picked) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug: sel.slug },
      include: { category: true, subCategory: true },
    })
    if (!t) {
      console.warn(`[MISS] ${sel.slug} — not found`)
      continue
    }
    const out: Record<string, unknown> = {
      _meta: {
        tutorialId: t.id,
        categorySlug: t.category?.slug,
        subCategorySlug: t.subCategory?.slug ?? null,
        publicUrl: `https://homemade.education/${t.category?.slug}/${t.slug}`,
        type: t.type,
      },
      slug: t.slug,
      title: t.title,
      subtitle: t.subtitle,
      excerpt: t.excerpt,
      type: t.type,
      sourceNotes: t.sourceNotes,
      body: t.body,
      glossaryTerms: [],
      recipe: {
        servings: t.servings,
        yieldDescription: t.yieldDescription,
        temperatureCelsius: t.temperatureCelsius,
      },
    }
    writeFileSync(resolve(outDir, `${t.slug}.json`), JSON.stringify(out, null, 2) + '\n', 'utf8')
    console.log(`[OK]   ${t.slug}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

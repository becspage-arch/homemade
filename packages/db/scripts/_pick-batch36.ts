/**
 * Pick 63 candidates for voice-retrofit batch36.
 * Filter: PUBLISHED + voiceRetrofittedAt IS NULL.
 * Spread: max 19 per category. Batch >= 4 so content-type minimum no longer applies;
 *         keep a soft spread on content-type for variety.
 * Writes docs/voice-retrofit-2026-05-27-batch36/_slugs.json
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
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

const BATCH_ID = '2026-05-27-batch36'
const TARGET = 63
const MAX_PER_CAT = 19

async function main() {
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

  console.log(`PUBLISHED with voiceRetrofittedAt=null: ${candidates.length}`)

  if (candidates.length === 0) {
    console.log('No candidates remaining. Retrofit done.')
    await prisma.$disconnect()
    return
  }

  function contentTypeGroup(type: string, categorySlug: string): string {
    if (type === 'RECIPE' && categorySlug === 'natural-home') return 'natural-home-recipe'
    if (type === 'RECIPE' && categorySlug === 'baking') return 'recipe-baking'
    if (type === 'RECIPE') return 'recipe-cooking'
    if (type === 'REMEDY' || type === 'HERB_PROFILE') return 'herbal'
    if (type === 'PRACTICE' || type === 'READING') return 'mindset'
    if (type === 'GROWING_GUIDE') return 'growing-guide'
    if (type === 'PATTERN') return 'craft-project'
    if (type === 'STITCH') return 'craft-technique'
    if (type === 'TECHNIQUE' && categorySlug === 'home-repair') return 'home-repair'
    if (type === 'TECHNIQUE' && categorySlug === 'animals-smallholding') return 'animals-smallholding'
    if (type === 'TECHNIQUE' && categorySlug === 'sustainability') return 'sustainability'
    if (type === 'TECHNIQUE') return `other-${categorySlug}`
    return type
  }

  const byBucket = new Map<string, any[]>()
  const byCategory = new Map<string, any[]>()
  for (const c of candidates) {
    const cat = c.category?.slug ?? 'unknown'
    const bucket = contentTypeGroup(c.type, cat)
    if (!byBucket.has(bucket)) byBucket.set(bucket, [])
    byBucket.get(bucket)!.push(c)
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(c)
  }

  console.log('\nCandidate buckets:')
  for (const [b, items] of byBucket) console.log(`  ${b.padEnd(28)}: ${items.length}`)

  console.log('\nCandidate categories:')
  for (const [c, items] of byCategory) console.log(`  ${c.padEnd(28)}: ${items.length}`)

  // Round-robin across buckets for spread; cap per-category at MAX_PER_CAT.
  const selected: any[] = []
  const catCounts = new Map<string, number>()
  const bucketCounts = new Map<string, number>()
  const remaining = new Map<string, any[]>()
  for (const [b, items] of byBucket) remaining.set(b, [...items])

  while (selected.length < TARGET) {
    let added = 0
    for (const [b, queue] of remaining) {
      if (selected.length >= TARGET) break
      while (queue.length > 0) {
        const item = queue.shift()!
        const cat = item.category?.slug ?? 'unknown'
        const c = catCounts.get(cat) ?? 0
        if (c >= MAX_PER_CAT) continue
        selected.push(item)
        catCounts.set(cat, c + 1)
        bucketCounts.set(b, (bucketCounts.get(b) ?? 0) + 1)
        added++
        break
      }
    }
    if (added === 0) break
  }

  console.log(`\nSelected: ${selected.length}`)
  console.log('By category:')
  for (const [c, n] of catCounts) console.log(`  ${c.padEnd(28)}: ${n}`)
  console.log('By bucket:')
  for (const [b, n] of bucketCounts) console.log(`  ${b.padEnd(28)}: ${n}`)

  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(batchDir)) mkdirSync(batchDir, { recursive: true })

  // Flat array of {slug, title, type, categorySlug} for compatibility with prior batches.
  const slugList = selected.map((s: any) => ({
    slug: s.slug,
    title: s.title,
    type: s.type,
    categorySlug: s.category?.slug ?? null,
  }))

  const outPath = resolve(batchDir, '_slugs.json')
  writeFileSync(outPath, JSON.stringify(slugList, null, 2) + '\n', 'utf8')
  console.log(`\nWrote ${outPath}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

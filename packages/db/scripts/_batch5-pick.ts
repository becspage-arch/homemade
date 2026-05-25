/**
 * Pick 50 PUBLISHED tutorials for the next voice-retrofit batch.
 * Filter: voiceRetrofittedAt IS NULL (the dedicated voice-retrofit tracking
 * field; isolated from `revisedFrom` which is shared with image-relevance
 * and other pipelines).
 *
 * Spread rules (batch4 onward, category spread only):
 *   - max 15 from any single category
 *   - no content-type minimum (first 3 batches handled that)
 *
 * Excludes slugs already in any other in-flight docs/voice-retrofit-* or
 * docs/voice-pilot-* _slugs.json or batch-file directory, so a concurrent
 * fire on a stale tracking field would not double-pick.
 *
 * Writes the slug list to docs/voice-retrofit-<batch-id>/_slugs.json.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
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

const batchId = process.argv[2]
if (!batchId) {
  console.error('Usage: tsx scripts/_batch5-pick.ts <batch-id>')
  process.exit(1)
}

function contentTypeGroup(type: string, categorySlug: string): string {
  if (type === 'RECIPE' && categorySlug === 'natural-home') return 'natural-home-recipe'
  if (type === 'RECIPE') return 'recipe'
  if (type === 'REMEDY' || type === 'HERB_PROFILE') return 'herbal'
  if (type === 'PRACTICE' || type === 'READING') return 'mindset'
  if (type === 'GROWING_GUIDE') return 'growing-guide'
  if (type === 'PATTERN') return 'craft-project'
  if (type === 'STITCH') return 'craft-technique'
  if (type === 'TECHNIQUE' && categorySlug === 'home-repair') return 'home-repair'
  if (type === 'TECHNIQUE') return 'craft-technique'
  return type
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) mkdirSync(batchDir, { recursive: true })

  const inflight = new Set<string>()
  const docsDir = resolve(worktreeRoot, 'docs')
  for (const entry of readdirSync(docsDir)) {
    if (!entry.startsWith('voice-retrofit-') && !entry.startsWith('voice-pilot-')) continue
    if (entry === `voice-retrofit-${batchId}`) continue
    const slugsPath = resolve(docsDir, entry, '_slugs.json')
    if (existsSync(slugsPath)) {
      try {
        const raw = JSON.parse(readFileSync(slugsPath, 'utf8'))
        const list: string[] = Array.isArray(raw) ? raw : Array.isArray(raw?.slugs) ? raw.slugs : []
        for (const s of list) inflight.add(s)
      } catch {}
    }
    const subdir = resolve(docsDir, entry)
    for (const f of readdirSync(subdir)) {
      if (!f.endsWith('.json')) continue
      if (f.startsWith('_')) continue
      inflight.add(f.replace(/\.json$/, ''))
    }
  }
  console.log(`In-flight slugs to exclude: ${inflight.size}`)

  const allPublished: any[] = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      slug: true,
      title: true,
      type: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })
  const candidates = allPublished
    .filter((t: any) => t.voiceRetrofittedAt === null)
    .filter((t: any) => !inflight.has(t.slug))

  console.log(`Total candidates (voiceRetrofittedAt IS NULL, not in-flight): ${candidates.length}`)

  if (candidates.length === 0) {
    console.log('No candidates remain. The voice-retrofit routine is done.')
    writeFileSync(
      resolve(batchDir, '_slugs.json'),
      JSON.stringify({ batchId, count: 0, slugs: [], done: true }, null, 2) + '\n',
      'utf8',
    )
    await prisma.$disconnect()
    return
  }

  const byType = new Map<string, any[]>()
  for (const c of candidates) {
    const g = contentTypeGroup(c.type, c.category?.slug ?? '')
    if (!byType.has(g)) byType.set(g, [])
    byType.get(g)!.push(c)
  }
  console.log('\nContent type counts in candidate pool:')
  for (const [t, items] of byType) console.log(`  ${t.padEnd(20)}: ${items.length}`)

  const TARGET = Math.min(50, candidates.length)
  const MAX_PER_CAT = 15

  const selected: any[] = []
  const selectedSlugs = new Set<string>()
  const catCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()

  // Round-robin across content types so spread stays even across the batch
  // even when one category dominates the alphabetical head of the pool.
  const typeQueues = new Map<string, any[]>()
  for (const [t, items] of byType) typeQueues.set(t, [...items])

  while (selected.length < TARGET) {
    let progress = false
    for (const [typeName, queue] of typeQueues) {
      if (selected.length >= TARGET) break
      while (queue.length > 0) {
        const item = queue.shift()!
        if (selectedSlugs.has(item.slug)) continue
        const cat = item.category?.slug ?? 'unknown'
        const catCount = catCounts.get(cat) ?? 0
        if (catCount >= MAX_PER_CAT) continue
        selected.push(item)
        selectedSlugs.add(item.slug)
        catCounts.set(cat, catCount + 1)
        typeCounts.set(typeName, (typeCounts.get(typeName) ?? 0) + 1)
        progress = true
        break
      }
    }
    if (!progress) break
  }

  console.log(`\nFinal selection: ${selected.length}`)
  console.log('\nCategory breakdown:')
  for (const [cat, count] of [...catCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(25)}: ${count}`)
  }
  console.log('\nContent type breakdown:')
  for (const [t, count] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(25)}: ${count}`)
  }

  const slugList = selected.map((s: any) => s.slug)
  writeFileSync(resolve(batchDir, '_slugs.json'), JSON.stringify(slugList, null, 2) + '\n', 'utf8')
  const meta = {
    batchId,
    count: slugList.length,
    byCategory: Object.fromEntries(catCounts),
    byBucket: Object.fromEntries(typeCounts),
  }
  writeFileSync(resolve(batchDir, '_meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8')
  console.log(`\nWrote ${resolve(batchDir, '_slugs.json')} and _meta.json`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

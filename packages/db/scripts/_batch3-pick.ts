/**
 * Pick 50 PUBLISHED tutorials for voice-retrofit batch3.
 * Spread rules (this is one of the first 3 batches):
 *   - max 15 from any single category
 *   - at least 2 from each content type that exists in the candidate pool
 * Also excludes slugs already in any in-flight docs/voice-retrofit-*\_slugs.json
 * so we don't collide with earlier batches.
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
  console.error('Usage: tsx scripts/_batch3-pick.ts <batch-id>')
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

  // Collect in-flight slugs across all batches (including pilot).
  const inflight = new Set<string>()
  const docsDir = resolve(worktreeRoot, 'docs')
  for (const entry of readdirSync(docsDir)) {
    if (!entry.startsWith('voice-retrofit-') && !entry.startsWith('voice-pilot-')) continue
    if (entry === `voice-retrofit-${batchId}`) continue
    const slugsPath = resolve(docsDir, entry, '_slugs.json')
    if (!existsSync(slugsPath)) continue
    try {
      const raw = JSON.parse(readFileSync(slugsPath, 'utf8'))
      const list: string[] = Array.isArray(raw) ? raw : Array.isArray(raw?.slugs) ? raw.slugs : []
      for (const s of list) inflight.add(s)
    } catch {
      // ignore
    }
  }
  // Also include any tutorial body json files in pilot/batch dirs as taken.
  for (const entry of readdirSync(docsDir)) {
    if (!entry.startsWith('voice-retrofit-') && !entry.startsWith('voice-pilot-')) continue
    if (entry === `voice-retrofit-${batchId}`) continue
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
      revisedFrom: true,
      category: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })
  const candidates = allPublished
    .filter((t: any) => t.revisedFrom === null)
    .filter((t: any) => !inflight.has(t.slug))

  console.log(`Total candidates: ${candidates.length}`)

  if (candidates.length === 0) {
    console.log('No candidates remain — retrofit is done.')
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

  // Phase 1: ensure at least MIN_PER_TYPE per content type that exists in pool.
  const TARGET = Math.min(50, candidates.length)
  const MIN_PER_TYPE = 2
  const MAX_PER_CAT = 15

  const selected: any[] = []
  const selectedSlugs = new Set<string>()
  const catCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()

  for (const [typeName, items] of byType) {
    let added = 0
    for (const item of items) {
      if (added >= MIN_PER_TYPE) break
      if (selectedSlugs.has(item.slug)) continue
      const cat = item.category?.slug ?? 'unknown'
      const catCount = catCounts.get(cat) ?? 0
      if (catCount >= MAX_PER_CAT) continue
      selected.push(item)
      selectedSlugs.add(item.slug)
      catCounts.set(cat, catCount + 1)
      typeCounts.set(typeName, (typeCounts.get(typeName) ?? 0) + 1)
      added++
    }
  }

  console.log(`\nAfter phase 1 (type spread): ${selected.length}`)

  // Phase 2: round-robin across content types to keep spread balanced.
  const typeQueues = new Map<string, any[]>()
  for (const [t, items] of byType) typeQueues.set(t, items.filter((i: any) => !selectedSlugs.has(i.slug)))

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

/**
 * Pick 50 PUBLISHED tutorials with revisedFrom IS NULL for voice-retrofit batch1.
 * Rules:
 *   - max 15 from any single category
 *   - at least 2 from each content type that exists in PUBLISHED content
 *     (recipe, herbal/REMEDY, mindset/PRACTICE+READING, craft technique,
 *      craft project/PATTERN, growing guide, home repair, natural home recipe)
 * Outputs the slug list to stdout as JSON.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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

async function main() {
  const { prisma } = await import('../src/index.js')

  // Prisma 7: JSON nullable fields can't use null directly; fetch all PUBLISHED
  // and filter revisedFrom === null in application code.
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
  const candidates = allPublished.filter((t: any) => t.revisedFrom === null)

  console.log(`Total PUBLISHED with revisedFrom=null: ${candidates.length}`)

  // Map content type for spread purposes
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

  // Group by content type for overview
  const byType = new Map<string, any[]>()
  for (const c of candidates) {
    const g = contentTypeGroup(c.type, c.category?.slug ?? '')
    if (!byType.has(g)) byType.set(g, [])
    byType.get(g)!.push(c)
  }

  console.log('\nContent type counts:')
  for (const [type, items] of byType) {
    console.log(`  ${type.padEnd(20)}: ${items.length}`)
  }

  const byCategory = new Map<string, any[]>()
  for (const c of candidates) {
    const cat = c.category?.slug ?? 'unknown'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(c)
  }
  console.log('\nCategory counts (top 20):')
  const sorted = [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 20)
  for (const [cat, items] of sorted) {
    console.log(`  ${cat.padEnd(25)}: ${items.length}`)
  }

  // Now pick 50 with spread rules
  const selected: any[] = []
  const catCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()
  const MAX_PER_CAT = 15
  const TARGET = 50
  const MIN_PER_TYPE = 2

  // Phase 1: ensure at least MIN_PER_TYPE per content type
  for (const [typeName, items] of byType) {
    let added = 0
    for (const item of items) {
      if (added >= MIN_PER_TYPE) break
      const cat = item.category?.slug ?? 'unknown'
      const catCount = catCounts.get(cat) ?? 0
      if (catCount >= MAX_PER_CAT) continue
      selected.push(item)
      catCounts.set(cat, catCount + 1)
      typeCounts.set(typeName, (typeCounts.get(typeName) ?? 0) + 1)
      added++
    }
  }

  console.log(`\nAfter phase 1 (type spread): ${selected.length} selected`)

  // Phase 2: fill to 50, respecting MAX_PER_CAT
  const selectedSlugs = new Set(selected.map((s: any) => s.slug))
  for (const item of candidates) {
    if (selected.length >= TARGET) break
    if (selectedSlugs.has(item.slug)) continue
    const cat = item.category?.slug ?? 'unknown'
    const catCount = catCounts.get(cat) ?? 0
    if (catCount >= MAX_PER_CAT) continue
    selected.push(item)
    selectedSlugs.add(item.slug)
    catCounts.set(cat, catCount + 1)
    const tg = contentTypeGroup(item.type, cat)
    typeCounts.set(tg, (typeCounts.get(tg) ?? 0) + 1)
  }

  console.log(`\nFinal selection: ${selected.length} tutorials`)
  console.log('\nCategory breakdown:')
  for (const [cat, count] of catCounts) {
    if (count > 0) console.log(`  ${cat.padEnd(25)}: ${count}`)
  }
  console.log('\nContent type breakdown:')
  for (const [type, count] of typeCounts) {
    if (count > 0) console.log(`  ${type.padEnd(25)}: ${count}`)
  }

  console.log('\nSlug list:')
  const slugList = selected.map((s: any) => s.slug)
  console.log(JSON.stringify(slugList, null, 2))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

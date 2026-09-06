/**
 * Re-file the published Christmas cross-stitch patterns out of `seasonal` and
 * onto the new `christmas` shelf.
 *
 * Christmas became a shelf of its own on 6 September 2026 (it is the biggest
 * single season in the catalogue and was buried inside `seasonal` alongside
 * Easter, autumn and Valentine's). The subject pool's `christmas` theme now
 * files to `christmas`, so every NEW gem lands correctly — this script moves the
 * ones already published.
 *
 * WHAT IT MATCHES, in order:
 *   1. `generationMeta.brief.themeId === 'christmas'` — the autopilot's own
 *      record of what it commissioned, and the only signal that cannot be wrong.
 *   2. Failing that (hand-made and imported rows have no generationMeta), a word
 *      match on the pattern's name or slug against WORDS below.
 *
 * Only patterns currently on the `seasonal` shelf are considered, so a robin
 * already filed under `animals` stays where a human put it.
 *
 * Creates the `christmas` sub-category row if it does not exist yet (the same
 * row, with the same name and order, the bulk publisher would create on its
 * first Christmas gem). DELETES NOTHING — `seasonal` keeps its row and its
 * Easter, autumn and Valentine's pieces.
 *
 * Idempotent: once a pattern is on `christmas` it is no longer on `seasonal`, so
 * a re-run finds nothing to do. Prints the full list before it writes anything.
 *
 * Dry-run by default. Pass --apply to write.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-refile-christmas.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-refile-christmas.ts --apply
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../../..', '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

const APPLY = process.argv.includes('--apply')

const CHRISTMAS_SLUG = 'christmas'
const CHRISTMAS_NAME = 'Christmas'
const SEASONAL_SLUG = 'seasonal'
/** The order the bulk publisher gives a shelf row it has to create. */
const SHELF_ORDER = 50

/**
 * The name/slug fallback vocabulary.
 *
 * Deliberately narrow: every entry is Christmas and nothing else. "Snow",
 * "winter", "candle" and "sledge" are NOT here — a snowy hare or a winter robin
 * is a seasonal piece that happens to be cold, and moving those would empty the
 * shelf this is trying to leave intact. Matched as whole words (a plural `s` is
 * allowed) against the pattern's name and slug.
 */
const WORDS: string[] = [
  'christmas',
  'xmas',
  'santa',
  'reindeer',
  'snowman',
  'gingerbread house',
  'stocking',
  'bauble',
  'nutcracker',
  'robin on holly',
  'mistletoe',
  'advent',
  'festive',
]

/** Whole-word (or whole-phrase) match, tolerating a trailing plural and hyphens. */
function matchedWords(haystack: string): string[] {
  const text = haystack.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
  return WORDS.filter((w) => new RegExp(`\\b${w}(?:e?s)?\\b`).test(text))
}

/** The autopilot's own record of which theme commissioned this pattern. */
function themeIdOf(meta: unknown): string | null {
  if (!meta || typeof meta !== 'object') return null
  const brief = (meta as { brief?: unknown }).brief
  if (!brief || typeof brief !== 'object') return null
  const themeId = (brief as { themeId?: unknown }).themeId
  return typeof themeId === 'string' ? themeId : null
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({ where: { slug: 'cross-stitch' } })
  if (!category) throw new Error('cross-stitch category not found')

  const seasonal = await prisma.subCategory.findUnique({
    where: { categoryId_slug: { categoryId: category.id, slug: SEASONAL_SLUG } },
  })
  if (!seasonal) throw new Error(`${SEASONAL_SLUG} sub-category not found`)

  let christmas = await prisma.subCategory.findUnique({
    where: { categoryId_slug: { categoryId: category.id, slug: CHRISTMAS_SLUG } },
  })
  if (!christmas) {
    console.log(`[refile] ${CHRISTMAS_SLUG} shelf does not exist yet.`)
    if (APPLY) {
      christmas = await prisma.subCategory.create({
        data: { categoryId: category.id, slug: CHRISTMAS_SLUG, name: CHRISTMAS_NAME, order: SHELF_ORDER },
      })
      console.log(`[refile] created sub-category ${CHRISTMAS_SLUG} ("${CHRISTMAS_NAME}")`)
    } else {
      console.log(`[refile] [would create] sub-category ${CHRISTMAS_SLUG} ("${CHRISTMAS_NAME}")`)
    }
  }

  const onSeasonal = await prisma.pattern.findMany({
    where: { subCategoryId: seasonal.id },
    select: { id: true, name: true, slug: true, visibility: true, generationMeta: true },
    orderBy: { name: 'asc' },
  })

  const moves: { id: string; name: string; slug: string | null; why: string }[] = []
  for (const p of onSeasonal) {
    if (themeIdOf(p.generationMeta) === 'christmas') {
      moves.push({ id: p.id, name: p.name, slug: p.slug, why: 'generationMeta.brief.themeId=christmas' })
      continue
    }
    const hits = matchedWords(`${p.name} ${p.slug ?? ''}`)
    if (hits.length > 0) moves.push({ id: p.id, name: p.name, slug: p.slug, why: `name/slug: ${hits.join(', ')}` })
  }

  const staying = onSeasonal.length - moves.length
  console.log(`\n[refile] ${SEASONAL_SLUG} holds ${onSeasonal.length} pattern(s); ${moves.length} match Christmas, ${staying} stay.`)
  for (const m of moves) console.log(`  ${APPLY ? 'move' : '[would move]'}  ${m.name}  (${m.slug ?? 'no slug'})  — ${m.why}`)
  if (moves.length === 0) console.log('  nothing to move — already re-filed, or none published yet.')

  if (!APPLY) {
    console.log('\n[refile] dry-run only — pass --apply to write.')
    await prisma.$disconnect()
    return
  }

  if (moves.length > 0) {
    if (!christmas) throw new Error('christmas sub-category missing after create')
    await prisma.pattern.updateMany({
      where: { id: { in: moves.map((m) => m.id) } },
      data: { subCategoryId: christmas.id },
    })
    console.log(`\n[refile] moved ${moves.length} pattern(s) to ${CHRISTMAS_SLUG}.`)

    console.log(`[refile] re-syncing ${moves.length} moved pattern(s) to search...`)
    const { buildPatternDoc } = await import('../src/search-docs')
    const { syncPatternDoc } = await import('@homemade/search')
    for (const m of moves) {
      const doc = await buildPatternDoc(m.id)
      if (doc) await syncPatternDoc(doc)
    }
    console.log('[refile] search sync done.')
  }

  const [seasonalAfter, christmasAfter] = await Promise.all([
    prisma.pattern.count({ where: { subCategoryId: seasonal.id } }),
    christmas ? prisma.pattern.count({ where: { subCategoryId: christmas.id } }) : Promise.resolve(0),
  ])
  console.log(`\n[refile] after: ${SEASONAL_SLUG}=${seasonalAfter} patterns, ${CHRISTMAS_SLUG}=${christmasAfter} patterns.`)
  console.log('[refile] applied.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[refile] failed:', err)
  process.exit(1)
})

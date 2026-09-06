/**
 * Merge the K-1 legacy knitting shelves into the K-4 project-shape set.
 *
 * `hats`           -> `hat`         ("Hats")
 * `blankets`       -> `blanket`     ("Blankets")
 * `socks`          -> `sock`        ("Socks")
 * `scarves-shawls` -> `scarf-cowl`  ("Scarves & cowls") by default, or
 *                     `shawl-wrap`  ("Shawls & wraps") when the row's title
 *                     or slug clearly names a shawl or wrap shape — see
 *                     `classifyScarvesShawlsRow` below.
 *
 * `dishcloths-homewares`, `garments` and `baby` are left alone — Rebecca
 * decides those.
 *
 * Moves every Tutorial and KnittingPattern row off each source sub-category,
 * re-syncs the moved Tutorial rows to search (KnittingPattern has no search
 * doc builder yet — see packages/db/src/search-docs.ts — so there is nothing
 * to re-sync for those rows; the script says so rather than silently
 * skipping), then deletes each source sub-category once confirmed empty
 * across every craft table that can reference a SubCategory row (Pattern,
 * Tutorial, CrochetPattern, NeedleworkPattern, KnittingPattern,
 * SewingPattern).
 *
 * Idempotent: safe to re-run. Once all four source sub-categories are gone
 * the script has nothing left to do and says so.
 *
 * Dry-run by default. Pass --apply to write.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/knitting-merge-shelves.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/knitting-merge-shelves.ts --apply
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

/**
 * `scarves-shawls` is the one legacy shelf that fans out to two K-4 targets.
 * A row is routed to `shawl-wrap` when its title or slug clearly names a
 * shawl, wrap, stole or poncho shape; everything else (scarves, cowls,
 * infinity scarves) goes to `scarf-cowl`, the sub-category's own default.
 */
const SHAWL_WRAP_KEYWORDS = ['shawl', 'wrap', 'stole', 'poncho']

function classifyScarvesShawlsRow(title: string, slug: string): 'scarf-cowl' | 'shawl-wrap' {
  const haystack = `${title} ${slug}`.toLowerCase()
  return SHAWL_WRAP_KEYWORDS.some((kw) => haystack.includes(kw)) ? 'shawl-wrap' : 'scarf-cowl'
}

interface Merge {
  fromSlug: string
  /** Simple merges resolve to a constant slug; `scarves-shawls` resolves per-row. */
  toSlugFor: (title: string, slug: string) => string
}

const MERGES: Merge[] = [
  { fromSlug: 'hats', toSlugFor: () => 'hat' },
  { fromSlug: 'blankets', toSlugFor: () => 'blanket' },
  { fromSlug: 'socks', toSlugFor: () => 'sock' },
  { fromSlug: 'scarves-shawls', toSlugFor: classifyScarvesShawlsRow },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({ where: { slug: 'knitting' } })
  if (!category) throw new Error('knitting category not found')

  const tutorialsToSync: string[] = []
  let anySourceRemaining = false

  for (const merge of MERGES) {
    const from = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug: merge.fromSlug } },
    })
    if (!from) {
      console.log(`[merge] ${merge.fromSlug}: source already gone, nothing to do.`)
      continue
    }
    anySourceRemaining = true

    const tutorialsToMove = await prisma.tutorial.findMany({
      where: { subCategoryId: from.id },
      select: { id: true, slug: true, title: true },
    })
    const patternsToMove = await prisma.knittingPattern.findMany({
      where: { subCategoryId: from.id },
      select: { id: true, slug: true, name: true },
    })

    console.log(
      `\n[merge] ${merge.fromSlug}: ${tutorialsToMove.length} tutorial(s), ${patternsToMove.length} knitting pattern(s) to move`,
    )

    // Resolve each row's destination slug and group so we can report and
    // move per-destination (matters for the scarves-shawls fan-out).
    const destinations = new Map<string, { tutorials: typeof tutorialsToMove; patterns: typeof patternsToMove }>()
    for (const t of tutorialsToMove) {
      const dest = merge.toSlugFor(t.title, t.slug)
      if (!destinations.has(dest)) destinations.set(dest, { tutorials: [], patterns: [] })
      destinations.get(dest)!.tutorials.push(t)
    }
    for (const p of patternsToMove) {
      const dest = merge.toSlugFor(p.name, p.slug ?? '')
      if (!destinations.has(dest)) destinations.set(dest, { tutorials: [], patterns: [] })
      destinations.get(dest)!.patterns.push(p)
    }

    for (const [toSlug, rows] of destinations) {
      const to = await prisma.subCategory.findUnique({
        where: { categoryId_slug: { categoryId: category.id, slug: toSlug } },
      })
      if (!to) throw new Error(`target sub-category ${toSlug} not found`)

      const [beforeToTutorials, beforeToPatterns] = await Promise.all([
        prisma.tutorial.count({ where: { subCategoryId: to.id } }),
        prisma.knittingPattern.count({ where: { subCategoryId: to.id } }),
      ])

      console.log(
        `  -> ${toSlug} (currently ${beforeToTutorials} tutorials, ${beforeToPatterns} knitting patterns)`,
      )

      if (APPLY) {
        for (const t of rows.tutorials) {
          await prisma.tutorial.update({ where: { id: t.id }, data: { subCategoryId: to.id } })
          tutorialsToSync.push(t.id)
        }
        for (const p of rows.patterns) {
          await prisma.knittingPattern.update({ where: { id: p.id }, data: { subCategoryId: to.id } })
        }
      } else {
        for (const t of rows.tutorials) console.log(`    [would move tutorial] ${t.title} (${t.slug})`)
        for (const p of rows.patterns) console.log(`    [would move knitting pattern] ${p.name} (${p.slug ?? p.id})`)
      }
    }

    if (!APPLY) {
      const [pCount, tCount, cCount, nCount, kCount, sCount] = await Promise.all([
        prisma.pattern.count({ where: { subCategoryId: from.id } }),
        prisma.tutorial.count({ where: { subCategoryId: from.id } }),
        prisma.crochetPattern.count({ where: { subCategoryId: from.id } }),
        prisma.needleworkPattern.count({ where: { subCategoryId: from.id } }),
        prisma.knittingPattern.count({ where: { subCategoryId: from.id } }),
        prisma.sewingPattern.count({ where: { subCategoryId: from.id } }),
      ])
      console.log(
        `  [dry-run] reference check (current, pre-move state): pattern=${pCount} tutorial=${tCount} crochet=${cCount} needlework=${nCount} knitting=${kCount} sewing=${sCount}`,
      )
      console.log(`  [would delete] ${merge.fromSlug} sub-category once moves are applied`)
      continue
    }

    const [pCount, tCount, cCount, nCount, kCount, sCount] = await Promise.all([
      prisma.pattern.count({ where: { subCategoryId: from.id } }),
      prisma.tutorial.count({ where: { subCategoryId: from.id } }),
      prisma.crochetPattern.count({ where: { subCategoryId: from.id } }),
      prisma.needleworkPattern.count({ where: { subCategoryId: from.id } }),
      prisma.knittingPattern.count({ where: { subCategoryId: from.id } }),
      prisma.sewingPattern.count({ where: { subCategoryId: from.id } }),
    ])
    const totalRefs = pCount + tCount + cCount + nCount + kCount + sCount

    if (totalRefs > 0) {
      console.log(
        `  [merge] STOP: ${merge.fromSlug} still has references (pattern=${pCount} tutorial=${tCount} crochet=${cCount} needlework=${nCount} knitting=${kCount} sewing=${sCount}); not deleting.`,
      )
      continue
    }

    await prisma.subCategory.delete({ where: { id: from.id } })
    console.log(`  [merge] deleted empty sub-category ${merge.fromSlug}`)
  }

  if (!anySourceRemaining) {
    console.log('\n[merge] all four legacy shelves already gone — nothing to do.')
  }

  if (APPLY && tutorialsToSync.length > 0) {
    console.log(`\n[merge] re-syncing ${tutorialsToSync.length} moved tutorial(s) to search...`)
    const { buildTutorialDoc } = await import('../src/search-docs')
    const { syncTutorialDoc } = await import('@homemade/search')
    for (const id of tutorialsToSync) {
      const doc = await buildTutorialDoc(id)
      if (doc) await syncTutorialDoc(doc)
    }
    console.log('[merge] tutorial search sync done.')
  }
  console.log(
    '[merge] note: KnittingPattern has no search doc builder yet (see packages/db/src/search-docs.ts), so moved knitting patterns are not re-synced to search here — nothing is being skipped that could otherwise be done.',
  )

  console.log(APPLY ? '\n[merge] applied.' : '\n[merge] dry-run only — pass --apply to write.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[merge] failed:', err)
  process.exit(1)
})

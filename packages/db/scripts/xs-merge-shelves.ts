/**
 * Merge the duplicate cross-stitch shelves.
 *
 * `florals` (3 patterns) -> `floral` ("Floral & Botanical")
 * `home-cosy` (1 pattern) -> `scenes` ("Scenes")
 *
 * Moves every Pattern and Tutorial row off the two source sub-categories,
 * re-syncs the moved patterns to search, then deletes the source
 * sub-categories once confirmed empty across every craft table that can
 * reference a SubCategory row (Pattern, Tutorial, CrochetPattern,
 * NeedleworkPattern, KnittingPattern, SewingPattern).
 *
 * Idempotent: safe to re-run. Once the source sub-categories are gone the
 * script has nothing left to do and says so.
 *
 * Dry-run by default. Pass --apply to write.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-merge-shelves.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-merge-shelves.ts --apply
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

interface Merge {
  fromSlug: string
  toSlug: string
}

const MERGES: Merge[] = [
  { fromSlug: 'florals', toSlug: 'floral' },
  { fromSlug: 'home-cosy', toSlug: 'scenes' },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({ where: { slug: 'cross-stitch' } })
  if (!category) throw new Error('cross-stitch category not found')

  const patternsToSync: string[] = []

  for (const merge of MERGES) {
    const from = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug: merge.fromSlug } },
    })
    if (!from) {
      console.log(`[merge] ${merge.fromSlug} -> ${merge.toSlug}: source already gone, nothing to do.`)
      continue
    }
    const to = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug: merge.toSlug } },
    })
    if (!to) throw new Error(`target sub-category ${merge.toSlug} not found`)

    const [beforeFromPatterns, beforeFromTutorials, beforeToPatterns, beforeToTutorials] = await Promise.all([
      prisma.pattern.count({ where: { subCategoryId: from.id } }),
      prisma.tutorial.count({ where: { subCategoryId: from.id } }),
      prisma.pattern.count({ where: { subCategoryId: to.id } }),
      prisma.tutorial.count({ where: { subCategoryId: to.id } }),
    ])

    console.log(
      `\n[merge] ${merge.fromSlug} (${beforeFromPatterns} patterns, ${beforeFromTutorials} tutorials) -> ${merge.toSlug} (currently ${beforeToPatterns} patterns, ${beforeToTutorials} tutorials)`,
    )

    const patternsToMove = await prisma.pattern.findMany({
      where: { subCategoryId: from.id },
      select: { id: true, name: true },
    })
    const tutorialsToMove = await prisma.tutorial.findMany({
      where: { subCategoryId: from.id },
      select: { id: true, slug: true },
    })

    if (APPLY) {
      if (patternsToMove.length > 0) {
        await prisma.pattern.updateMany({
          where: { subCategoryId: from.id },
          data: { subCategoryId: to.id },
        })
        for (const p of patternsToMove) patternsToSync.push(p.id)
      }
      if (tutorialsToMove.length > 0) {
        await prisma.tutorial.updateMany({
          where: { subCategoryId: from.id },
          data: { subCategoryId: to.id },
        })
      }
    } else {
      for (const p of patternsToMove) console.log(`  [would move pattern] ${p.name}`)
      for (const t of tutorialsToMove) console.log(`  [would move tutorial] ${t.slug}`)
    }

    const [afterFromPatterns, afterFromTutorials, afterToPatterns, afterToTutorials] = APPLY
      ? await Promise.all([
          prisma.pattern.count({ where: { subCategoryId: from.id } }),
          prisma.tutorial.count({ where: { subCategoryId: from.id } }),
          prisma.pattern.count({ where: { subCategoryId: to.id } }),
          prisma.tutorial.count({ where: { subCategoryId: to.id } }),
        ])
      : [
          0,
          0,
          beforeToPatterns + patternsToMove.length,
          beforeToTutorials + tutorialsToMove.length,
        ]

    console.log(
      `  after: ${merge.fromSlug}=${afterFromPatterns}p/${afterFromTutorials}t, ${merge.toSlug}=${afterToPatterns}p/${afterToTutorials}t${APPLY ? '' : ' (projected, dry-run)'}`,
    )

    // Confirm zero references left before deleting, across every craft table
    // that can point at a SubCategory row.
    const [pCount, tCount, cCount, nCount, kCount, sCount] = await Promise.all([
      prisma.pattern.count({ where: { subCategoryId: from.id } }),
      prisma.tutorial.count({ where: { subCategoryId: from.id } }),
      prisma.crochetPattern.count({ where: { subCategoryId: from.id } }),
      prisma.needleworkPattern.count({ where: { subCategoryId: from.id } }),
      prisma.knittingPattern.count({ where: { subCategoryId: from.id } }),
      prisma.sewingPattern.count({ where: { subCategoryId: from.id } }),
    ])
    const totalRefs = pCount + tCount + cCount + nCount + kCount + sCount

    if (!APPLY) {
      console.log(
        `  [dry-run] reference check (against current, pre-move state): pattern=${pCount} tutorial=${tCount} crochet=${cCount} needlework=${nCount} knitting=${kCount} sewing=${sCount}`,
      )
      console.log(`  [would delete] ${merge.fromSlug} sub-category once moves are applied`)
      continue
    }

    if (totalRefs > 0) {
      console.log(
        `  [merge] STOP: ${merge.fromSlug} still has references (pattern=${pCount} tutorial=${tCount} crochet=${cCount} needlework=${nCount} knitting=${kCount} sewing=${sCount}); not deleting.`,
      )
      continue
    }

    await prisma.subCategory.delete({ where: { id: from.id } })
    console.log(`  [merge] deleted empty sub-category ${merge.fromSlug}`)
  }

  if (APPLY && patternsToSync.length > 0) {
    console.log(`\n[merge] re-syncing ${patternsToSync.length} moved pattern(s) to search...`)
    const { buildPatternDoc } = await import('../src/search-docs')
    const { syncPatternDoc } = await import('@homemade/search')
    for (const id of patternsToSync) {
      const doc = await buildPatternDoc(id)
      if (doc) await syncPatternDoc(doc)
    }
    console.log('[merge] search sync done.')
  }

  console.log(APPLY ? '\n[merge] applied.' : '\n[merge] dry-run only — pass --apply to write.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[merge] failed:', err)
  process.exit(1)
})

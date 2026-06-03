/**
 * Promote cross-stitch from a sub-category under needlework to its own
 * top-level Category, seed its 4 theme sub-cats, and migrate the existing
 * cross-stitch drafts across.
 *
 * Idempotent / safe to re-run:
 *   - Category and SubCategory rows use upsert-by-slug semantics.
 *   - Tutorial moves only fire when the tutorial is still in needlework AND
 *     looks like cross-stitch (title / body / sub-category match).
 *   - The empty needlework `cross-stitch` sub-cat is deleted only after the
 *     last tutorial referencing it has been re-pointed.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-cross-stitch-category.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-cross-stitch-category.ts --dry-run
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

const DRY_RUN = process.argv.includes('--dry-run')

const CATEGORY_SPEC = {
  slug: 'cross-stitch',
  name: 'Cross-stitch',
  description:
    'Counted-thread stitching on Aida or evenweave fabric. Library patterns, project tutorials, and the cross-stitch Studio.',
  // Sits alongside the other fibre crafts in the admin list. launchOrder
  // stays null until the Studio ships and Rebecca opts the category into
  // the public nav rotation.
  order: 8,
  pipelineStatus: 'NOT_READY' as const,
  isPublicVisible: false,
}

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  {
    slug: 'animals',
    name: 'Animals',
    description:
      'Cross-stitch patterns featuring animals: cats, dogs, birds, woodland, farm, sealife, wild.',
    order: 10,
  },
  {
    slug: 'florals',
    name: 'Florals',
    description:
      'Cross-stitch patterns featuring flowers, botanicals, leaves, and herb studies.',
    order: 20,
  },
  {
    slug: 'quotes-and-sayings',
    name: 'Quotes & sayings',
    description:
      'Cross-stitch patterns built around words, phrases, and sentiments.',
    order: 30,
  },
  {
    slug: 'pride-and-inclusive',
    name: 'Pride & inclusive',
    description:
      'Cross-stitch patterns celebrating LGBTQ+ identity, allyship, and inclusive themes.',
    order: 40,
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  // ──────────────────────────────────────────────────────────────────────
  // 1. Upsert the cross-stitch Category row.
  // ──────────────────────────────────────────────────────────────────────
  let category = await prisma.category.findUnique({
    where: { slug: CATEGORY_SPEC.slug },
  })
  if (!category) {
    if (DRY_RUN) {
      console.log(`[seed] [would create] Category cross-stitch`)
    } else {
      category = await prisma.category.create({
        data: {
          slug: CATEGORY_SPEC.slug,
          name: CATEGORY_SPEC.name,
          description: CATEGORY_SPEC.description,
          order: CATEGORY_SPEC.order,
          pipelineStatus: CATEGORY_SPEC.pipelineStatus,
          isPublicVisible: CATEGORY_SPEC.isPublicVisible,
          // launchOrder stays null until the Studio ships.
          targetTutorialCount: null,
        },
      })
      console.log(`[seed] Category cross-stitch → ${category.id}`)
    }
  } else {
    console.log(`[seed] Category cross-stitch already exists → ${category.id}`)
  }

  // In dry-run with no existing category, sub-cat and tutorial-move sections
  // print "would" lines using a fabricated id so we still get visibility.
  const categoryId = category?.id ?? '__dry_run_category_id__'
  const isDryRunStub = !category && DRY_RUN
  if (!category && !DRY_RUN) {
    throw new Error('cross-stitch category not present after create')
  }

  // ──────────────────────────────────────────────────────────────────────
  // 2. Seed the 4 cross-stitch sub-categories.
  // ──────────────────────────────────────────────────────────────────────
  let subCreated = 0
  let subUnchanged = 0
  for (const spec of SUB_CATEGORIES) {
    const existing = isDryRunStub
      ? null
      : await prisma.subCategory.findUnique({
          where: { categoryId_slug: { categoryId, slug: spec.slug } },
        })
    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] cross-stitch/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId,
          },
        })
        console.log(`[seed] cross-stitch/${spec.slug} -> ${sub.id}`)
      }
      subCreated += 1
    } else {
      subUnchanged += 1
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // 3. Migrate any cross-stitch tutorials from needlework to cross-stitch.
  // ──────────────────────────────────────────────────────────────────────
  const needlework = await prisma.category.findUnique({
    where: { slug: 'needlework' },
    select: { id: true },
  })

  const movedSlugs: string[] = []
  const skippedSlugs: string[] = []

  if (!needlework) {
    console.log('[seed] no needlework category present; skipping tutorial migration.')
  } else {
    const needleworkCrossStitchSub = await prisma.subCategory.findUnique({
      where: {
        categoryId_slug: { categoryId: needlework.id, slug: 'cross-stitch' },
      },
      select: { id: true },
    })

    const drafts = await prisma.tutorial.findMany({
      where: { categoryId: needlework.id },
      select: {
        id: true,
        slug: true,
        title: true,
        body: true,
        subCategoryId: true,
      },
    })

    for (const t of drafts) {
      const bodyJson = JSON.stringify(t.body ?? {}).toLowerCase()
      const lowerTitle = (t.title ?? '').toLowerCase()
      const isCrossStitch =
        lowerTitle.includes('cross-stitch') ||
        lowerTitle.includes('cross stitch') ||
        bodyJson.includes('crossstitchchart') ||
        bodyJson.includes('cross-stitch') ||
        bodyJson.includes('cross stitch') ||
        (needleworkCrossStitchSub != null &&
          t.subCategoryId === needleworkCrossStitchSub.id)

      if (!isCrossStitch) {
        skippedSlugs.push(t.slug)
        continue
      }

      // Theme assignment by simple keyword heuristic. Foundational technique
      // tutorials (no clear theme) land with subCategoryId null and get flagged
      // for manual review in the hand-off.
      let newSubSlug: string | null = null
      const blob = `${lowerTitle} ${bodyJson}`
      if (/\b(cat|dog|bird|fox|deer|owl|sheep|cow|horse|rabbit|fish|bee|butterfly)\b/.test(blob)) {
        newSubSlug = 'animals'
      } else if (/\b(flower|floral|botanical|herb|rose|tulip|daisy|leaf|leaves|sunflower)\b/.test(blob)) {
        newSubSlug = 'florals'
      } else if (/\b(quote|saying|phrase|sentiment|lyric|verse|motto)\b/.test(blob)) {
        newSubSlug = 'quotes-and-sayings'
      } else if (/\b(pride|lgbtq|rainbow|trans|queer|inclusive|allyship)\b/.test(blob)) {
        newSubSlug = 'pride-and-inclusive'
      }

      let newSubId: string | null = null
      if (newSubSlug && !isDryRunStub) {
        const found = await prisma.subCategory.findUnique({
          where: { categoryId_slug: { categoryId, slug: newSubSlug } },
          select: { id: true },
        })
        newSubId = found?.id ?? null
      }

      if (DRY_RUN) {
        console.log(
          `  [would move] ${t.slug} -> cross-stitch (subCat: ${newSubSlug ?? '(null, needs manual review)'})`,
        )
      } else {
        await prisma.tutorial.update({
          where: { id: t.id },
          data: {
            categoryId,
            subCategoryId: newSubId,
          },
        })
        console.log(
          `[seed] moved ${t.slug} -> cross-stitch (subCat: ${newSubSlug ?? '(null, needs manual review)'})`,
        )
      }
      movedSlugs.push(t.slug)
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4. Tidy: delete the now-empty needlework `cross-stitch` sub-category so
    //    it stops confusing the admin tree. Only delete when zero tutorials
    //    still reference it.
    // ──────────────────────────────────────────────────────────────────────
    if (needleworkCrossStitchSub) {
      const referencing = await prisma.tutorial.count({
        where: { subCategoryId: needleworkCrossStitchSub.id },
      })
      if (referencing === 0) {
        if (DRY_RUN) {
          console.log('  [would delete] needlework/cross-stitch sub-category (now empty)')
        } else {
          await prisma.subCategory.delete({
            where: { id: needleworkCrossStitchSub.id },
          })
          console.log('[seed] deleted empty needlework/cross-stitch sub-category')
        }
      } else {
        console.log(
          `[seed] needlework/cross-stitch still has ${referencing} tutorials; not deleting.`,
        )
      }
    }
  }

  console.log('')
  console.log('[seed] cross-stitch promotion summary')
  console.log(`  sub-categories created : ${subCreated}`)
  console.log(`  sub-categories unchanged: ${subUnchanged}`)
  console.log(`  tutorials moved        : ${movedSlugs.length}`)
  for (const s of movedSlugs) console.log(`    - ${s}`)
  if (skippedSlugs.length > 0) {
    console.log(`  tutorials kept in needlework: ${skippedSlugs.length}`)
    for (const s of skippedSlugs) console.log(`    - ${s}`)
  }
  if (DRY_RUN) console.log('  (dry-run)')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

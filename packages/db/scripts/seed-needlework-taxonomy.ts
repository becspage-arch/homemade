/**
 * One-off seed for the Needlework taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   needlework               "Needlework"
 *   SubCat     cross-stitch             "Cross-stitch"             (under needlework)
 *   SubCat     needlepoint              "Needlepoint"              (under needlework)
 *   SubCat     tatting                  "Tatting"                  (under needlework)
 *   SubCat     lacemaking               "Lacemaking"               (under needlework)
 *
 * Four sub-categories per the locked Needlework breakdown in the
 * pipeline-setup brief. The upload-tutorial script requires both the
 * Category and any referenced SubCategory to exist before Needlework
 * rows can be inserted.
 *
 * Category itself was seeded earlier by `seed-categories.ts`. This script
 * is idempotent and slug-keyed; it never re-creates the category and
 * never touches `pipelineStatus`. The READY flip lives in
 * `flip-needlework-ready.ts` and is run as a separate auditable step
 * after the rest of the pipeline scaffolding is committed and deployed
 * green.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-needlework-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-needlework-taxonomy.ts --dry-run
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

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  {
    slug: 'cross-stitch',
    name: 'Cross-stitch',
    description:
      'Counted cross-stitch on Aida, evenweave, and linen, plus stamped cross-stitch on pre-printed cloth. Includes blackwork, Assisi, and miniature work. The largest and most accessible needlework sub-category.',
    order: 10,
  },
  {
    slug: 'needlepoint',
    name: 'Needlepoint',
    description:
      'Worked on canvas with wool or stranded cotton — canvaswork, bargello flame stitch, and petit point. Heavier ground than cross-stitch; the canvas is fully covered by the stitching.',
    order: 20,
  },
  {
    slug: 'tatting',
    name: 'Tatting',
    description:
      'Knotted lace worked with a shuttle or a tatting needle. Rings and chains build edgings, doilies, motifs. Notation-based rather than chart-based.',
    order: 30,
  },
  {
    slug: 'lacemaking',
    name: 'Lacemaking',
    description:
      'Bobbin lace worked on a pillow with bobbins, pricked patterns, and pins; needle lace built up from a couched thread skeleton. Slow craft, traditional ground for the British and continental lace canon.',
    order: 40,
  },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const needlework = await prisma.category.findUnique({ where: { slug: 'needlework' } })
  if (!needlework) {
    console.error(
      '[seed] needlework category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] needlework → ${needlework.id}`)

  let created = 0
  let unchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: needlework.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] needlework/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: needlework.id,
          },
        })
        console.log(`[seed] needlework/${spec.slug} → ${sub.id}`)
      }
      created += 1
      continue
    }

    unchanged += 1
  }

  console.log(
    `\n[seed] needlework-taxonomy: created=${created} unchanged=${unchanged} total=${SUB_CATEGORIES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

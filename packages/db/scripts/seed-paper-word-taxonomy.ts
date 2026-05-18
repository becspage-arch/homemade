/**
 * One-off seed for the Paper & word taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   paper-word                     "Paper & word"
 *   SubCat     bookbinding                    "Bookbinding"                (under paper-word)
 *   SubCat     calligraphy                    "Calligraphy"                (under paper-word)
 *   SubCat     papermaking                    "Papermaking"                (under paper-word)
 *   SubCat     marbling                       "Marbling"                   (under paper-word)
 *   SubCat     papercutting                   "Papercutting"               (under paper-word)
 *   SubCat     journalling-craft              "Journalling as craft"       (under paper-word)
 *   SubCat     zines                          "Zines"                      (under paper-word)
 *   SubCat     scrapbooking                   "Scrapbooking"               (under paper-word)
 *   SubCat     origami                        "Origami"                    (under paper-word)
 *
 * Category itself was seeded earlier by `seed-categories.ts`. This script
 * is idempotent and slug-keyed; it never re-creates the category and
 * never touches `pipelineStatus`. The READY flip lives in
 * `flip-paper-word-ready.ts` and is run as a separate auditable step
 * after the rest of the pipeline scaffolding is committed and deployed
 * green.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-paper-word-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-paper-word-taxonomy.ts --dry-run
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

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  {
    slug: 'bookbinding',
    name: 'Bookbinding',
    description:
      'Coptic, long-stitch, Japanese stab, pamphlet, accordion, dos-à-dos, and perfect-bound book structures. From signatures and end-papers up to covered boards.',
    order: 10,
  },
  {
    slug: 'calligraphy',
    name: 'Calligraphy',
    description:
      'Broad-edge and pointed-pen calligraphy traditions — Foundational, Roman capitals, Italic, Spencerian, Copperplate, uncial.',
    order: 20,
  },
  {
    slug: 'papermaking',
    name: 'Papermaking',
    description:
      'Sheet-forming from cotton linter and recycled fibre, embedded inclusions, watermarks, sized paper, and the Japanese washi tradition (kozo, gampi, mitsumata).',
    order: 30,
  },
  {
    slug: 'marbling',
    name: 'Marbling',
    description:
      'Suminagashi (Japanese ink-on-water), carrageenan-bath acrylic marbling, oil-on-water marbling, and paste-paper marbling. Includes alum mordanting and the safety preamble for marbling chemistry.',
    order: 40,
  },
  {
    slug: 'papercutting',
    name: 'Papercutting',
    description:
      'Scherenschnitte (German + Swiss silhouettes), jianzhi (Chinese folk papercut), and paper-cut silhouettes in the Hans Christian Andersen tradition.',
    order: 50,
  },
  {
    slug: 'journalling-craft',
    name: 'Journalling as craft',
    description:
      'The making of journals and journal pages — page layouts, spreads, hand-lettered headers, washi-tape techniques, ephemera collage, traveller\'s notebooks, signature binding for journals.',
    order: 60,
  },
  {
    slug: 'zines',
    name: 'Zines',
    description:
      'Folded mini-zines (the eight-page from one A4), perfect-bound zines, photocopy aesthetics, accordion-fold zines.',
    order: 70,
  },
  {
    slug: 'scrapbooking',
    name: 'Scrapbooking',
    description:
      'Page layouts, ephemera collage, mixed-media techniques, photo-corner mounting.',
    order: 80,
  },
  {
    slug: 'origami',
    name: 'Origami',
    description:
      'Origami models from pre-1928 published folds — Kindergarten Gifts and Occupations, Friedrich Fröbel, and late-Meiji Japanese primers.',
    order: 90,
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const paperWord = await prisma.category.findUnique({ where: { slug: 'paper-word' } })
  if (!paperWord) {
    console.error(
      '[seed] paper-word category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] paper-word → ${paperWord.id}`)

  let created = 0
  let unchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: paperWord.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] paper-word/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: paperWord.id,
          },
        })
        console.log(`[seed] paper-word/${spec.slug} → ${sub.id}`)
      }
      created += 1
      continue
    }

    unchanged += 1
  }

  console.log(
    `\n[seed] paper-word-taxonomy: created=${created} unchanged=${unchanged} total=${SUB_CATEGORIES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

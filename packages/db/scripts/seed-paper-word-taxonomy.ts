/**
 * One-off seed for the Paper & word taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   paper-word                     "Paper & word"  (pipelineStatus flipped to READY)
 *   SubCat     bookbinding                    "Bookbinding"
 *   SubCat     calligraphy                    "Calligraphy"
 *   SubCat     papermaking                    "Papermaking"
 *   SubCat     marbling                       "Marbling"
 *   SubCat     papercutting                   "Papercutting"
 *   SubCat     journalling-craft              "Journalling as craft"
 *   SubCat     zines                          "Zines"
 *   SubCat     scrapbooking                   "Scrapbooking"
 *   SubCat     origami                        "Origami"
 *
 * The Category itself was seeded earlier by `seed-categories.ts`. This
 * script:
 *   1. Flips `Category.pipelineStatus` for `paper-word` from
 *      NOT_READY → READY, so the round-robin autopilot picks Paper &
 *      word up on its next fire.
 *   2. Owns the sub-category list, so the upload-tutorial script has
 *      somewhere to land PATTERN + READING + TECHNIQUE rows.
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
      'Coptic, long-stitch, Japanese stab, pamphlet, accordion, dos-à-dos, and perfect-bound book structures. From signatures and end-papers up to covered boards. The biggest sub-category in Paper & word (~25%).',
    order: 10,
  },
  {
    slug: 'calligraphy',
    name: 'Calligraphy',
    description:
      'Broad-edge and pointed-pen calligraphy traditions — Foundational, Roman capitals, Italic, Spencerian, Copperplate, uncial. Tool-led, stroke-order-led, history-led. Anglicised period vocabulary.',
    order: 20,
  },
  {
    slug: 'papermaking',
    name: 'Papermaking',
    description:
      'Sheet-forming from cotton linter and recycled fibre, embedded inclusions, watermarks, sized paper, and the Japanese washi tradition (kozo, gampi, mitsumata). Equipment-light home setups.',
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
      'The making of journals and journal pages — page layouts, spreads, hand-lettered headers, washi-tape techniques, ephemera collage, traveller\'s notebooks, signature binding for journals. Strict scope boundary: no journal prompts or reflective-writing content (that belongs to Mindset).',
    order: 60,
  },
  {
    slug: 'zines',
    name: 'Zines',
    description:
      'Folded mini-zines (the eight-page from one A4), perfect-bound zines, photocopy aesthetics, accordion-fold zines. Cousins of bookbinding for short-form self-publishing.',
    order: 70,
  },
  {
    slug: 'scrapbooking',
    name: 'Scrapbooking',
    description:
      'Page layouts, ephemera collage, mixed-media techniques, photo-corner mounting. The shared craft tradition with journalling-craft, with a more photo-led focus.',
    order: 80,
  },
  {
    slug: 'origami',
    name: 'Origami',
    description:
      'Public-domain canonical origami models — pre-1928 published folds from Kindergarten Gifts and Occupations literature, Friedrich Fröbel folds, and late-Meiji Japanese primers. v1 capped at ~30 models that use only the basic-fold renderer. Advanced manoeuvres (inside reverse, petal, squash, sink, swivel, 3D collapse) require the deferred advanced renderer.',
    order: 90,
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  if (DRY_RUN) {
    console.log('[seed] paper-word: dry-run — no writes')
  }

  const paperWord = DRY_RUN
    ? await prisma.category.findUnique({ where: { slug: 'paper-word' } })
    : await prisma.category.upsert({
        where: { slug: 'paper-word' },
        create: {
          slug: 'paper-word',
          name: 'Paper & word',
          description:
            'Paper crafts, bookbinding, calligraphy, scrapbooking, and journalling as craft.',
          order: 120,
          pipelineStatus: 'READY',
        },
        update: { pipelineStatus: 'READY' },
      })

  if (!paperWord) {
    console.error(
      '[seed] paper-word: Category row not found. Run seed-categories.ts first or remove --dry-run.',
    )
    await prisma.$disconnect()
    process.exit(1)
  }

  console.log(`[seed] paper-word → ${paperWord.id} (pipelineStatus=READY)`)

  for (const spec of SUB_CATEGORIES) {
    if (DRY_RUN) {
      const existing = await prisma.subCategory.findUnique({
        where: { categoryId_slug: { categoryId: paperWord.id, slug: spec.slug } },
      })
      console.log(
        `[seed] paper-word/${spec.slug} → ${existing ? `${existing.id} (exists)` : 'would create'}`,
      )
      continue
    }
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: paperWord.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: paperWord.id,
      },
      // Leave existing sub-category rows alone on re-run so any post-seed
      // tweaks Rebecca makes in admin aren't overwritten. Matches the
      // sewing-taxonomy seed pattern.
      update: {},
    })
    console.log(`[seed] paper-word/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

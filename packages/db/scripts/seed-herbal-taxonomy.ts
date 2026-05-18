/**
 * One-off seed for the Herbal-Medicine taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   herbal-medicine        "Herbal medicine"
 *   SubCat     materia-medica         "Materia medica"        (HERB_PROFILE)
 *   SubCat     foundations            "Foundations"           (READING)
 *   SubCat     digestive              "Digestive"
 *   SubCat     respiratory            "Respiratory"
 *   SubCat     nervous-system         "Nervous system"
 *   SubCat     skin                   "Skin"
 *   SubCat     womens-health          "Women's health"
 *   SubCat     mental-emotional       "Mental & emotional"
 *   SubCat     musculoskeletal        "Musculoskeletal"
 *   SubCat     immune-support         "Immune support"
 *
 * The Category itself is already seeded by `seed-categories.ts`. This
 * script only owns the sub-category list, so the upload-tutorial script
 * has somewhere to land REMEDY + HERB_PROFILE + READING rows.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-herbal-taxonomy.ts
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
    slug: 'materia-medica',
    name: 'Materia medica',
    description:
      'Single-herb profiles. Latin binomial, parts used, primary actions, key constituents, traditional uses, safety.',
    order: 10,
  },
  {
    slug: 'foundations',
    name: 'Foundations',
    description:
      'Safety, principles, and reading material. When NOT to use a home remedy, how preparations work, pregnancy and paediatric guidance, drug-interaction primers.',
    order: 20,
  },
  {
    slug: 'digestive',
    name: 'Digestive',
    description:
      'Remedies for indigestion, nausea, bloating, mild colic. Carminative, bitter, and demulcent herbs.',
    order: 30,
  },
  {
    slug: 'respiratory',
    name: 'Respiratory',
    description:
      'Remedies for coughs, congestion, sore throats, hay fever. Expectorant, demulcent, anti-inflammatory herbs.',
    order: 40,
  },
  {
    slug: 'nervous-system',
    name: 'Nervous system',
    description:
      'Remedies for mild stress, tension, mild insomnia, restlessness. Nervine and gentle sedative herbs.',
    order: 50,
  },
  {
    slug: 'skin',
    name: 'Skin',
    description:
      'Salves, balms, oils, and compresses for minor cuts, bruises, irritation, mild eczema, minor burns. External use.',
    order: 60,
  },
  {
    slug: 'womens-health',
    name: "Women's health",
    description:
      'Remedies for period discomfort, perimenopausal symptoms, mild cycle support.',
    order: 70,
  },
  {
    slug: 'mental-emotional',
    name: 'Mental & emotional',
    description:
      'Mild-mood remedies.',
    order: 80,
  },
  {
    slug: 'musculoskeletal',
    name: 'Musculoskeletal',
    description:
      'Compresses, oils, and baths for muscular soreness, mild aches, minor bruising. External and bath preparations.',
    order: 90,
  },
  {
    slug: 'immune-support',
    name: 'Immune support',
    description:
      'Remedies for the seasonal cold, mild flu support, immune-tonic herbs.',
    order: 100,
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const herbal = await prisma.category.upsert({
    where: { slug: 'herbal-medicine' },
    create: {
      slug: 'herbal-medicine',
      name: 'Herbal medicine',
      description:
        'Remedies, tinctures, infusions, decoctions, oils, balms, salves, syrups.',
      order: 50,
    },
    update: {},
  })
  console.log(`[seed] herbal-medicine → ${herbal.id}`)

  for (const spec of SUB_CATEGORIES) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: herbal.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: herbal.id,
      },
      update: {},
    })
    console.log(`[seed] herbal-medicine/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

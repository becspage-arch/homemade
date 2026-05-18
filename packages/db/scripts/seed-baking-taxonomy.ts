/**
 * One-off seed for the Baking taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   baking                 "Baking"
 *   SubCat     bread                  "Bread"                (under baking)
 *   SubCat     cakes                  "Cakes"                (under baking)
 *   SubCat     pastries               "Pastries"             (under baking)
 *   SubCat     biscuits               "Biscuits"             (under baking)
 *   SubCat     pies                   "Pies"                 (under baking)
 *   SubCat     scones                 "Scones"               (under baking)
 *   SubCat     sweets-confectionery   "Sweets & confectionery" (under baking)
 *   SubCat     cake-decorating        "Cake decorating"      (under baking)
 *
 * Eight sub-categories per the locked Baking breakdown in
 * `BUILD_PROGRESS.md` § "Multi-category fill plan". The upload-tutorial
 * script requires both the Category and any referenced SubCategory to
 * exist before Baking rows can be inserted. Run once before uploading
 * the anchor batch.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-baking-taxonomy.ts
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
    slug: 'bread',
    name: 'Bread',
    description: ‘Tin loaves, sourdough, focaccia, soda bread, enriched doughs.’,
    order: 10,
  },
  {
    slug: 'cakes',
    name: 'Cakes',
    description: 'Sponges, Madeira cakes, layer cakes, fruit cakes.',
    order: 20,
  },
  {
    slug: 'pastries',
    name: 'Pastries',
    description: 'Shortcrust, puff, rough puff, choux, filo, laminated doughs.',
    order: 30,
  },
  {
    slug: 'biscuits',
    name: 'Biscuits',
    description: 'Shortbread, ginger biscuits, oat biscuits, sablés, savoury biscuits.',
    order: 40,
  },
  {
    slug: 'pies',
    name: 'Pies',
    description: 'Sweet and savoury pies, tarts, quiches.',
    order: 50,
  },
  {
    slug: 'scones',
    name: 'Scones',
    description: 'Sweet scones, cheese scones, fruit scones, drop scones.',
    order: 60,
  },
  {
    slug: 'sweets-confectionery',
    name: 'Sweets & confectionery',
    description: 'Caramels, fudge, honeycomb, marshmallows, tempered chocolate.',
    order: 70,
  },
  {
    slug: 'cake-decorating',
    name: 'Cake decorating',
    description:
      'Buttercream piping, fondant work, royal icing, mirror glazes, sugarpaste figures.',
    order: 80,
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const baking = await prisma.category.upsert({
    where: { slug: 'baking' },
    create: {
      slug: 'baking',
      name: 'Baking',
      description:
        'Bread, cakes, pastries, biscuits, pies, scones, sweets, confectionery, cake decorating.',
      order: 20,
    },
    update: {},
  })
  console.log(`[seed] baking → ${baking.id}`)

  for (const spec of SUB_CATEGORIES) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: baking.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: baking.id,
      },
      update: {},
    })
    console.log(`[seed] baking/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

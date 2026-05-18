/**
 * One-off seed for the Knitting sub-category taxonomy.
 *
 * The `knitting` Category itself is already seeded by `seed-categories.ts`
 * (launchOrder 7). This script owns the sub-category list so the upload-
 * tutorial script has somewhere to land STITCH and PATTERN rows.
 *
 * Garment grading is out of scope at launch (no fitted-garment patterns
 * requiring pattern pieces / digitisation). A `garments` sub-category is
 * still seeded so the future graded-pattern work has a home without a
 * follow-up migration.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-knitting-taxonomy.ts
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
    slug: 'stitches',
    name: 'Stitches',
    description:
      'Single-stitch tutorials — knit, purl, k2tog, cables, lace.',
    order: 10,
  },
  {
    slug: 'foundations',
    name: 'Foundations',
    description:
      'Casting on, casting off, reading a chart, choosing yarn and needles, gauge swatching, blocking.',
    order: 20,
  },
  {
    slug: 'scarves-shawls',
    name: 'Scarves & shawls',
    description:
      'Garter scarves, ribbed scarves, lace shawls, triangular shawls.',
    order: 30,
  },
  {
    slug: 'hats',
    name: 'Hats',
    description:
      'Ribbed hats, watch caps, slouch hats, berets, baby bonnets.',
    order: 40,
  },
  {
    slug: 'dishcloths-homewares',
    name: 'Dishcloths & homewares',
    description:
      'Dishcloths, washcloths, tea cosies, coasters, cushion covers.',
    order: 50,
  },
  {
    slug: 'baby',
    name: 'Baby',
    description:
      'Baby blankets, booties, bonnets, cardigans.',
    order: 60,
  },
  {
    slug: 'blankets',
    name: 'Blankets',
    description:
      'Throws, lap blankets, modular blankets, mitred-square projects.',
    order: 70,
  },
  {
    slug: 'socks',
    name: 'Socks',
    description:
      'Cuff-down and toe-up socks, fingering-weight and worsted-weight variants, heel constructions.',
    order: 80,
  },
  {
    slug: 'garments',
    name: 'Garments',
    description:
      'Jumpers, cardigans, vests.',
    order: 90,
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const knitting = await prisma.category.upsert({
    where: { slug: 'knitting' },
    create: {
      slug: 'knitting',
      name: 'Knitting',
      description: 'Stitches, techniques, and patterns.',
      order: 70,
    },
    update: {},
  })
  console.log(`[seed] knitting → ${knitting.id}`)

  for (const spec of SUB_CATEGORIES) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: knitting.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: knitting.id,
      },
      update: {},
    })
    console.log(`[seed] knitting/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

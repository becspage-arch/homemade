/**
 * One-off seed for the Mindset taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category    mindset           "Mindset"
 *   SubCategory tapping           "Tapping"
 *   SubCategory energy-statement  "Energy statements"
 *   SubCategory affirmation       "Affirmations"
 *   SubCategory spell             "Spells"
 *   SubCategory ritual            "Rituals"
 *   SubCategory activity          "Activities"
 *   SubCategory journal-prompt    "Journal prompts"
 *   SubCategory visualisation     "Visualisations"
 *   SubCategory meditation        "Meditations"
 *   SubCategory embodiment        "Embodiment"
 *   SubCategory reading           "Readings"
 *
 * Mindset sub-categories are practice types — that's the navigational
 * axis the admin browse and the public library use. The 16 life
 * categories (Money, Sleep, Body, Self-worth, etc.) surface through
 * `practiceTargets[]` on each Tutorial row, never through SubCategory.
 *
 * The upload-tutorial script requires the Category + SubCategory to
 * exist before Mindset PRACTICE / READING rows can reference them.
 * Run once before uploading the anchor batch.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-mindset-taxonomy.ts
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

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const mindset = await prisma.category.upsert({
    where: { slug: 'mindset' },
    create: {
      slug: 'mindset',
      name: 'Mindset',
      description:
        'Tapping, energy statements, affirmations, rituals, journal prompts, meditations, readings.',
      order: 50,
    },
    update: {},
  })
  console.log(`[seed] mindset → ${mindset.id}`)

  const subCategories: { slug: string; name: string; description: string; order: number }[] = [
    {
      slug: 'tapping',
      name: 'Tapping',
      description: 'EFT tapping scripts.',
      order: 10,
    },
    {
      slug: 'energy-statement',
      name: 'Energy statements',
      description: 'Short release-and-allow statements.',
      order: 20,
    },
    {
      slug: 'affirmation',
      name: 'Affirmations',
      description:
        'Short first-person present-tense statements paired with a single instruction for use.',
      order: 30,
    },
    {
      slug: 'spell',
      name: 'Spells',
      description:
        'Folk-magic-shaped focusing rituals with simple physical objects (candle, salt, water, paper).',
      order: 40,
    },
    {
      slug: 'ritual',
      name: 'Rituals',
      description: 'Weekly and seasonal ceremonies.',
      order: 50,
    },
    {
      slug: 'activity',
      name: 'Activities',
      description:
        'Object-based, in-the-world practices — coin rituals, wardrobe anchors, walk-by visualisations.',
      order: 60,
    },
    {
      slug: 'journal-prompt',
      name: 'Journal prompts',
      description: 'Question sets for the page.',
      order: 70,
    },
    {
      slug: 'visualisation',
      name: 'Visualisations',
      description: 'Image-led practices walked through in second-person prose.',
      order: 80,
    },
    {
      slug: 'meditation',
      name: 'Meditations',
      description: 'Short guided meditations — body scan, breathwork, image-led.',
      order: 90,
    },
    {
      slug: 'embodiment',
      name: 'Embodiment',
      description:
        'Body-anchor practices pairing a physical gesture (hand on heart, palm on belly) with a spoken statement.',
      order: 100,
    },
    {
      slug: 'reading',
      name: 'Readings',
      description:
        'Long-form explainers on how a method works, where a lineage comes from, and what the evidence says.',
      order: 110,
    },
  ]

  for (const sub of subCategories) {
    const row = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: mindset.id, slug: sub.slug } },
      create: { ...sub, categoryId: mindset.id },
      update: { name: sub.name, description: sub.description, order: sub.order },
    })
    console.log(`[seed] mindset/${sub.slug} → ${row.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

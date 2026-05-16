/**
 * One-off: rewrite Category.description for every Category row.
 *
 * The previous descriptions read AI — long em-dashes, "for the parts of life
 * that need tending", "grounded gentle real". Rebecca's brief: factual lists,
 * recipe-led for Cooking, no inspirational coda.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/update-category-descriptions.ts
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const DESCRIPTIONS: Record<string, string> = {
  cooking:
    'Recipes, sauces, breads, preserves, ferments, and the techniques that support them. British and European canon plus air-fryer and slow-cooker.',
  baking:
    'Bread, cakes, pastries, biscuits, pies, scones, and confectionery. Weights in grams, conventional °C temperatures, classical and modern methods.',
  mindset:
    'Tapping, energy statements, rituals, journal prompts, meditations, and readings. Practical, non-medical, drawn from multiple traditions.',
  garden:
    'Vegetables, fruit, herbs, flowers, permaculture, mushroom growing, and foraging. UK-zone focused with hemisphere-aware adjustments.',
  'herbal-medicine':
    'Remedies, tinctures, infusions, decoctions, oils, balms, salves, and syrups. Home apothecary basics; not medical advice.',
  crochet:
    'Patterns, stitches, edgings, and finishing techniques. Standard UK terminology with US conversions where they differ.',
  knitting:
    'Patterns, stitches, increases, decreases, and finishing techniques. Standard UK terminology with US conversions where they differ.',
  sewing:
    'Patterns, seams, hems, hand-stitches, and machine techniques. Garment, household, and mending work.',
  papercraft:
    'Origami, bookbinding, paper marbling, and printmaking. Folding, cutting, glueing, and pressing techniques.',
}

async function main(): Promise<void> {
  const rows = await prisma.category.findMany({ orderBy: { slug: 'asc' } })
  console.log(`Found ${rows.length} categories.`)

  let updated = 0
  let skipped = 0
  for (const row of rows) {
    const next = DESCRIPTIONS[row.slug]
    if (!next) {
      console.log(`  [skip] ${row.slug} — no rewrite drafted (current: "${row.description ?? ''}")`)
      skipped++
      continue
    }
    if (row.description === next) {
      console.log(`  [skip] ${row.slug} — already current`)
      skipped++
      continue
    }
    await prisma.category.update({ where: { id: row.id }, data: { description: next } })
    console.log(`  [update] ${row.slug}: "${next}"`)
    updated++
  }
  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })

/**
 * One-off seed for the Cooking taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   cooking    "Cooking"
 *   SubCat     sauces     "Sauces"      (under cooking)
 *   SubCat     preserves  "Preserves"   (under cooking)
 *
 * The anchor-tutorial upload script requires these to exist (it never creates
 * categories itself — see upload-tutorial.ts). Run once before uploading the
 * anchor tutorials.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-cooking-taxonomy.ts
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
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const cooking = await prisma.category.upsert({
    where: { slug: 'cooking' },
    create: {
      slug: 'cooking',
      name: 'Cooking',
      description:
        'Sauces, breads, preserves, pastries, ferments. Technique-first cookery, written for someone learning the craft.',
      order: 10,
    },
    update: {},
  })
  console.log(`[seed] cooking → ${cooking.id}`)

  const sauces = await prisma.subCategory.upsert({
    where: { categoryId_slug: { categoryId: cooking.id, slug: 'sauces' } },
    create: {
      slug: 'sauces',
      name: 'Sauces',
      description: 'The mother sauces and the family of derivatives that flow from each.',
      order: 10,
      categoryId: cooking.id,
    },
    update: {},
  })
  console.log(`[seed] cooking/sauces → ${sauces.id}`)

  const preserves = await prisma.subCategory.upsert({
    where: { categoryId_slug: { categoryId: cooking.id, slug: 'preserves' } },
    create: {
      slug: 'preserves',
      name: 'Preserves',
      description: 'Jams, jellies, chutneys, pickles. Putting the summer in a jar.',
      order: 20,
      categoryId: cooking.id,
    },
    update: {},
  })
  console.log(`[seed] cooking/preserves → ${preserves.id}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

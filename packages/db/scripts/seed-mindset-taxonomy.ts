/**
 * One-off seed for the Mindset taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   mindset    "Mindset"
 *
 * Mindset has no sub-categories at launch — the 16 life categories
 * (Money, Sleep, Body, Self-worth, etc.) are surfaced through
 * `PracticeTarget[]` on each Tutorial row, not through SubCategory
 * rows. If a Body sub-category is later needed for
 * Perimenopause / Menopause routing it lands here.
 *
 * The upload-tutorial script requires the Category to exist before
 * Mindset PRACTICE / READING rows can be inserted. Run once before
 * uploading the anchor batch.
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
        'Practices, rituals, journal prompts, meditations, and readings for the parts of life that need tending — money, body, sleep, motherhood, fear, joy, grief. Grounded, gentle, real.',
      order: 50,
    },
    update: {},
  })
  console.log(`[seed] mindset → ${mindset.id}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})

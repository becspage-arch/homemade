/**
 * One-off export of the 959 DRAFT PATTERN crochet Tutorial rows — the prose
 * patterns written before the loom existed — to a JSON file, BEFORE any of
 * them are triaged or deleted. Every column, so the export is a full
 * recovery point. See `crochet-draft-triage.ts` for what happens next.
 *
 *   cd packages/db && pnpm exec tsx scripts/export-crochet-draft-patterns.ts
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { writeFileSync } from 'node:fs'
import { prisma } from '@homemade/db'

const OUT_PATH = '../../docs/archive/crochet-draft-patterns-export-2026-09-06.json'

async function main(): Promise<void> {
  const category = await prisma.category.findFirst({ where: { slug: 'crochet' } })
  if (!category) throw new Error('crochet category not found')

  const rows = await prisma.tutorial.findMany({
    where: { categoryId: category.id, type: 'PATTERN', status: 'DRAFT' },
    include: {
      tags: true,
      subCategory: true,
      recipeIngredients: true,
      recipeTools: true,
    },
    orderBy: { slug: 'asc' },
  })

  console.log(`Exporting ${rows.length} draft PATTERN crochet tutorials...`)
  // JSON.stringify handles Date -> ISO string; BigInt not used on this model.
  writeFileSync(OUT_PATH, JSON.stringify(rows, null, 2))
  console.log(`Wrote ${OUT_PATH}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

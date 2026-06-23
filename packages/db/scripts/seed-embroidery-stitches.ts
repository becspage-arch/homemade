/**
 * Seed the embroidery stitch dictionary into the Stitch table.
 *
 * Idempotent: upserts by craft-prefixed slug ('embroidery-<slug>'), so re-running
 * after editing scripts/data/embroidery-stitches.ts reconciles the DB to the file.
 * The file is the single source of truth.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-embroidery-stitches.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const { EMBROIDERY_STITCHES, validateEmbroideryStitches } = await import(
    './data/embroidery-stitches.js'
  )

  const errors = validateEmbroideryStitches()
  if (errors.length) {
    console.error('Stitch list INVALID — aborting:\n  ' + errors.join('\n  '))
    process.exit(1)
  }

  for (const s of EMBROIDERY_STITCHES) {
    const slug = `embroidery-${s.slug}`
    await prisma.stitch.upsert({
      where: { slug },
      create: {
        slug,
        craft: 'embroidery',
        canonicalName: s.canonicalName,
        usName: s.usName ?? null,
        category: s.family,
        difficulty: s.difficulty,
        notes: s.usedFor,
      },
      update: {
        craft: 'embroidery',
        canonicalName: s.canonicalName,
        usName: s.usName ?? null,
        category: s.family,
        difficulty: s.difficulty,
        notes: s.usedFor,
      },
    })
  }

  const byFamily = await prisma.stitch.groupBy({
    by: ['category'],
    where: { craft: 'embroidery' },
    _count: true,
  })
  console.log('Seeded embroidery stitches:')
  for (const f of byFamily.sort((a, b) => a.category.localeCompare(b.category))) {
    console.log(`  ${f.category.padEnd(20)} ${f._count}`)
  }
  const total = await prisma.stitch.count({ where: { craft: 'embroidery' } })
  console.log(`  TOTAL ${total}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-embroidery-stitches] failed:', err)
  process.exit(1)
})

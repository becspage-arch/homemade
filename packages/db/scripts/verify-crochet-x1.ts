/**
 * Verification helper for Worker X1 (Crochet autopilot foundation).
 *
 * Prints the new schema columns + the enum values + the Category.crochet
 * row, so the worker hand-off can paste a clean snapshot.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/verify-crochet-x1.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  console.log('─── CrochetPattern columns (Worker X1 additions + existing fields) ───')
  const patternCols = (await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'CrochetPattern'
      AND column_name IN (
        'constructionDirection',
        'bodyShape',
        'gradingNotes',
        'sizesGraded',
        'pieces',
        'buildOrder',
        'assemblyInstructions'
      )
    ORDER BY column_name
  `)) as Array<Record<string, unknown>>
  for (const row of patternCols) {
    console.log(`  ${String(row.column_name).padEnd(24)} | ${String(row.data_type).padEnd(20)} | udt=${row.udt_name} | nullable=${row.is_nullable}`)
  }

  console.log('\n─── Category columns (Worker X1 additions) ───')
  const catCols = (await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'Category'
      AND column_name IN (
        'autopilotContentTypesEnabled',
        'techniqueSlugs',
        'criticalTechniques',
        'aliases'
      )
    ORDER BY column_name
  `)) as Array<Record<string, unknown>>
  for (const row of catCols) {
    console.log(`  ${String(row.column_name).padEnd(32)} | ${String(row.data_type).padEnd(10)} | udt=${row.udt_name} | nullable=${row.is_nullable}`)
  }

  console.log('\n─── New enums ───')
  const enums = (await prisma.$queryRawUnsafe(`
    SELECT t.typname AS name, e.enumlabel AS value, e.enumsortorder AS sort
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname IN ('ConstructionDirection', 'BodyShape')
    ORDER BY t.typname, e.enumsortorder
  `)) as Array<{ name: string; value: string; sort: number }>
  const grouped = new Map<string, string[]>()
  for (const row of enums) {
    if (!grouped.has(row.name)) grouped.set(row.name, [])
    grouped.get(row.name)!.push(row.value)
  }
  for (const [name, values] of grouped) {
    console.log(`  ${name}: ${values.join(' | ')}`)
  }

  console.log('\n─── Category.crochet ───')
  const crochet = await prisma.category.findUnique({
    where: { slug: 'crochet' },
    select: {
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      launchOrder: true,
      lastAutopilotRunAt: true,
      isPublicVisible: true,
      autopilotContentTypesEnabled: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
    },
  })
  if (!crochet) {
    console.log('  (not found — run seed-categories.ts)')
  } else {
    console.log(`  slug                          : ${crochet.slug}`)
    console.log(`  pipelineStatus                : ${crochet.pipelineStatus}`)
    console.log(`  targetTutorialCount           : ${crochet.targetTutorialCount}`)
    console.log(`  launchOrder                   : ${crochet.launchOrder}`)
    console.log(`  lastAutopilotRunAt            : ${crochet.lastAutopilotRunAt?.toISOString() ?? 'NULL'}`)
    console.log(`  isPublicVisible               : ${crochet.isPublicVisible}`)
    console.log(`  autopilotContentTypesEnabled  : [${crochet.autopilotContentTypesEnabled.join(', ')}]`)
    console.log(`  techniqueSlugs count          : ${crochet.techniqueSlugs.length}`)
    console.log(`  criticalTechniques count      : ${crochet.criticalTechniques.length}`)
    console.log(`  aliases count                 : ${crochet.aliases.length}`)
    if (crochet.techniqueSlugs.length > 0) {
      console.log(`  techniqueSlugs (first 12)     : ${crochet.techniqueSlugs.slice(0, 12).join(', ')}`)
    }
    if (crochet.criticalTechniques.length > 0) {
      console.log(`  criticalTechniques            : ${crochet.criticalTechniques.join(', ')}`)
    }
    if (crochet.aliases.length > 0) {
      console.log(`  aliases (first 12)            : ${crochet.aliases.slice(0, 12).join(', ')}`)
    }
  }

  console.log('\n─── Autopilot round-robin queue position ───')
  const queue = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    select: { slug: true, lastAutopilotRunAt: true, launchOrder: true },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
  })
  queue.forEach((c, i) => {
    const fire = c.lastAutopilotRunAt
      ? c.lastAutopilotRunAt.toISOString().slice(0, 16).replace('T', ' ')
      : 'NULL (back of queue)'
    const marker = c.slug === 'crochet' ? ' ← crochet' : ''
    console.log(`  ${String(i + 1).padStart(2)}. ${c.slug.padEnd(22)} | last fire: ${fire}${marker}`)
  })

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

/**
 * Verification report for phase_needlework_pipeline_setup_001.
 *
 * Prints:
 *   1. Migration applied check (queries _prisma_migrations).
 *   2. SubCategory.autopilotEnabled per needlework sub-cat (10 rows).
 *   3. Category.needlework row showing targetTutorialCount,
 *      techniqueSlugs count, criticalTechniques count, aliases count,
 *      pipelineStatus, isPublicVisible, lastAutopilotRunAt.
 *   4. Audit-recent-state table of every READY category showing where
 *      needlework lands in the round-robin.
 *   5. Queue position the next autopilot fire would pick (least
 *      recently fired READY-and-not-COMPLETE category, NULLS FIRST).
 *
 * Read-only. Safe to run against prod.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/verify-needlework-pipeline-setup.ts
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

  console.log('=== 1. Migration applied ===')
  const migration = await prisma.$queryRawUnsafe<Array<{ migration_name: string; finished_at: Date | null }>>(
    `SELECT migration_name, finished_at
     FROM _prisma_migrations
     WHERE migration_name = '20260609100000_phase_needlework_pipeline_setup_001'`,
  )
  if (migration.length === 0) {
    console.log('  NOT APPLIED')
  } else {
    console.log(`  ${migration[0]!.migration_name}  finished_at=${migration[0]!.finished_at?.toISOString()}`)
  }

  console.log('\n=== 2. SubCategory.autopilotEnabled (needlework) ===')
  const category = await prisma.category.findUnique({
    where: { slug: 'needlework' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
      isPublicVisible: true,
      lastAutopilotRunAt: true,
    },
  })
  if (!category) {
    console.log('  needlework Category row not present!')
    await prisma.$disconnect()
    return
  }
  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: category.id },
    select: { slug: true, name: true, autopilotEnabled: true, order: true },
    orderBy: { order: 'asc' },
  })
  console.log(`  ${'slug'.padEnd(22)} ${'order'.padStart(5)}  autopilotEnabled`)
  console.log(`  ${'-'.repeat(22)} ${'-'.repeat(5)}  ${'-'.repeat(16)}`)
  for (const sc of subCats) {
    console.log(`  ${sc.slug.padEnd(22)} ${String(sc.order).padStart(5)}  ${sc.autopilotEnabled}`)
  }
  const enabledCount = subCats.filter((sc) => sc.autopilotEnabled).length
  const disabledCount = subCats.filter((sc) => !sc.autopilotEnabled).length
  console.log(`  (${enabledCount} enabled, ${disabledCount} disabled, ${subCats.length} total)`)

  console.log('\n=== 3. Category.needlework row ===')
  console.log(`  slug                  = ${category.slug}`)
  console.log(`  pipelineStatus        = ${category.pipelineStatus}`)
  console.log(`  targetTutorialCount   = ${category.targetTutorialCount}`)
  console.log(`  techniqueSlugs count  = ${category.techniqueSlugs.length}`)
  console.log(`  criticalTechniques    = ${category.criticalTechniques.length}`)
  console.log(`  aliases count         = ${category.aliases.length}`)
  console.log(`  isPublicVisible       = ${category.isPublicVisible}`)
  console.log(`  lastAutopilotRunAt    = ${category.lastAutopilotRunAt ? category.lastAutopilotRunAt.toISOString() : 'NULL'}`)

  console.log('\n=== 4. Recent-state of every READY category ===')
  const rows = await prisma.$queryRawUnsafe<Array<{
    slug: string
    pipelinestatus: string
    targettutorialcount: number | null
    lastautopilotrunat: Date | null
    launchorder: number | null
    published_count: number
  }>>(
    `SELECT c.slug,
            c."pipelineStatus" AS pipelinestatus,
            c."targetTutorialCount" AS targettutorialcount,
            c."lastAutopilotRunAt" AS lastautopilotrunat,
            c."launchOrder" AS launchorder,
            (SELECT COUNT(*)::int FROM "Tutorial" t
             WHERE t."categoryId" = c.id AND t."status" = 'PUBLISHED') AS published_count
     FROM "Category" c
     WHERE c."pipelineStatus" = 'READY'
     ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC NULLS LAST, c.slug ASC`,
  )
  console.log(`  ${'pos'.padStart(3)}  ${'slug'.padEnd(22)} ${'published'.padStart(9)}  ${'target'.padStart(6)}  ${'launchOrder'.padStart(11)}  lastAutopilotRunAt`)
  console.log(`  ${'-'.repeat(3)}  ${'-'.repeat(22)} ${'-'.repeat(9)}  ${'-'.repeat(6)}  ${'-'.repeat(11)}  ${'-'.repeat(24)}`)
  rows.forEach((r, i) => {
    const last = r.lastautopilotrunat ? r.lastautopilotrunat.toISOString() : 'NULL'
    console.log(`  ${String(i + 1).padStart(3)}  ${r.slug.padEnd(22)} ${String(r.published_count).padStart(9)}  ${String(r.targettutorialcount ?? '-').padStart(6)}  ${String(r.launchorder ?? '-').padStart(11)}  ${last}`)
  })

  const needleworkPos = rows.findIndex((r) => r.slug === 'needlework') + 1
  console.log(`\n=== 5. Round-robin position ===`)
  console.log(`  needlework is at position ${needleworkPos} of ${rows.length} READY categories`)
  if (rows.length > 0) {
    console.log(`  next autopilot fire would pick: ${rows[0]!.slug}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[verify] failed:', err)
  process.exit(1)
})

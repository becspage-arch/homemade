/**
 * Verification report for the sewing S-3 pipeline-setup.
 *
 * Prints:
 *   1. Category.sewing row (pipelineStatus, isPublicVisible, launchOrder,
 *      targetTutorialCount, techniqueSlugs count, criticalTechniques
 *      count, aliases count, autopilotContentTypesEnabled).
 *   2. SubCategory rows under sewing with autopilotEnabled.
 *   3. Audit-recent-state position in the READY rotation (sewing should
 *      NOT appear since pipelineStatus = NOT_READY).
 *   4. Per-author-prompt existence + first 200 chars of each.
 *
 * Read-only. Safe to run against prod.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/verify-sewing-pipeline-setup.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, statSync } from 'node:fs'
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

const REPO_ROOT_CANDIDATES = [
  resolve(__dirname, '../../..'),
  resolve(__dirname, '../../../..'),
  resolve(__dirname, '../../../../..'),
]

function findRepoRoot(): string {
  for (const candidate of REPO_ROOT_CANDIDATES) {
    if (existsSync(resolve(candidate, 'docs'))) return candidate
  }
  throw new Error('Could not locate repo root with a docs/ dir')
}

const EXPECTED_PROMPTS = [
  'sewing-author.md',
  'sewing-tops-author.md',
  'sewing-dresses-author.md',
  'sewing-bottoms-author.md',
  'sewing-outerwear-author.md',
  'sewing-accessories-author.md',
  'sewing-bags-author.md',
  'sewing-home-author.md',
  'sewing-costume-author.md',
  'sewing-womens-intimates-author.md',
  'sewing-specialty-author.md',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  console.log('=== 1. Category.sewing row ===')
  const category = await prisma.category.findUnique({
    where: { slug: 'sewing' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      isPublicVisible: true,
      launchOrder: true,
      targetTutorialCount: true,
      autopilotContentTypesEnabled: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
      lastAutopilotRunAt: true,
    },
  })
  if (!category) {
    console.log('  sewing Category row not present')
    await prisma.$disconnect()
    return
  }
  console.log(`  slug                         = ${category.slug}`)
  console.log(`  pipelineStatus               = ${category.pipelineStatus}`)
  console.log(`  isPublicVisible              = ${category.isPublicVisible}`)
  console.log(`  launchOrder                  = ${category.launchOrder}`)
  console.log(`  targetTutorialCount          = ${category.targetTutorialCount}`)
  console.log(`  autopilotContentTypesEnabled = [${category.autopilotContentTypesEnabled.join(', ')}]`)
  console.log(`  techniqueSlugs count         = ${category.techniqueSlugs.length}`)
  console.log(`  criticalTechniques count     = ${category.criticalTechniques.length}`)
  console.log(`  aliases count                = ${category.aliases.length}`)
  console.log(`  lastAutopilotRunAt           = ${category.lastAutopilotRunAt ? category.lastAutopilotRunAt.toISOString() : 'NULL'}`)

  console.log('\n=== 2. SubCategory rows under sewing ===')
  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: category.id },
    select: { slug: true, name: true, autopilotEnabled: true, order: true },
    orderBy: [{ order: 'asc' }, { slug: 'asc' }],
  })
  console.log(`  ${'slug'.padEnd(26)} ${'order'.padStart(5)}  autopilotEnabled  name`)
  console.log(`  ${'-'.repeat(26)} ${'-'.repeat(5)}  ${'-'.repeat(16)}  ${'-'.repeat(30)}`)
  for (const sc of subCats) {
    console.log(`  ${sc.slug.padEnd(26)} ${String(sc.order).padStart(5)}  ${String(sc.autopilotEnabled).padEnd(16)}  ${sc.name}`)
  }
  const enabled = subCats.filter((sc) => sc.autopilotEnabled).length
  const disabled = subCats.filter((sc) => !sc.autopilotEnabled).length
  console.log(`  (${enabled} enabled, ${disabled} disabled, ${subCats.length} total)`)

  console.log('\n=== 3. Audit-recent-state — every READY category ===')
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
  const sewingPos = rows.findIndex((r) => r.slug === 'sewing')
  console.log(`\n  sewing in the READY rotation? ${sewingPos === -1 ? 'NO (correct: NOT_READY)' : `YES at position ${sewingPos + 1} (WRONG)`}`)

  console.log('\n=== 4. Author prompt files ===')
  const repoRoot = findRepoRoot()
  for (const filename of EXPECTED_PROMPTS) {
    const path = resolve(repoRoot, 'docs', filename)
    if (!existsSync(path)) {
      console.log(`  MISSING  ${filename}`)
      continue
    }
    const content = readFileSync(path, 'utf-8')
    const wordCount = content.split(/\s+/).filter(Boolean).length
    const isStub = content.includes('Autopilot does NOT author')
    const sizeKb = Math.round(statSync(path).size / 1024)
    console.log(`  ${isStub ? 'STUB' : 'FULL'}  ${filename.padEnd(38)}  ${String(wordCount).padStart(5)} words  ${String(sizeKb).padStart(3)} KB`)
  }

  console.log('\n=== 5. Scope-out checks ===')
  const freesewingDir = resolve(repoRoot, 'node_modules', '@freesewing')
  console.log(`  @freesewing/* installed?    ${existsSync(freesewingDir) ? 'YES (WRONG)' : 'NO (correct)'}`)
  const gradingDir = resolve(repoRoot, 'apps', 'web', 'src', 'lib', 'sewing', 'grading')
  console.log(`  apps/web/src/lib/sewing/grading exists? ${existsSync(gradingDir) ? 'YES (WRONG)' : 'NO (correct)'}`)
  const studioRoute = resolve(repoRoot, 'apps', 'web', 'src', 'app', 'studio', 'sewing')
  console.log(`  /studio/sewing route exists? ${existsSync(studioRoute) ? 'YES (WRONG)' : 'NO (correct)'}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[verify] failed:', err)
  process.exit(1)
})

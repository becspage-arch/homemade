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

async function main() {
  const { prisma } = await import('../src/index.js')

  // Correct pick: NULLS FIRST (never-run categories have highest priority)
  const cats = await prisma.$queryRaw<Array<{
    id: string, slug: string, pipelineStatus: string,
    targetTutorialCount: number | null, lastAutopilotRunAt: Date | null,
    launchOrder: number | null, published_count: number
  }>>`
    SELECT c.id,
           c.slug,
           c."pipelineStatus",
           c."targetTutorialCount",
           c."lastAutopilotRunAt",
           c."launchOrder",
           (
             SELECT COUNT(*)::int
             FROM "Tutorial" t
             WHERE t."categoryId" = c.id
               AND t."status" = 'PUBLISHED'
           ) AS published_count
    FROM "Category" c
    WHERE c."pipelineStatus" = 'READY'
    ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC
    LIMIT 10
  `

  console.log('READY categories (NULLS FIRST order):')
  for (const c of cats) {
    console.log(`  ${c.slug.padEnd(30)} pub=${String(c.published_count).padStart(4)} tgt=${String(c.targetTutorialCount ?? '?').padStart(4)} launchOrder=${c.launchOrder ?? '?'} lastRun=${c.lastAutopilotRunAt?.toISOString() ?? 'never'}`)
  }

  const first = cats[0]
  if (!first) { console.log('NO_CANDIDATE'); await prisma.$disconnect(); return }

  // Check if complete
  if (first.targetTutorialCount !== null && first.published_count >= first.targetTutorialCount) {
    console.log(`SHOULD_FLIP_COMPLETE: ${first.slug}`)
  } else {
    console.log(`\nCORRECT_PICK: ${first.slug}`)
    console.log(`  id: ${first.id}`)
    console.log(`  publishedCount: ${first.published_count}`)
    console.log(`  targetTutorialCount: ${first.targetTutorialCount}`)
    console.log(`  lastAutopilotRunAt: ${first.lastAutopilotRunAt?.toISOString() ?? 'never'}`)
    console.log(`  launchOrder: ${first.launchOrder}`)
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

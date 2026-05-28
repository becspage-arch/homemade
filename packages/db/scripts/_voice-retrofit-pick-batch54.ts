/**
 * Pick the next batch for voice-retrofit batch 2026-05-28-batch15.
 * Selection rules per the cron brief:
 *   - status PUBLISHED, voiceRetrofittedAt IS NULL
 *   - take 75 by slug ASC
 *   - no category spread, no content-type spread
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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

import { prisma } from '../src'

const BATCH_ID = '2026-05-28-batch15'
const TARGET_COUNT = 75

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const remainingCount = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`[before] PUBLISHED with voiceRetrofittedAt IS NULL: ${remainingCount}`)

  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: {
      slug: true,
      title: true,
      type: true,
      category: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
    take: TARGET_COUNT,
  })

  const slugs = candidates.map((c) => c.slug)
  const byCategory: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const c of candidates) {
    const cat = c.category?.slug ?? 'unknown'
    byCategory[cat] = (byCategory[cat] ?? 0) + 1
    byType[c.type] = (byType[c.type] ?? 0) + 1
  }

  writeFileSync(
    resolve(outDir, '_slugs.json'),
    JSON.stringify(slugs, null, 2) + '\n',
    'utf8',
  )
  writeFileSync(
    resolve(outDir, '_pick-summary.json'),
    JSON.stringify(
      {
        batchId: BATCH_ID,
        count: slugs.length,
        remainingBefore: remainingCount,
        byCategory,
        byType,
        details: candidates.map((c) => ({
          slug: c.slug,
          title: c.title,
          type: c.type,
          categorySlug: c.category?.slug,
        })),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  console.log(`[picked] ${slugs.length} tutorials`)
  console.log(`[by-category] ${JSON.stringify(byCategory)}`)
  console.log(`[by-type] ${JSON.stringify(byType)}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

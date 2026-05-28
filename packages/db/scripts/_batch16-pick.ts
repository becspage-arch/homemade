import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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

const BATCH_ID = '2026-05-28-batch16'

async function main() {
  const { prisma } = await import('../src/index.js')
  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
    take: 75,
  })

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const slugs = candidates.map((c) => c.slug)
  writeFileSync(resolve(outDir, '_slugs.json'), JSON.stringify(slugs, null, 2) + '\n', 'utf8')

  const byCat: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const c of candidates) {
    const cat = c.category?.slug ?? 'none'
    byCat[cat] = (byCat[cat] ?? 0) + 1
    byType[c.type] = (byType[c.type] ?? 0) + 1
  }
  const summary = {
    batch: BATCH_ID,
    count: candidates.length,
    byCategory: byCat,
    byType: byType,
    slugs,
  }
  writeFileSync(resolve(outDir, '_pick-summary.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8')
  console.log(`Picked ${candidates.length} tutorials for batch ${BATCH_ID}`)
  console.log(`By category:`, byCat)
  console.log(`By type:`, byType)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

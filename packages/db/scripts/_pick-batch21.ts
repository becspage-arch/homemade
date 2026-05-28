import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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

const BATCH_ID = '2026-05-28-batch21'
const BATCH_SIZE = 75

async function main() {
  const { prisma } = await import('../src/index.js')
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
    take: BATCH_SIZE,
  })

  const byCategory: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const c of candidates) {
    const catSlug = c.category?.slug ?? 'unknown'
    byCategory[catSlug] = (byCategory[catSlug] ?? 0) + 1
    byType[c.type] = (byType[c.type] ?? 0) + 1
  }

  console.log(`Picked: ${candidates.length}`)
  console.log('By category:', byCategory)
  console.log('By type:', byType)

  const slugList = candidates.map((p) => p.slug)
  writeFileSync(resolve(outDir, '_slugs.json'), JSON.stringify(slugList, null, 2) + '\n', 'utf8')
  writeFileSync(
    resolve(outDir, '_pick-summary.json'),
    JSON.stringify(
      { batchId: BATCH_ID, count: candidates.length, byCategory, byType, picks: candidates },
      null,
      2,
    ) + '\n',
    'utf8',
  )
  console.log(`Slugs written to ${resolve(outDir, '_slugs.json')}`)
  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const cats = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
    },
    orderBy: [
      { lastAutopilotRunAt: 'asc' },
      { launchOrder: 'asc' },
    ],
  })

  const published = await prisma.tutorial.groupBy({
    by: ['categoryId'],
    where: { status: 'PUBLISHED' },
    _count: { id: true },
  })
  const pubMap = Object.fromEntries(published.map(r => [r.categoryId, r._count.id]))

  for (const c of cats) {
    const pub = pubMap[c.id] ?? 0
    console.log(`${c.slug} | status=${c.pipelineStatus} | published=${pub} | target=${c.targetTutorialCount} | lastRun=${c.lastAutopilotRunAt?.toISOString() ?? 'null'} | launchOrder=${c.launchOrder}`)
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

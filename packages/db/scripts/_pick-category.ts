import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
  const cats = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } },
    },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
  })

  for (const c of cats) {
    const pub = c._count.tutorials
    const target = c.targetTutorialCount
    console.log(
      `${c.slug} | ${c.pipelineStatus} | pub:${pub} | target:${target ?? 'null'} | lastRun:${c.lastAutopilotRunAt?.toISOString() ?? 'null'}`,
    )
  }

  await prisma.$disconnect()
}
main()

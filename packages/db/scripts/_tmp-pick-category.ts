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

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    // Count by status
    const statusCounts = await prisma.category.groupBy({
      by: ['pipelineStatus'],
      _count: { id: true },
    })
    console.log('STATUS_COUNTS:' + JSON.stringify(statusCounts))

    // Pick the top READY category
    const candidates = await prisma.category.findMany({
      where: { pipelineStatus: 'READY' },
      orderBy: [
        { lastAutopilotRunAt: { sort: 'asc', nulls: 'first' } },
        { launchOrder: 'asc' },
      ],
      take: 5,
      select: {
        id: true,
        slug: true,
        name: true,
        pipelineStatus: true,
        targetTutorialCount: true,
        lastAutopilotRunAt: true,
        launchOrder: true,
        _count: {
          select: {
            tutorials: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    })
    console.log('CANDIDATES:' + JSON.stringify(candidates))
  } finally {
    await prisma.$disconnect()
  }
}
main().catch(e => { console.log('ERROR:' + e); process.exit(1) })

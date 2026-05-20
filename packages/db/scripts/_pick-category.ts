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
    const statusCounts = await prisma.category.groupBy({
      by: ['pipelineStatus'],
      _count: { id: true },
    })
    const countMap: Record<string, number> = {}
    for (const row of statusCounts) countMap[row.pipelineStatus] = row._count.id
    console.log('STATUS_COUNTS:' + JSON.stringify(countMap))

    const candidates = await prisma.category.findMany({
      where: { pipelineStatus: 'READY' },
      orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
    })

    console.log('READY_CANDIDATES:' + candidates.map(c => `${c.slug}(lastRun=${c.lastAutopilotRunAt?.toISOString() ?? 'null'},order=${c.launchOrder})`).join(', '))

    for (const candidate of candidates) {
      const publishedCount = await prisma.tutorial.count({
        where: { categoryId: candidate.id, status: 'PUBLISHED' },
      })
      console.log(`CHECK:${candidate.slug} published=${publishedCount} target=${candidate.targetTutorialCount}`)

      if (
        candidate.targetTutorialCount !== null &&
        publishedCount >= candidate.targetTutorialCount
      ) {
        console.log(`FLIP_COMPLETE:${candidate.slug}`)
        await prisma.category.update({
          where: { id: candidate.id },
          data: { pipelineStatus: 'COMPLETE' },
        })
        continue
      }

      console.log('PICKED:' + JSON.stringify({ id: candidate.id, slug: candidate.slug, publishedCount, targetTutorialCount: candidate.targetTutorialCount, lastAutopilotRunAt: candidate.lastAutopilotRunAt }))
      return
    }

    console.log('NO_CANDIDATE')
    console.log('READY:' + (countMap['READY'] ?? 0))
    console.log('NOT_READY:' + (countMap['NOT_READY'] ?? 0))
    console.log('COMPLETE:' + (countMap['COMPLETE'] ?? 0))
    console.log('PAUSED:' + (countMap['PAUSED'] ?? 0))
  } catch (e: any) {
    console.error('ERR:' + e.message)
    process.exit(1)
  }
}
main()

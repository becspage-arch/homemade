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

  const cats = await prisma.category.findMany({
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
          tutorials: { where: { status: 'PUBLISHED' } }
        }
      }
    },
    orderBy: [
      { lastAutopilotRunAt: 'asc' },
      { launchOrder: 'asc' }
    ]
  })

  console.log('All categories:')
  for (const c of cats) {
    const status = c.pipelineStatus
    const pub = c._count.tutorials
    const tgt = c.targetTutorialCount
    console.log(`  ${c.slug.padEnd(30)} ${String(status).padEnd(12)} pub=${String(pub).padStart(4)} tgt=${String(tgt ?? '?').padStart(4)}  lastRun=${c.lastAutopilotRunAt?.toISOString() ?? 'never'}`)
  }

  const readyCats = cats.filter(c => c.pipelineStatus === 'READY')
  console.log(`\nREADY count: ${readyCats.length}`)

  const picked = readyCats[0]
  if (!picked) {
    const byCounts: Record<string, number> = {}
    for (const c of cats) byCounts[c.pipelineStatus] = (byCounts[c.pipelineStatus] ?? 0) + 1
    console.log('NO_CANDIDATE')
    console.log('counts:', JSON.stringify(byCounts))
  } else {
    const pub = picked._count.tutorials
    const tgt = picked.targetTutorialCount
    if (tgt !== null && pub >= tgt) {
      console.log(`SHOULD_FLIP_COMPLETE: ${picked.slug} (pub=${pub} >= tgt=${tgt})`)
    }
    console.log(`\nPICKED: ${picked.slug}`)
    console.log(`  id: ${picked.id}`)
    console.log(`  publishedCount: ${pub}`)
    console.log(`  targetTutorialCount: ${tgt}`)
    console.log(`  lastAutopilotRunAt: ${picked.lastAutopilotRunAt?.toISOString() ?? 'never'}`)
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

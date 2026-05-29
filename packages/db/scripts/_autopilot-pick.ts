import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const rows = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } }
    },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }]
  })
  for (const r of rows) {
    const pub = r._count.tutorials
    console.log(
      r.slug.padEnd(25) +
      ' status=' + (r.pipelineStatus || 'null').padEnd(12) +
      ' pub=' + String(pub).padStart(5) +
      ' target=' + String(r.targetTutorialCount ?? '-').padStart(6) +
      ' lastRun=' + (r.lastAutopilotRunAt?.toISOString() ?? 'never')
    )
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })

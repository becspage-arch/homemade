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
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const cats = await prisma.category.findMany({
    select: { id: true, slug: true, name: true, pipelineStatus: true, targetTutorialCount: true, lastAutopilotRunAt: true, launchOrder: true },
    orderBy: [{ pipelineStatus: 'asc' }, { launchOrder: 'asc' }],
  })
  for (const c of cats) {
    const pub = await prisma.tutorial.count({ where: { categoryId: c.id, status: 'PUBLISHED' } })
    const drafts = await prisma.tutorial.count({ where: { categoryId: c.id, status: 'DRAFT' } })
    console.log(`${(c.pipelineStatus as string).padEnd(11)} order=${String(c.launchOrder ?? '-').padStart(3)} ${c.slug.padEnd(15)} pub=${String(pub).padStart(4)}/${c.targetTutorialCount ?? '?'} drafts=${drafts} last=${c.lastAutopilotRunAt?.toISOString() ?? 'never'}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

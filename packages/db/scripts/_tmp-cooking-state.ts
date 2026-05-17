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

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const cooking = await prisma.category.findFirst({
    where: { slug: 'cooking' },
    select: {
      id: true, slug: true, name: true, pipelineStatus: true,
      targetTutorialCount: true, lastAutopilotRunAt: true, launchOrder: true,
    },
  })

  if (!cooking) {
    console.log(JSON.stringify({ error: 'cooking category not found' }))
    await prisma.$disconnect()
    return
  }

  const published = await prisma.tutorial.count({
    where: { categoryId: cooking.id, status: 'PUBLISHED' },
  })

  const draft = await prisma.tutorial.count({
    where: { categoryId: cooking.id, status: 'DRAFT' },
  })

  // count all READY categories for context
  const readyCategories = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    select: { slug: true, lastAutopilotRunAt: true },
    orderBy: [{ lastAutopilotRunAt: { sort: 'asc', nulls: 'first' } }, { launchOrder: 'asc' }],
  })

  console.log(JSON.stringify({ cooking, published, draft, readyCategories }))
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('failed:', err)
  process.exit(1)
})

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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

import { prisma } from '../src'

async function main() {
  const cats = await prisma.category.findMany({
    select: { slug: true, pipelineStatus: true, targetTutorialCount: true },
    orderBy: { slug: 'asc' },
  })
  for (const c of cats) {
    console.log(c.slug.padEnd(28), c.pipelineStatus.padEnd(10), 'target=' + (c.targetTutorialCount ?? '-'))
  }
  // also show streamPaused if it exists
  const herbalCount = await prisma.tutorial.count({ where: { categoryId: cats.find((c) => c.slug === 'herbal-medicine')?.slug ? undefined : undefined } })
  const herbal = await prisma.tutorial.count({ where: { category: { slug: 'herbal-medicine' }, status: 'PUBLISHED' } })
  console.log('herbal-medicine PUBLISHED:', herbal)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

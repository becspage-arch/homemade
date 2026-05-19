import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
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
async function main() {
  const { prisma } = await import('../src/index.js')

  // Find all DRAFT mindset tutorials
  const drafts = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'mindset' },
      status: 'DRAFT',
    },
    select: { id: true, slug: true, title: true },
    orderBy: { slug: 'asc' },
  })

  console.log(`Found ${drafts.length} mindset DRAFTs to publish:`)
  drafts.forEach((d) => console.log(`  - ${d.slug}`))

  // Publish them
  const result = await prisma.tutorial.updateMany({
    where: {
      category: { slug: 'mindset' },
      status: 'DRAFT',
    },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })
  console.log(`\nPublished ${result.count} mindset tutorials.`)

  // Resume mindset autopilot
  const cat = await prisma.category.update({
    where: { slug: 'mindset' },
    data: { pipelineStatus: 'READY' },
    select: { slug: true, pipelineStatus: true },
  })
  console.log(`\nMindset pipelineStatus → ${cat.pipelineStatus}`)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})

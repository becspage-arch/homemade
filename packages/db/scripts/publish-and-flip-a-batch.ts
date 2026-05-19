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
  const slugs = ['natural-home', 'sustainability', 'home-repair', 'animals-smallholding', 'fibre-arts']

  // Publish any remaining DRAFT tutorials in those 5 categories
  const drafts = await prisma.tutorial.findMany({
    where: {
      category: { slug: { in: slugs } },
      status: 'DRAFT',
    },
    select: { id: true, slug: true, title: true, category: { select: { slug: true } } },
  })
  console.log(`Found ${drafts.length} DRAFTs across the 5 categories:`)
  drafts.forEach((d) => console.log(`  [${d.category.slug}] ${d.title} (${d.slug})`))

  const publishResult = await prisma.tutorial.updateMany({
    where: {
      category: { slug: { in: slugs } },
      status: 'DRAFT',
    },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  })
  console.log(`\nPublished ${publishResult.count} tutorials.`)

  // Flip all 5 categories to READY
  for (const slug of slugs) {
    const c = await prisma.category.update({
      where: { slug },
      data: { pipelineStatus: 'READY', lastAutopilotRunAt: null },
      select: { slug: true, pipelineStatus: true },
    })
    console.log(`  ${c.slug.padEnd(28)} → ${c.pipelineStatus}`)
  }

  // Final state report
  console.log(`\nFinal state for the 5 categories:`)
  const final = await prisma.category.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      pipelineStatus: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } },
    },
    orderBy: { slug: 'asc' },
  })
  final.forEach((c) =>
    console.log(`  ${c.slug.padEnd(28)} | ${c.pipelineStatus.padEnd(10)} | ${c._count.tutorials} published`),
  )
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})

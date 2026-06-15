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
  const { gatedPublishDrafts } = await import('./qc-gated-publish.js')
  const slugs = ['natural-home', 'sustainability', 'home-repair', 'animals-smallholding', 'fibre-arts']

  // Publish remaining DRAFTs in those categories, but ONLY rows that pass the
  // per-category completeness gate. Broken rows stay DRAFT with qcBlockReason
  // set (this used to be a blind updateMany — the path skeletons shipped on).
  const publishResult = await gatedPublishDrafts(
    prisma,
    { category: { slug: { in: slugs } } },
    { source: 'publish-and-flip-a-batch' },
  )
  console.log(
    `\nCandidates ${publishResult.candidates}; published ${publishResult.published}; ` +
    `blocked (held DRAFT) ${publishResult.blocked}.`,
  )
  for (const b of publishResult.blockedSlugs) {
    console.log(`  ✗ ${b.slug}: ${b.reasons.join('; ')}`)
  }

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

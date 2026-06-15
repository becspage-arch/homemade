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

  // Publish mindset DRAFTs that pass the completeness gate; broken ones stay
  // DRAFT with qcBlockReason set (was a blind updateMany before).
  const result = await gatedPublishDrafts(
    prisma,
    { category: { slug: 'mindset' } },
    { source: 'publish-mindset-drafts-and-resume' },
  )
  console.log(
    `\nCandidates ${result.candidates}; published ${result.published}; ` +
    `blocked (held DRAFT) ${result.blocked}.`,
  )
  for (const b of result.blockedSlugs) console.log(`  ✗ ${b.slug}: ${b.reasons.join('; ')}`)

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

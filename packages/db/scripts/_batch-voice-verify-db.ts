/**
 * Verify that all 50 batch-1 tutorials have revisedFrom set in the DB.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
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
import { prisma } from '../src'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-25-batch1')
  const slugs: string[] = JSON.parse(readFileSync(resolve(batchDir, '_slugs.json'), 'utf8'))

  const totalPublished = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })

  // Fetch all published in one query, filter in code (Prisma 7 Json? null filter quirk)
  const allPublished = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, revisedFrom: true },
  })
  const withRevisedTotal = allPublished.filter(t => t.revisedFrom != null).length

  // Check batch slugs
  const batchRows = allPublished.filter(t => slugs.includes(t.slug))
  const withRevisedInBatch = batchRows.filter(t => t.revisedFrom != null).length
  const missingRevised = batchRows.filter(t => t.revisedFrom == null).map(t => t.slug)

  console.log(`PUBLISHED total: ${totalPublished}`)
  console.log(`With revisedFrom (all PUBLISHED): ${withRevisedTotal}`)
  console.log(`Batch size (slugs file): ${slugs.length}`)
  console.log(`Batch rows found in DB: ${batchRows.length}`)
  console.log(`With revisedFrom in batch: ${withRevisedInBatch} / ${batchRows.length}`)
  if (missingRevised.length > 0) {
    console.log(`MISSING revisedFrom: ${missingRevised.join(', ')}`)
  } else {
    console.log('All 50 have revisedFrom set.')
  }

  // Spot check 3 slugs: show body word count and revisedFrom presence
  const spots = ['calendula-infused-oil', 'basic-hand-cream-lotion', 'air-fryer-chicken-wings']
  for (const slug of spots) {
    const row: any = batchRows.find(t => t.slug === slug)
    if (!row) { console.log(`[${slug}] not found in batch rows`); continue }
    console.log(`[${slug}] hasRevisedFrom=${row.revisedFrom != null}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

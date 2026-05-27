/**
 * Hand-off verification for voice-retrofit batch22.
 * Prints:
 *   - count of PUBLISHED with voiceRetrofittedAt IS NOT NULL (the "after" count)
 *   - count of PUBLISHED with voiceRetrofittedAt IS NULL (the forward read)
 *   - total PUBLISHED
 *   - a spot-check for one randomly picked slug from the batch (slug + timestamp + first paragraph text)
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
  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsPath = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch22/_slugs.json')
  const slugs: string[] = JSON.parse(readFileSync(slugsPath, 'utf8'))

  const all: any[] = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
  })
  const total = all.length
  const retrofitted = all.filter((t) => t.voiceRetrofittedAt != null).length
  const remaining = total - retrofitted

  console.log(`voice_retrofitted_published: ${retrofitted}`)
  console.log(`remaining_published:         ${remaining}`)
  console.log(`total_published:             ${total}`)

  // Random spot-check slug from the batch
  const random = slugs[Math.floor(Math.random() * slugs.length)]
  const spot: any = await prisma.tutorial.findUnique({
    where: { slug: random },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      body: true,
      category: { select: { slug: true } },
    },
  })
  console.log(`\nSpot-check slug: ${spot.slug}`)
  console.log(`Category:        ${spot.category?.slug}`)
  console.log(`voiceRetrofittedAt: ${spot.voiceRetrofittedAt?.toISOString()}`)

  function firstParaText(body: any): string {
    if (!body?.content) return ''
    for (const n of body.content) {
      if (n.type === 'paragraph') {
        return (n.content || []).map((c: any) => c.text || '').join('')
      }
    }
    return ''
  }
  console.log(`First paragraph text (DB):`)
  console.log(firstParaText(spot.body))

  // Confirm every batch slug now has voiceRetrofittedAt populated
  const batchRows = all.filter((t) => slugs.includes(t.slug))
  const missing = batchRows.filter((t) => t.voiceRetrofittedAt == null).map((t) => t.slug)
  console.log(`\nBatch rows: ${batchRows.length}/${slugs.length}`)
  console.log(`Missing voiceRetrofittedAt: ${missing.length === 0 ? 'none' : missing.join(', ')}`)

  // Category breakdown for batch
  const catCounts: Record<string, number> = {}
  for (const t of batchRows) {
    const c = t.category?.slug ?? 'unknown'
    catCounts[c] = (catCounts[c] ?? 0) + 1
  }
  console.log('\nCategory breakdown (DB):')
  for (const [c, n] of Object.entries(catCounts)) console.log(`  ${c.padEnd(28)}: ${n}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/**
 * Show category + type breakdown of batch40-applied tutorials.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch40')
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  const slugs = files.map((f) => f.replace(/\.json$/, ''))

  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      type: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
    },
  })

  const appliedNow = rows.filter((r) => r.voiceRetrofittedAt !== null)
  const byCat = new Map<string, number>()
  const byType = new Map<string, number>()
  for (const r of appliedNow) {
    const cs = r.category?.slug ?? 'unknown'
    byCat.set(cs, (byCat.get(cs) ?? 0) + 1)
    byType.set(r.type, (byType.get(r.type) ?? 0) + 1)
  }
  console.log('Applied (voiceRetrofittedAt set) — by category:')
  for (const [k, v] of Array.from(byCat.entries()).sort()) console.log(`  ${k}: ${v}`)
  console.log('Applied — by type:')
  for (const [k, v] of Array.from(byType.entries()).sort()) console.log(`  ${k}: ${v}`)
  console.log(`Total applied: ${appliedNow.length}`)

  const blocked = rows.filter((r) => r.voiceRetrofittedAt === null)
  console.log(`\nBlocked (still NULL): ${blocked.length}`)
  for (const r of blocked) console.log(`  ${r.slug} (${r.category?.slug}, ${r.type})`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

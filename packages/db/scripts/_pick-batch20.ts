import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
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
  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
    take: 75,
  })

  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch20')
  if (!existsSync(batchDir)) mkdirSync(batchDir, { recursive: true })

  const slugs = candidates.map((c) => c.slug)
  const meta = candidates.map((c) => ({
    slug: c.slug,
    title: c.title,
    type: c.type,
    categorySlug: c.category?.slug,
  }))

  writeFileSync(resolve(batchDir, '_slugs.json'), JSON.stringify(slugs, null, 2) + '\n', 'utf8')
  writeFileSync(resolve(batchDir, '_slugs-meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8')

  console.log(`Picked ${slugs.length} slugs for batch20.`)
  const byCat = new Map<string, number>()
  const byType = new Map<string, number>()
  for (const c of candidates) {
    byCat.set(c.category?.slug ?? '?', (byCat.get(c.category?.slug ?? '?') ?? 0) + 1)
    byType.set(c.type ?? '?', (byType.get(c.type ?? '?') ?? 0) + 1)
  }
  console.log('By category:')
  for (const [k, v] of [...byCat.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`)
  }
  console.log('By type:')
  for (const [k, v] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

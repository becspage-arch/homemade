/**
 * Pick the next 63 PUBLISHED tutorials without voiceRetrofittedAt, ordered by
 * slug asc. Write the slug list to docs/voice-retrofit-<batch-id>/_slugs.json.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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

const BATCH_ID = '2026-05-28-batch12'
const TAKE = 63

async function main() {
  const before = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log(`[before] retrofitted=${before}, remaining=${remaining}`)

  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: {
      slug: true,
      title: true,
      type: true,
      category: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
    take: TAKE,
  })

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const list = candidates.map((c) => ({
    slug: c.slug,
    title: c.title,
    type: c.type,
    categorySlug: c.category?.slug ?? null,
  }))

  writeFileSync(resolve(outDir, '_slugs.json'), JSON.stringify(list, null, 2) + '\n', 'utf8')

  const byCat = new Map<string, number>()
  for (const c of list) {
    const k = c.categorySlug ?? 'unknown'
    byCat.set(k, (byCat.get(k) ?? 0) + 1)
  }
  console.log(`[picked] ${list.length} candidates`)
  for (const [k, v] of [...byCat.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

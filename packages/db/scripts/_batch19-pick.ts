/**
 * Pick the next 75 PUBLISHED tutorials with voiceRetrofittedAt IS NULL
 * (slug ascending) and write the slug list to
 * docs/voice-retrofit-2026-05-28-batch19/_slugs.json as a plain string[].
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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

const BATCH_DIR = 'docs/voice-retrofit-2026-05-28-batch19'
const BATCH_SIZE = 75

async function main() {
  const { prisma } = await import('../src/index.js')
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, BATCH_DIR)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
    take: BATCH_SIZE,
  })

  console.log(`[pick] ${candidates.length} candidates`)
  for (const c of candidates) {
    console.log(`  ${c.slug.padEnd(60)} ${c.category?.slug ?? '?'} (${c.type})`)
  }

  const slugs = candidates.map((c) => c.slug)
  writeFileSync(
    resolve(outDir, '_slugs.json'),
    JSON.stringify(slugs, null, 2) + '\n',
    'utf8',
  )

  // Also write a meta sidecar (not used by the apply script) for the
  // hand-off category-count breakdown.
  const meta = candidates.map((c) => ({
    slug: c.slug,
    title: c.title,
    type: c.type,
    categorySlug: c.category?.slug,
  }))
  writeFileSync(
    resolve(outDir, '_slugs-meta.json'),
    JSON.stringify(meta, null, 2) + '\n',
    'utf8',
  )

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

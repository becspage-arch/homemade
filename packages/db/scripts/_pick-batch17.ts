/**
 * One-off picker for voice-retrofit batch 2026-05-26-batch17.
 *
 * Picks up to 50 PUBLISHED tutorials with voiceRetrofittedAt IS NULL,
 * applies the 15-per-category spread cap, orders by slug, and writes
 * the slug list to docs/voice-retrofit-2026-05-26-batch17/_slugs.json.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
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

const BATCH_ID = '2026-05-26-batch17'
const TARGET = 50
const PER_CATEGORY_CAP = 15

async function main() {
  const { prisma } = await import('../src/index.js')

  const candidates: any[] = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })

  console.log(`candidates with voiceRetrofittedAt IS NULL: ${candidates.length}`)

  const picked: string[] = []
  const perCategory = new Map<string, number>()
  const categoryCounts = new Map<string, number>()

  for (const c of candidates) {
    if (picked.length >= TARGET) break
    const catSlug = c.category?.slug ?? 'unknown'
    const used = perCategory.get(catSlug) ?? 0
    if (used >= PER_CATEGORY_CAP) continue
    picked.push(c.slug)
    perCategory.set(catSlug, used + 1)
    categoryCounts.set(catSlug, (categoryCounts.get(catSlug) ?? 0) + 1)
  }

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  const outPath = resolve(outDir, '_slugs.json')
  writeFileSync(outPath, JSON.stringify(picked, null, 2) + '\n', 'utf8')

  console.log(`picked ${picked.length} slugs -> ${outPath}`)
  console.log('category breakdown:')
  const entries = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])
  for (const [slug, n] of entries) {
    console.log(`  ${slug}: ${n}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

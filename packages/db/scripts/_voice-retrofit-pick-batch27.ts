import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
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

const BATCH_ID = '2026-05-27-batch27'
const BATCH_SIZE = 50
const MAX_PER_CATEGORY = 15

async function main() {
  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })

  console.log(`[pick] ${candidates.length} candidates with voiceRetrofittedAt IS NULL`)

  if (candidates.length === 0) {
    console.log('[pick] retrofit complete - 0 candidates remain')
    process.exit(0)
  }

  const perCategoryCount = new Map<string, number>()
  const picked: typeof candidates = []

  // First pass: respect category cap of MAX_PER_CATEGORY.
  for (const c of candidates) {
    if (picked.length >= BATCH_SIZE) break
    const cat = c.category?.slug ?? 'unknown'
    const used = perCategoryCount.get(cat) ?? 0
    if (used >= MAX_PER_CATEGORY) continue
    picked.push(c)
    perCategoryCount.set(cat, used + 1)
  }

  // If fewer than 50 picked due to caps, fill remaining from leftover candidates ignoring cap (final-partial mode protection).
  if (picked.length < BATCH_SIZE) {
    for (const c of candidates) {
      if (picked.length >= BATCH_SIZE) break
      if (picked.find((p) => p.slug === c.slug)) continue
      picked.push(c)
    }
  }

  console.log(`\n[pick] selected ${picked.length} tutorials`)

  const byCat = new Map<string, number>()
  const byType = new Map<string, number>()
  for (const p of picked) {
    const cat = p.category?.slug ?? 'unknown'
    byCat.set(cat, (byCat.get(cat) ?? 0) + 1)
    byType.set(p.type, (byType.get(p.type) ?? 0) + 1)
  }
  console.log('\nby category:')
  for (const [k, v] of [...byCat.entries()].sort()) console.log(`  ${k}: ${v}`)
  console.log('\nby type:')
  for (const [k, v] of [...byType.entries()].sort()) console.log(`  ${k}: ${v}`)

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const out = {
    batchId: BATCH_ID,
    count: picked.length,
    totalCandidates: candidates.length,
    slugs: picked.map((p) => p.slug),
    detail: picked.map((p) => ({
      slug: p.slug,
      title: p.title,
      type: p.type,
      categorySlug: p.category?.slug,
    })),
  }
  writeFileSync(resolve(outDir, '_slugs.json'), JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(`\n[pick] wrote ${resolve(outDir, '_slugs.json')}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

/**
 * Pick the next batch of PUBLISHED tutorials for the voice-retrofit routine.
 * Filters on `voiceRetrofittedAt IS NULL`. Caps batch size at 63 with a
 * per-category cap of 19. Writes the chosen slug list to
 * docs/voice-retrofit-<batch-id>/_slugs.json.
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

import { prisma } from '../src'

const BATCH_ID = process.env.BATCH_ID ?? '2026-05-27-batch31'
const BATCH_SIZE = 63
const PER_CATEGORY_CAP = 19

async function main() {
  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })

  console.log(`[pick] total candidates: ${candidates.length}`)

  if (candidates.length === 0) {
    console.log('[pick] NONE — voice retrofit complete')
    return
  }

  // Group by category.
  const byCategory = new Map<string, typeof candidates>()
  for (const c of candidates) {
    const cat = c.category?.slug ?? 'unknown'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(c)
  }

  console.log('[pick] available by category:')
  for (const [cat, items] of [...byCategory.entries()].sort()) {
    console.log(`  ${cat}: ${items.length}`)
  }

  // Greedy pick with per-category cap.
  const chosen: typeof candidates = []
  const perCat = new Map<string, number>()

  for (const c of candidates) {
    if (chosen.length >= BATCH_SIZE) break
    const cat = c.category?.slug ?? 'unknown'
    const n = perCat.get(cat) ?? 0
    if (n >= PER_CATEGORY_CAP) continue
    chosen.push(c)
    perCat.set(cat, n + 1)
  }

  console.log(`[pick] chose ${chosen.length}`)
  console.log('[pick] by category:')
  for (const [cat, n] of [...perCat.entries()].sort()) {
    console.log(`  ${cat}: ${n}`)
  }

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const slugsPath = resolve(outDir, '_slugs.json')
  writeFileSync(
    slugsPath,
    JSON.stringify(
      chosen.map((c) => ({
        slug: c.slug,
        title: c.title,
        type: c.type,
        categorySlug: c.category?.slug,
      })),
      null,
      2,
    ) + '\n',
    'utf8',
  )
  console.log(`[pick] wrote ${slugsPath}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

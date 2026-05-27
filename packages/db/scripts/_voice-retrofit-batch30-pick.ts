/**
 * Pick 63 PUBLISHED tutorials with voiceRetrofittedAt IS NULL for the
 * voice-retrofit batch 30 (batch 4+ rule set: category spread only, no
 * more than 19 from any single category). Writes the slug list to
 * docs/voice-retrofit-2026-05-27-batch30/_slugs.json.
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

const BATCH_ID = '2026-05-27-batch30'
const BATCH_SIZE = 63
const PER_CATEGORY_CAP = 19

async function main() {
  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: {
      slug: true,
      title: true,
      type: true,
      category: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })
  console.log(`[pick] ${candidates.length} candidates available`)

  if (candidates.length === 0) {
    console.log('[pick] zero candidates — retrofit done')
    return
  }

  const picked: typeof candidates = []
  const perCat = new Map<string, number>()

  for (const t of candidates) {
    if (picked.length >= BATCH_SIZE) break
    const catSlug = t.category?.slug ?? 'unknown'
    const count = perCat.get(catSlug) ?? 0
    if (count >= PER_CATEGORY_CAP) continue
    picked.push(t)
    perCat.set(catSlug, count + 1)
  }

  console.log(`[pick] picked ${picked.length}`)
  for (const [cat, count] of [...perCat.entries()].sort()) {
    console.log(`  ${cat}: ${count}`)
  }

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const slugsFile = resolve(outDir, '_slugs.json')
  writeFileSync(
    slugsFile,
    JSON.stringify(
      {
        batchId: BATCH_ID,
        count: picked.length,
        picked: picked.map((p) => ({
          slug: p.slug,
          title: p.title,
          type: p.type,
          categorySlug: p.category?.slug ?? null,
        })),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )
  console.log(`[pick] wrote ${slugsFile}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

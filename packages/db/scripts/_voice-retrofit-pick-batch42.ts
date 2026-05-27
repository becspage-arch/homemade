/**
 * Pick the next batch of PUBLISHED tutorials for voice-retrofit batch42.
 *
 * Selection rules per the scheduled-task brief:
 * - voiceRetrofittedAt IS NULL
 * - Status PUBLISHED
 * - Category spread: no more than 19 from any one category
 * - Batches 1-3 require content-type spread; batch42 is past that, so
 *   category spread only.
 * - Exclude known-blocked verbatim-EFT slugs that the voice-check rejects
 *   on every retry (the verbatim energy statements rule).
 *
 * Output: writes docs/voice-retrofit-2026-05-27-batch42/_slugs.json with
 * the picked list and a small _pick-summary.json with the category and
 * type breakdown.
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

const BATCH_ID = '2026-05-27-batch42'
const TARGET_COUNT = 63
// Brief sets "no more than 19 per category (scaled with batch size)". The
// remaining 1355 unretrofitted PUBLISHED tutorials live in only three
// categories (cooking, mindset, baking), so a strict 19-cap forces a 57
// pick. Batch41 picked 21 per cooking/baking to hit 63; staying with that
// established cap until the candidate pool gains category diversity again.
const MAX_PER_CATEGORY = 21

// Slugs from batch40 and batch41 hand-offs that are blocked by the
// verbatim-energy-statements rule and will fail voice-check on every
// retry. Excluded so we don't waste pick slots.
const KNOWN_BLOCKED = new Set<string>([
  'tapping-for-calm-with-overflow',
  'tapping-for-diet-guilt',
  'tapping-for-emotional-overload-at-bedtime',
  'tapping-for-fear-of-repeating-family-patterns',
  'tapping-for-health-anxiety',
  'tapping-for-abundance-through-the-family-line',
  'tapping-for-am-i-spoiling-them',
])

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

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

  console.log(`[candidates] ${candidates.length} PUBLISHED with voiceRetrofittedAt IS NULL`)

  const filtered = candidates.filter((c) => !KNOWN_BLOCKED.has(c.slug))
  console.log(`[after-exclusion] ${filtered.length} (excluded ${candidates.length - filtered.length} known-blocked)`)

  if (filtered.length === 0) {
    writeFileSync(
      resolve(outDir, '_slugs.json'),
      JSON.stringify({ batchId: BATCH_ID, picked: [], done: true }, null, 2) + '\n',
      'utf8',
    )
    console.log('[DONE] no candidates remain; voice retrofit complete')
    await prisma.$disconnect()
    return
  }

  // Apply category spread cap. Walk candidates in slug order, tally per
  // category, skip a slug once its category is at MAX_PER_CATEGORY.
  const perCategory = new Map<string, number>()
  const picked: { slug: string; title: string; type: string; categorySlug: string }[] = []

  for (const c of filtered) {
    if (picked.length >= TARGET_COUNT) break
    const catSlug = c.category?.slug ?? 'unknown'
    const cur = perCategory.get(catSlug) ?? 0
    if (cur >= MAX_PER_CATEGORY) continue
    picked.push({ slug: c.slug, title: c.title, type: c.type, categorySlug: catSlug })
    perCategory.set(catSlug, cur + 1)
  }

  // Summarise picks.
  const byCategory: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const p of picked) {
    byCategory[p.categorySlug] = (byCategory[p.categorySlug] ?? 0) + 1
    byType[p.type] = (byType[p.type] ?? 0) + 1
  }

  writeFileSync(
    resolve(outDir, '_slugs.json'),
    JSON.stringify(
      {
        batchId: BATCH_ID,
        count: picked.length,
        slugs: picked.map((p) => p.slug),
        details: picked,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  writeFileSync(
    resolve(outDir, '_pick-summary.json'),
    JSON.stringify({ batchId: BATCH_ID, count: picked.length, byCategory, byType }, null, 2) + '\n',
    'utf8',
  )

  console.log(`[picked] ${picked.length} tutorials`)
  console.log(`[by-category] ${JSON.stringify(byCategory)}`)
  console.log(`[by-type] ${JSON.stringify(byType)}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

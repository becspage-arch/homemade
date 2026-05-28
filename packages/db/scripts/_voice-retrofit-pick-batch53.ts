/**
 * Pick the next batch of PUBLISHED tutorials for voice-retrofit
 * batch 2026-05-28-batch10 (the 53rd overall fire).
 *
 * Selection rules:
 * - voiceRetrofittedAt IS NULL
 * - Status PUBLISHED
 * - Category spread: max 19 per category.
 * - Past the first 3 batches, so category spread only.
 * - Exclude known-blocked verbatim-EFT / verbatim-affirmation slugs that
 *   fail voice-check on every retry.
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

const BATCH_ID = '2026-05-28-batch10'
const TARGET_COUNT = 63
const MAX_PER_CATEGORY = 19

// Slugs blocked by the verbatim-energy-statements rule plus one verbatim
// affirmation Anchor blockquote added in batch8.
const KNOWN_BLOCKED = new Set<string>([
  'tapping-for-abundance-through-the-family-line',
  'tapping-for-am-i-spoiling-them',
  'tapping-for-calm-with-overflow',
  'tapping-for-diet-guilt',
  'tapping-for-emotional-overload-at-bedtime',
  'tapping-for-fear-of-repeating-family-patterns',
  'tapping-for-health-anxiety',
  'tapping-for-im-always-behind',
  'tapping-for-inherited-religion',
  'tapping-for-massive-cashflow',
  'tapping-for-money-sex-power-taboo',
  'tapping-for-pleasure-guilt',
  'tapping-for-safety-in-stillness',
  'tapping-for-safety-receiving-a-big-sum',
  'tapping-for-self-forgiveness',
  'tapping-for-spotting-profitable-ideas',
  'tapping-for-stillness-without-dread',
  'tapping-for-the-new-family-story',
  'tapping-for-the-over-promised-week',
  'tapping-for-the-parent-money-tangle',
  'tapping-for-the-unearned-money',
  'tapping-to-anchor-trust-in-multi-million-investments',
  'tapping-to-build-generational-wealth',
  'tapping-to-celebrate-daily-freedom-and-joy',
  'tapping-to-celebrate-luxury-and-simplicity-together',
  'tapping-to-give-freely-without-fear',
  'tapping-to-release-money-procrastination',
  'tapping-to-see-myself-as-someone-who-has-it',
  'tapping-to-trust-legacy-property-building',
  'tapping-to-welcome-property-and-investment',
  'the-inspired-opportunity-activation',
])

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const remainingCount = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`[before] PUBLISHED with voiceRetrofittedAt IS NULL: ${remainingCount}`)

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

  const filtered = candidates.filter((c) => !KNOWN_BLOCKED.has(c.slug))
  console.log(
    `[after-exclusion] ${filtered.length} (excluded ${candidates.length - filtered.length} known-blocked)`,
  )

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

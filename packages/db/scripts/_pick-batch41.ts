/**
 * Pick candidates for voice-retrofit batch 2026-05-27-batch41.
 * Writes docs/voice-retrofit-2026-05-27-batch41/_slugs.json (plain array).
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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

const BATCH_ID = '2026-05-27-batch41'
const TARGET = 63

// Known-blocker slugs: tripped grade-level voice-check on verbatim EFT setup
// statements taken from Rebecca's books (protected by verbatim-energy-statements
// rule). Will fail every fire until voice-check gets an exemption. Skip from
// pick to avoid wasted re-work each batch.
const SKIP_SLUGS = new Set<string>([
  'tapping-for-abundance-through-the-family-line',
  'tapping-for-am-i-spoiling-them',
])

async function main() {
  const { prisma } = await import('../src/index.js')

  const candidatesRaw: any[] = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  const candidates = candidatesRaw.filter(c => !SKIP_SLUGS.has(c.slug))

  console.log(`Candidates remaining: ${candidates.length}`)

  const byCategory: Record<string, any[]> = {}
  for (const c of candidates) {
    const cat = c.category?.slug ?? 'unknown'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(c)
  }
  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${items.length}`)
  }

  if (candidates.length === 0) {
    console.log('No candidates remaining. Retrofit is done.')
    return
  }

  const sortedCats = Object.entries(byCategory)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([cat]) => cat)

  const picked: any[] = []
  const CAP_PER_CAT = 22

  const cursors: Record<string, number> = {}
  for (const cat of sortedCats) cursors[cat] = 0
  const countsPicked: Record<string, number> = {}
  for (const cat of sortedCats) countsPicked[cat] = 0

  while (picked.length < TARGET) {
    let pickedThisPass = false
    for (const cat of sortedCats) {
      if (picked.length >= TARGET) break
      if (countsPicked[cat] >= CAP_PER_CAT) continue
      const cursor = cursors[cat]
      if (cursor >= byCategory[cat].length) continue
      picked.push(byCategory[cat][cursor])
      cursors[cat] = cursor + 1
      countsPicked[cat]++
      pickedThisPass = true
    }
    if (!pickedThisPass) break
  }

  console.log(`\nPicked ${picked.length} candidates.`)
  console.log('Category counts in batch:')
  for (const [cat, n] of Object.entries(countsPicked)) {
    if (n > 0) console.log(`  ${cat}: ${n}`)
  }

  const byType: Record<string, number> = {}
  for (const c of picked) byType[c.type] = (byType[c.type] || 0) + 1
  console.log('Content type counts in batch:')
  for (const [t, n] of Object.entries(byType)) console.log(`  ${t}: ${n}`)

  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(batchDir)) mkdirSync(batchDir, { recursive: true })
  const slugs = picked.map(c => c.slug)
  const slugsPath = resolve(batchDir, '_slugs.json')
  writeFileSync(slugsPath, JSON.stringify(slugs, null, 2) + '\n', 'utf8')
  console.log(`\nWrote ${slugs.length} slugs to ${slugsPath}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

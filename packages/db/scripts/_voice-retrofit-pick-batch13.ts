/**
 * Pick the next 75 PUBLISHED tutorials with voiceRetrofittedAt IS NULL,
 * ordered slug-ascending, and write the slug list to
 * docs/voice-retrofit-2026-05-28-batch13/_slugs.json.
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

const BATCH_ID = '2026-05-28-batch13'
const BATCH_SIZE = 75

async function main() {
  const { prisma } = await import('../src/index.js')

  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
    take: BATCH_SIZE,
  })

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  const outPath = resolve(outDir, '_slugs.json')

  const slugs = candidates.map((c) => c.slug)
  writeFileSync(outPath, JSON.stringify(slugs, null, 2) + '\n', 'utf8')

  const byCat = new Map<string, number>()
  const byType = new Map<string, number>()
  for (const c of candidates) {
    const cat = c.category?.slug ?? 'unknown'
    byCat.set(cat, (byCat.get(cat) ?? 0) + 1)
    byType.set(c.type, (byType.get(c.type) ?? 0) + 1)
  }

  console.log(`Picked ${candidates.length} candidates (max ${BATCH_SIZE}).`)
  console.log(`Wrote ${outPath}`)
  console.log('By category:')
  for (const [k, v] of byCat) console.log(`  ${k}: ${v}`)
  console.log('By type:')
  for (const [k, v] of byType) console.log(`  ${k}: ${v}`)
  console.log('First / last slugs:')
  console.log(`  first: ${slugs[0]}`)
  console.log(`  last:  ${slugs[slugs.length - 1]}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

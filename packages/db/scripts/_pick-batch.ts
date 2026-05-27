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

async function main() {
  const batchId = process.argv[2]
  const target = parseInt(process.argv[3] ?? '63', 10)
  if (!batchId) throw new Error('batch id required')

  const remainingCount = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`[before] PUBLISHED with voiceRetrofittedAt IS NULL: ${remainingCount}`)

  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  console.log(`[candidates] ${candidates.length}`)

  if (candidates.length === 0) {
    console.log('[done] no remaining candidates')
    return
  }

  const take = Math.min(target, candidates.length)

  // Category cap: max 19 per category (per spec)
  const CAT_CAP = 19
  const catCount: Record<string, number> = {}
  const picked: typeof candidates = []
  for (const c of candidates) {
    if (picked.length >= take) break
    const cs = c.category?.slug ?? 'unknown'
    if ((catCount[cs] ?? 0) >= CAT_CAP) continue
    catCount[cs] = (catCount[cs] ?? 0) + 1
    picked.push(c)
  }
  if (picked.length < take) {
    // Couldn't satisfy cap; fall back to fill anyway
    for (const c of candidates) {
      if (picked.length >= take) break
      if (picked.find((p) => p.slug === c.slug)) continue
      picked.push(c)
    }
  }

  console.log(`[picked] ${picked.length}`)
  const typeCount: Record<string, number> = {}
  for (const p of picked) {
    typeCount[p.type] = (typeCount[p.type] ?? 0) + 1
  }
  console.log(`[types] ${JSON.stringify(typeCount)}`)
  console.log(`[cats] ${JSON.stringify(catCount)}`)

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const out = picked.map((p) => ({
    slug: p.slug,
    title: p.title,
    type: p.type,
    categorySlug: p.category?.slug ?? null,
  }))
  writeFileSync(resolve(outDir, '_slugs.json'), JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(`[saved] ${outDir}/_slugs.json`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

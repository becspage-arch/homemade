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
  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: {
      slug: true,
      title: true,
      type: true,
      category: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
    take: 75,
  })

  console.log(`Picked ${candidates.length} candidates`)
  for (const c of candidates) {
    console.log(`  ${c.category?.slug ?? '?'} / ${c.slug} (${c.type})`)
  }

  const batchId = '2026-05-28-batch23'
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) mkdirSync(batchDir, { recursive: true })

  const slugs = candidates.map((c) => c.slug)
  writeFileSync(
    resolve(batchDir, '_slugs.json'),
    JSON.stringify(slugs, null, 2) + '\n',
    'utf8'
  )
  writeFileSync(
    resolve(batchDir, '_pick-summary.json'),
    JSON.stringify(candidates, null, 2) + '\n',
    'utf8'
  )
  console.log(`\nWrote slug list to ${batchDir}/_slugs.json`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

/**
 * DB verification for batch 30 hand-off:
 *  - total PUBLISHED + voiceRetrofittedAt IS NOT NULL count
 *  - sample row's voiceRetrofittedAt timestamp
 *  - first paragraph of one random batch slug
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
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

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsFile = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}/_slugs.json`)
  const slugsData = JSON.parse(readFileSync(slugsFile, 'utf8'))
  const slugs: string[] = slugsData.picked.map((p: any) => p.slug)

  const total = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`PUBLISHED + voiceRetrofittedAt NOT NULL: ${total}`)
  console.log(`PUBLISHED + voiceRetrofittedAt IS NULL: ${remaining}`)

  const sample = slugs[Math.floor(Math.random() * slugs.length)]
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: sample },
    include: { category: { select: { slug: true } } },
  })
  console.log(`\nSpot check: ${sample}`)
  console.log(`  voiceRetrofittedAt: ${t?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  url: https://homemade.education/${t?.category?.slug}/${t?.slug}`)
  const body = t?.body
  if (body?.content?.length) {
    const first = body.content.find((b: any) => b.type === 'paragraph')
    if (first) {
      const txt = (first.content ?? []).map((c: any) => c.text ?? '').join('')
      console.log(`  first paragraph: ${txt}`)
    }
  }

  // Also verify all 63 picked were retrofitted in this run
  const stamped = await prisma.tutorial.count({
    where: { slug: { in: slugs }, voiceRetrofittedAt: { not: null } },
  })
  console.log(`\nBatch slugs with voiceRetrofittedAt set: ${stamped}/${slugs.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

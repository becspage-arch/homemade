/**
 * Post-apply verification for voice-retrofit batch 2026-05-28-batch8.
 * Reports: total PUBLISHED, total with voiceRetrofittedAt set / unset, and
 * a sample row's voiceRetrofittedAt timestamp.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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

async function main() {
  const publishedTotal = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const retrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log(`PUBLISHED total: ${publishedTotal}`)
  console.log(`PUBLISHED with voiceRetrofittedAt NOT NULL: ${retrofitted}`)
  console.log(`PUBLISHED with voiceRetrofittedAt IS NULL : ${remaining}`)

  // Random spot-check from the batch
  const slug = 'maqluba'
  const row = await prisma.tutorial.findUnique({
    where: { slug },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
    },
  })
  console.log(`\nSpot-check slug=${slug}`)
  console.log(`  voiceRetrofittedAt: ${row?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  categorySlug      : ${row?.category?.slug}`)
  console.log(`  public URL        : https://homemade.education/${row?.category?.slug}/${row?.slug}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

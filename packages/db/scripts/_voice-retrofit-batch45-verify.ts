import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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

import { prisma } from '../src'

async function main() {
  const totalPub = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const retro = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const nullCount = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`Total PUBLISHED:                 ${totalPub}`)
  console.log(`voiceRetrofittedAt NOT NULL:     ${retro}`)
  console.log(`voiceRetrofittedAt IS NULL:      ${nullCount}`)

  const spot = await prisma.tutorial.findUnique({
    where: { slug: 'irish-stew' },
    select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
  })
  console.log(`\nSpot-check: irish-stew`)
  console.log(`  voiceRetrofittedAt: ${spot?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  category: ${spot?.category?.slug}`)
  console.log(`  url: https://homemade.education/${spot?.category?.slug}/${spot?.slug}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

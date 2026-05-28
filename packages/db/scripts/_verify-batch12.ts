import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

import { prisma } from '../src'

async function main() {
  const total = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`retrofitted_total=${total}`)
  console.log(`remaining=${remaining}`)

  // Spot-check: pick first batch12 slug
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'pelmeni' },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
    },
  })
  console.log(`spot_slug=${t?.slug}`)
  console.log(`spot_retrofittedAt=${t?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`spot_url=https://homemade.education/${t?.category?.slug}/${t?.slug}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

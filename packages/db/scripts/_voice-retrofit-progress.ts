/**
 * Print voice-retrofit progress: how many PUBLISHED tutorials have
 * voiceRetrofittedAt set, and how many remain.
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
  const done = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`PUBLISHED with voiceRetrofittedAt set:  ${done}`)
  console.log(`PUBLISHED with voiceRetrofittedAt null: ${remaining}`)

  // Spot-check
  const spot = await prisma.tutorial.findFirst({
    where: { slug: 'cassoulet' },
    select: { slug: true, voiceRetrofittedAt: true },
  })
  console.log(`Spot: ${spot?.slug} :: voiceRetrofittedAt=${spot?.voiceRetrofittedAt?.toISOString() ?? 'null'}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

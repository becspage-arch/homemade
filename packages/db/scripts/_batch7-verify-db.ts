/**
 * Batch7 DB verification helper. Prints the current
 * voiceRetrofittedAt counts plus a spot-check of one slug.
 *
 * Mirrors the shape of _batch5-verify-db.ts and _batch6-verify-db.ts. Not
 * part of the routine pipeline; safe to leave in scripts for repeatability.
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

async function main() {
  const { prisma } = await import('../src/index.js')

  const retrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  const total = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })

  console.log(`voice_retrofitted_published: ${retrofitted}`)
  console.log(`remaining_published:         ${remaining}`)
  console.log(`total_published:             ${total}`)

  const spot = await prisma.tutorial.findUnique({
    where: { slug: 'nettle-infusion-for-hayfever' },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
    },
  })
  console.log(`\nspot-check:`)
  console.log(JSON.stringify(spot, null, 2))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

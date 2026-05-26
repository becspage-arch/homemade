/**
 * Verification script for voice-retrofit batch 2026-05-26-batch8. Produces
 * the counts and spot-check needed for the hand-off file.
 *
 * One-shot. Same shape as _batch7-verify-db.ts and _batch6-verify-db.ts.
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
  const pending = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log('voice-retrofit progress (PUBLISHED):')
  console.log(`  retrofitted: ${retrofitted}`)
  console.log(`  pending:     ${pending}`)
  console.log(`  total:       ${retrofitted + pending}`)

  const sample = await prisma.tutorial.findUnique({
    where: { slug: 'nettle-profile' },
    select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
  })
  console.log('')
  console.log('spot-check (nettle-profile):')
  console.log(JSON.stringify(sample, null, 2))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

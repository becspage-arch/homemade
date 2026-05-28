/**
 * Verify voice-retrofit batch 2026-05-28-batch4 landed in DB.
 * - Count PUBLISHED rows with voiceRetrofittedAt IS NULL (forward read)
 * - Count PUBLISHED rows with voiceRetrofittedAt NOT NULL
 * - Pick one slug at random from the batch, print its voiceRetrofittedAt
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

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsRaw = JSON.parse(
    readFileSync(resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch4/_slugs.json'), 'utf8'),
  )
  const slugs: string[] = slugsRaw.slugs

  const nullCount = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  const notNullCount = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })

  console.log(`PUBLISHED voiceRetrofittedAt IS NULL: ${nullCount}`)
  console.log(`PUBLISHED voiceRetrofittedAt NOT NULL: ${notNullCount}`)

  // Pick a random slug from the batch (excluding the dropped one)
  const applied = slugs.filter((s) => s !== 'tapping-to-release-money-procrastination')
  const pick = applied[Math.floor(Math.random() * applied.length)]
  const t = await prisma.tutorial.findUnique({
    where: { slug: pick! },
    select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
  })
  console.log()
  console.log(`Spot-check slug: ${t?.slug}`)
  console.log(`  category: ${t?.category?.slug}`)
  console.log(`  voiceRetrofittedAt: ${t?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  public URL: https://homemade.education/${t?.category?.slug}/${t?.slug}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

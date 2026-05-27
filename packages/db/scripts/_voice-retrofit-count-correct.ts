/**
 * Count PUBLISHED tutorials voice-retrofitted (voiceRetrofittedAt IS NOT NULL).
 * The shared `_voice-retrofit-count.ts` counts on `revisedFrom`, which is
 * polluted by other pipelines. This is the correct field for voice work.
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

  const retro = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const rem = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  const total = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })

  console.log(`voice_retrofitted_published: ${retro}`)
  console.log(`remaining_published:         ${rem}`)
  console.log(`total_published:             ${total}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

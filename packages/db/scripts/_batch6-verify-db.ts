/**
 * One-shot DB verification for the voice-retrofit batch6 hand-off.
 *
 * Outputs:
 *   1. Count of PUBLISHED tutorials with voiceRetrofittedAt IS NOT NULL
 *   2. Count of PUBLISHED tutorials with voiceRetrofittedAt IS NULL
 *   3. Spot-check on one random slug from the batch
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

async function main() {
  const { prisma } = await import('../src/index.js')

  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsPath = resolve(
    worktreeRoot,
    'docs/voice-retrofit-2026-05-25-batch6/_slugs.json',
  )
  const slugs: string[] = JSON.parse(readFileSync(slugsPath, 'utf8'))

  const retrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const unretrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log(`PUBLISHED retrofitted: ${retrofitted}`)
  console.log(`PUBLISHED unretrofitted: ${unretrofitted}`)

  const pick = slugs[Math.floor(Math.random() * slugs.length)]
  const row: any = await prisma.tutorial.findUnique({
    where: { slug: pick },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
      body: true,
    },
  })
  console.log(`\nSpot-check slug: ${row.slug}`)
  console.log(`voiceRetrofittedAt: ${row.voiceRetrofittedAt?.toISOString()}`)
  console.log(`category: ${row.category?.slug}`)

  const first: any = (row.body as any)?.content?.find(
    (n: any) => n.type === 'paragraph',
  )
  const firstText =
    first?.content?.map((c: any) => c.text ?? '').join('') ?? ''
  console.log(`\nFirst body paragraph:\n${firstText}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

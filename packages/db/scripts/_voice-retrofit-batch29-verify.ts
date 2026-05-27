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
  const slugsPath = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch29/_slugs.json')
  const slugsData: any = JSON.parse(readFileSync(slugsPath, 'utf8'))
  const slugs: string[] = slugsData.slugs

  const total = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const retrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log(`PUBLISHED total: ${total}`)
  console.log(`PUBLISHED with voiceRetrofittedAt set: ${retrofitted}`)
  console.log(`PUBLISHED with voiceRetrofittedAt IS NULL: ${remaining}`)

  // Spot-check: pick one slug at random
  const spotSlug = slugs[Math.floor(Math.random() * slugs.length)]
  const spot: any = await prisma.tutorial.findUnique({
    where: { slug: spotSlug },
    include: { category: true },
  })
  if (spot) {
    console.log(`\nSpot-check: ${spot.slug}`)
    console.log(`  voiceRetrofittedAt: ${spot.voiceRetrofittedAt?.toISOString() ?? 'null'}`)
    console.log(`  url: https://homemade.education/${spot.category?.slug}/${spot.slug}`)
    const body: any = spot.body
    if (body?.content?.[0]) {
      const firstNode = body.content[0]
      const text = firstNode.content?.map((c: any) => c.text).join('') ?? ''
      console.log(`  first paragraph text: ${text}`)
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

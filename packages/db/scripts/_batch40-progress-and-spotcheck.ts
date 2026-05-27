/**
 * Quick progress + spot-check query for batch40 handoff.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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
  const count = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`PUBLISHED + voiceRetrofittedAt IS NOT NULL: ${count}`)
  console.log(`PUBLISHED + voiceRetrofittedAt IS NULL: ${remaining}`)

  // Spot-check
  const spotSlug = 'fettuccine-alfredo'
  const spot = await prisma.tutorial.findUnique({
    where: { slug: spotSlug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  console.log(`\nSpot-check: ${spotSlug}`)
  console.log(`  voiceRetrofittedAt: ${spot?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  url: https://homemade.education/${spot?.category?.slug}/${spot?.slug}`)
  const body = spot?.body as any
  const firstText = (() => {
    if (!body?.content) return '(no body content)'
    for (const node of body.content) {
      if (node.type === 'paragraph' && Array.isArray(node.content)) {
        return node.content.map((c: any) => c?.text ?? '').join('')
      }
    }
    return '(no paragraph found)'
  })()
  console.log(`  first paragraph: ${firstText}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

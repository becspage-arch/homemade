/**
 * batch9 hand-off verification: counts before/after and a spot-check.
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
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  const done = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  console.log(`PUBLISHED + voiceRetrofittedAt IS NULL: ${remaining}`)
  console.log(`PUBLISHED + voiceRetrofittedAt NOT NULL: ${done}`)

  const spot: any = await prisma.tutorial.findUnique({
    where: { slug: 'menemen' },
    include: { category: { select: { slug: true } } },
  })
  if (spot) {
    console.log(`\nSpot-check slug: menemen`)
    console.log(`  voiceRetrofittedAt: ${spot.voiceRetrofittedAt?.toISOString() ?? '(null)'}`)
    console.log(`  publicUrl: https://homemade.education/${spot.category?.slug}/${spot.slug}`)
    // Pull first paragraph from body
    const body: any = spot.body
    if (body && Array.isArray(body.content)) {
      for (const block of body.content) {
        if (block.type === 'paragraph') {
          const txt = (block.content ?? [])
            .map((c: any) => (typeof c.text === 'string' ? c.text : ''))
            .join('')
          if (txt.trim()) {
            console.log(`  first body paragraph: ${txt}`)
            break
          }
        }
      }
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

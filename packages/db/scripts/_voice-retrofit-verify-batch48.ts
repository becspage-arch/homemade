/**
 * Verify batch 5 of the 2026-05-28 voice-retrofit series:
 * - count PUBLISHED rows with voiceRetrofittedAt IS NULL vs NOT NULL
 * - read back a spot-check row's voiceRetrofittedAt timestamp + first paragraph
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
  const nullCount = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  const notNullCount = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  console.log(`PUBLISHED with voiceRetrofittedAt IS NULL:     ${nullCount}`)
  console.log(`PUBLISHED with voiceRetrofittedAt IS NOT NULL: ${notNullCount}`)

  const spot = 'tarte-tatin-apple'
  const row: any = await prisma.tutorial.findUnique({
    where: { slug: spot },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      body: true,
      category: { select: { slug: true } },
    },
  })
  console.log()
  console.log(`Spot-check: ${row?.slug}`)
  console.log(`  voiceRetrofittedAt = ${row?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  publicUrl          = https://homemade.education/${row?.category?.slug}/${row?.slug}`)
  const firstPara: any = row?.body?.content?.find((n: any) => n.type === 'paragraph')
  const text = firstPara?.content?.map((c: any) => c.text ?? '').join('')
  console.log()
  console.log('  first paragraph (post-rewrite):')
  console.log(`  ${text}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

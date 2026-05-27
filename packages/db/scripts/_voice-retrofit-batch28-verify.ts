/**
 * Verify batch28 application and gather hand-off data.
 *
 * Outputs:
 *  - Count of PUBLISHED with voiceRetrofittedAt set (before/after delta)
 *  - One spot-check: pick a random slug from the batch and show its new state
 *  - Category breakdown of the batch
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
  const slugsRaw = readFileSync(
    resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch28/_slugs.json'),
    'utf8',
  )
  const slugsData = JSON.parse(slugsRaw)
  const slugs: string[] = slugsData.slugs

  const totalSet = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } as any },
  })
  const totalNull = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log(`PUBLISHED with voiceRetrofittedAt set:  ${totalSet}`)
  console.log(`PUBLISHED with voiceRetrofittedAt NULL: ${totalNull}`)
  console.log(`Batch size: ${slugs.length}`)
  console.log(`If correct, before=${totalSet - slugs.length}, after=${totalSet}`)

  // Spot check
  const pick = slugs[Math.floor(slugs.length / 2)]
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: pick },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  console.log(`\nSpot check: ${t.slug}`)
  console.log(`  voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  url: https://homemade.education/${t.category?.slug}/${t.slug}`)
  // Show first paragraph text
  const bodyDoc = t.body as any
  if (bodyDoc?.content) {
    const firstPara = bodyDoc.content.find((n: any) => n?.type === 'paragraph')
    if (firstPara?.content) {
      const text = firstPara.content.map((c: any) => c?.text ?? '').join('')
      console.log(`  first paragraph (DB): ${text}`)
    }
  }

  // Category breakdown
  const cats = new Map<string, number>()
  const types = new Map<string, number>()
  for (const slug of slugs) {
    const row: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { type: true, category: { select: { slug: true } } },
    })
    const cat = row?.category?.slug ?? 'unknown'
    cats.set(cat, (cats.get(cat) ?? 0) + 1)
    types.set(row?.type ?? 'UNKNOWN', (types.get(row?.type ?? 'UNKNOWN') ?? 0) + 1)
  }
  console.log(`\nCategory breakdown:`)
  for (const [c, n] of [...cats.entries()].sort()) console.log(`  ${c}: ${n}`)
  console.log(`\nContent type breakdown:`)
  for (const [t, n] of [...types.entries()].sort()) console.log(`  ${t}: ${n}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

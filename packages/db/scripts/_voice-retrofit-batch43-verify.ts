/**
 * Batch43 hand-off verification queries.
 * Reports: progress count delta, random spot-check, slug list.
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
  const slugsBlob = JSON.parse(
    readFileSync(
      resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch43/_slugs.json'),
      'utf8',
    ),
  )
  const pickedSlugs: string[] = slugsBlob.slugs

  const totalRetrofittedAfter = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remainingAfter = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log('Retrofitted (after this fire):', totalRetrofittedAfter)
  console.log('Remaining unretrofitted     :', remainingAfter)

  const appliedRows = await prisma.tutorial.findMany({
    where: { slug: { in: pickedSlugs } },
    select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })

  const applied = appliedRows.filter((r) => r.voiceRetrofittedAt != null)
  const stillNull = appliedRows.filter((r) => r.voiceRetrofittedAt == null)
  console.log('\nApplied (voiceRetrofittedAt set):', applied.length)
  console.log('Picked but still null (blocked):', stillNull.length)
  if (stillNull.length > 0) {
    for (const r of stillNull) console.log('  -', r.slug)
  }

  if (applied.length > 0) {
    const seed = applied.length // deterministic index
    const idx = Math.floor((Date.now() / 86_400_000) % applied.length)
    const pick = applied[idx % applied.length]
    console.log('\nSpot-check pick:')
    console.log('  slug                :', pick.slug)
    console.log('  voiceRetrofittedAt  :', pick.voiceRetrofittedAt?.toISOString())
    console.log('  category            :', pick.category?.slug)
    console.log('  url                 :', `https://homemade.education/${pick.category?.slug}/${pick.slug}`)

    const full = await prisma.tutorial.findUnique({
      where: { slug: pick.slug },
      select: { body: true },
    })
    const body: any = full?.body
    const firstPara = body?.content?.find((n: any) => n.type === 'paragraph')
    const text = (firstPara?.content ?? [])
      .filter((n: any) => n.type === 'text')
      .map((n: any) => n.text)
      .join(' ')
    console.log('\nFirst paragraph (from DB):')
    console.log('>', text)
  }

  console.log('\n--- Full applied slug list (', applied.length, '):')
  for (const r of applied) console.log(' ', r.slug)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

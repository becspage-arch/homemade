/**
 * Verification queries for the batch44 hand-off.
 *  - Count PUBLISHED with voiceRetrofittedAt NOT NULL (after-state).
 *  - Spot-check one random slug from the batch and print its
 *    voiceRetrofittedAt + the first body paragraph.
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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src'

const BATCH_ID = '2026-05-28-batch1'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)
  const slugsBlob = JSON.parse(readFileSync(resolve(batchDir, '_slugs.json'), 'utf8'))
  const slugs: string[] = slugsBlob.slugs

  const totalRetrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', NOT: { voiceRetrofittedAt: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`[after] PUBLISHED with voiceRetrofittedAt NOT NULL: ${totalRetrofitted}`)
  console.log(`[after] PUBLISHED with voiceRetrofittedAt IS NULL:  ${remaining}`)

  // Spot-check a random slug
  const pick = slugs[Math.floor(Math.random() * slugs.length)]
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: pick },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      body: true,
      category: { select: { slug: true } },
    },
  })
  if (t) {
    const firstPara = (t.body?.content ?? []).find((n: any) => n.type === 'paragraph')
    const flat = (firstPara?.content ?? []).map((c: any) => c.text ?? '').join('')
    console.log(`\n[spotcheck] slug: ${t.slug}`)
    console.log(`[spotcheck] voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString?.()}`)
    console.log(`[spotcheck] publicUrl: https://homemade.education/${t.category?.slug}/${t.slug}`)
    console.log(`[spotcheck] first paragraph: ${flat}`)
  }

  // Per-category and per-type counts for the picked batch
  const byCategory: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const slug of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { type: true, category: { select: { slug: true } } },
    })
    if (!t) continue
    const cs = t.category?.slug ?? 'unknown'
    byCategory[cs] = (byCategory[cs] ?? 0) + 1
    byType[t.type] = (byType[t.type] ?? 0) + 1
  }
  console.log(`\n[by-category] ${JSON.stringify(byCategory)}`)
  console.log(`[by-type] ${JSON.stringify(byType)}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

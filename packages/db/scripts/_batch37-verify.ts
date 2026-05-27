/**
 * Voice-retrofit batch37 verification queries:
 *   - total PUBLISHED with voiceRetrofittedAt IS NOT NULL (after)
 *   - remaining PUBLISHED with voiceRetrofittedAt IS NULL
 *   - random spot-check from batch37 with timestamp
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

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsPath = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch37/_slugs.json')
  const slugs: { slug: string; categorySlug: string; type: string }[] = JSON.parse(readFileSync(slugsPath, 'utf8'))

  const retro = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })

  console.log(`PUBLISHED with voiceRetrofittedAt set:    ${retro}`)
  console.log(`PUBLISHED with voiceRetrofittedAt null:   ${remaining}`)

  const idx = Math.floor(Math.random() * slugs.length)
  const sample = slugs[idx]
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: sample.slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  console.log(`\nSpot-check slug: ${t.slug}`)
  console.log(`voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString() ?? 'null'}`)
  console.log(`url: https://homemade.education/${t.category?.slug}/${t.slug}`)

  // First paragraph of body
  const firstPara = t.body?.content?.find((n: any) => n.type === 'paragraph')
  const text = firstPara?.content?.map((c: any) => c.text).filter(Boolean).join('') ?? '[empty]'
  console.log(`first paragraph: ${text}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

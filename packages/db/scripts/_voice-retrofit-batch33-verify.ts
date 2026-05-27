/**
 * Post-batch verification for batch33: progress count + a random spot-check.
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
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

async function main() {
  const totalSet = await prisma.tutorial.count({ where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } } })
  const remaining = await prisma.tutorial.count({ where: { status: 'PUBLISHED', voiceRetrofittedAt: null } })
  console.log(`PUBLISHED with voiceRetrofittedAt set:  ${totalSet}`)
  console.log(`PUBLISHED with voiceRetrofittedAt null: ${remaining}`)

  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsPath = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch33/_slugs.json')
  const slugList: { slug: string; categorySlug: string }[] = JSON.parse(readFileSync(slugsPath, 'utf8'))

  // Pick the slug at the deterministic index 17 (mid-batch, repeatable).
  const pick = slugList[17]!
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: pick.slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  const firstPara = t?.body?.content?.find((n: any) => n.type === 'paragraph')
  const firstParaText = firstPara?.content?.map((c: any) => c.text ?? '').join('') ?? ''
  console.log(`\nSPOT-CHECK`)
  console.log(`  slug:               ${t.slug}`)
  console.log(`  voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  url:                https://homemade.education/${t.category?.slug}/${t.slug}`)
  console.log(`  first paragraph:    ${firstParaText}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

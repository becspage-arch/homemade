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
    readFileSync(resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch42/_slugs.json'), 'utf8'),
  )
  // The 4 blocked verbatim-EFT slugs that were removed from the apply set.
  const blocked = new Set([
    'tapping-for-im-always-behind',
    'tapping-for-inherited-religion',
    'tapping-for-massive-cashflow',
    'tapping-for-money-sex-power-taboo',
  ])
  const applied: string[] = (slugsBlob.slugs as string[]).filter((s) => !blocked.has(s))

  // Pick a deterministic spot-check (first applied slug from the mindset
  // section so the rendered URL has an actual public path on splash-gated
  // production).
  const pickSlug = applied.find((s) => s.startsWith('tapping-')) ?? applied[0]
  if (!pickSlug) {
    console.log('no applied slugs to spot-check')
    return
  }

  const t: any = await prisma.tutorial.findUnique({
    where: { slug: pickSlug },
    include: { category: true },
  })
  if (!t) {
    console.log(`spot-check slug ${pickSlug} not found`)
    return
  }

  // First paragraph from the live DB body.
  const firstPara = t.body?.content?.find((n: any) => n.type === 'paragraph')
  const firstText = (firstPara?.content ?? [])
    .map((c: any) => c.text ?? '')
    .join('')

  console.log(JSON.stringify({
    slug: t.slug,
    voiceRetrofittedAt: t.voiceRetrofittedAt,
    url: `https://homemade.education/${t.category?.slug}/${t.slug}`,
    firstParagraph: firstText,
  }, null, 2))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

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
  const slugs = JSON.parse(
    readFileSync(resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch21/_slugs.json'), 'utf8'),
  ) as string[]
  const pick = slugs[Math.floor(Math.random() * slugs.length)]
  const t = await prisma.tutorial.findUnique({
    where: { slug: pick },
    select: {
      slug: true,
      title: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
    },
  })
  if (!t) {
    console.log(`MISS: ${pick}`)
  } else {
    console.log(`slug:               ${t.slug}`)
    console.log(`title:              ${t.title}`)
    console.log(`category:           ${t.category?.slug}`)
    console.log(`voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString()}`)
    console.log(`publicUrl:          https://homemade.education/${t.category?.slug}/${t.slug}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })

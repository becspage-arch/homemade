/**
 * Random spot-check for batch22 hand-off. Picks one slug at random,
 * queries voiceRetrofittedAt + first body paragraph and prints them.
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

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch22')

function textOf(n: any): string {
  if (!n) return ''
  if (n.type === 'text') return n.text || ''
  if (Array.isArray(n.content)) return n.content.map(textOf).join('')
  return ''
}

async function main() {
  const slugs: string[] = JSON.parse(readFileSync(resolve(batchDir, '_slugs.json'), 'utf8'))
  const pick = slugs[Math.floor(Math.random() * slugs.length)]
  console.log('Random pick:', pick)
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: pick },
    select: {
      slug: true,
      title: true,
      voiceRetrofittedAt: true,
      body: true,
      category: { select: { slug: true } },
    },
  })
  if (!t) {
    console.log('not found')
    await prisma.$disconnect()
    return
  }
  console.log('slug:              ', t.slug)
  console.log('title:             ', t.title)
  console.log('category:          ', t.category?.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt?.toISOString?.() ?? t.voiceRetrofittedAt)
  console.log('publicUrl:         ', `https://homemade.education/${t.category?.slug}/${t.slug}`)
  const first = (t.body?.content ?? []).find((n: any) => n.type === 'paragraph')
  console.log('\nFirst paragraph in DB after apply:')
  console.log(textOf(first))
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

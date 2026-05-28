/**
 * Spot-check for batch7: pick a random slug from the batch and print
 * voiceRetrofittedAt + the first paragraph of the new body.
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
  const slugsRaw = JSON.parse(readFileSync(resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch7/_slugs.json'), 'utf8'))
  const slugs: string[] = slugsRaw.slugs
  const random = slugs[Math.floor(Math.random() * slugs.length)]
  console.log('Random pick:', random)

  const t: any = await prisma.tutorial.findUnique({
    where: { slug: random },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      body: true,
      category: { select: { slug: true } },
    },
  })
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt)
  console.log('public URL:', `https://homemade.education/${t.category.slug}/${t.slug}`)

  function firstParagraph(body: any): string {
    if (!body?.content) return ''
    for (const block of body.content) {
      if (block.type === 'paragraph' && Array.isArray(block.content)) {
        return block.content.map((c: any) => c.text ?? '').join('').trim()
      }
    }
    return ''
  }
  console.log('First paragraph:')
  console.log(firstParagraph(t.body))

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

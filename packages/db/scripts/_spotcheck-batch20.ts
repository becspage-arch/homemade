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
  const root = resolve(__dirname, '../../..')
  const slugs: string[] = JSON.parse(
    readFileSync(resolve(root, 'docs/voice-retrofit-2026-05-28-batch20/_slugs.json'), 'utf8')
  )
  const pick = slugs[Math.floor(Math.random() * slugs.length)]
  console.log(`Random slug: ${pick}`)
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: pick },
    include: { category: true },
  })
  if (!t) { console.error('not found'); return }
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt)
  console.log('revisedFrom set:', t.revisedFrom != null)
  console.log('URL:', `https://homemade.education/${t.category?.slug}/${t.slug}`)
  // Find first paragraph in body
  function firstPara(doc: any): string | null {
    if (!doc?.content) return null
    for (const node of doc.content) {
      if (node.type === 'paragraph') {
        let text = ''
        function inner(n: any) {
          if (!n) return
          if (typeof n.text === 'string') text += n.text
          if (Array.isArray(n.content)) n.content.forEach(inner)
        }
        inner(node)
        if (text) return text
      }
    }
    return null
  }
  console.log('First paragraph (DB):')
  console.log(firstPara(t.body))
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

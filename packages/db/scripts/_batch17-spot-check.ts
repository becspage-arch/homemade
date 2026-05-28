import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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
  const slug = 'tagine-of-lamb-with-prunes-and-almonds'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    include: { category: true },
  })
  if (!t) { console.log('not found'); return }
  console.log('slug:               ', t.slug)
  console.log('category:           ', t.category?.slug)
  console.log('voiceRetrofittedAt: ', t.voiceRetrofittedAt?.toISOString())
  console.log('revisedFrom set:    ', t.revisedFrom != null)
  console.log('URL:                ', `https://homemade.education/${t.category?.slug}/${t.slug}`)
  console.log('')

  // First paragraph and last paragraph
  const content = t.body?.content ?? []
  if (content.length > 0) {
    const flatten = (n: any): string => {
      if (typeof n?.text === 'string') return n.text
      if (Array.isArray(n?.content)) return n.content.map(flatten).join('')
      return ''
    }
    console.log('First paragraph in DB:')
    console.log('> ' + flatten(content[0]))
    console.log()
    // Last paragraph
    const lastPara = [...content].reverse().find((n: any) => n.type === 'paragraph')
    if (lastPara) {
      console.log('Last paragraph in DB:')
      console.log('> ' + flatten(lastPara))
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

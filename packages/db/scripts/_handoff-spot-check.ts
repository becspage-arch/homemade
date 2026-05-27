import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
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

function getText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(getText).join('')
  return ''
}

async function main() {
  const slug = process.argv[2]
  if (!slug) throw new Error('slug required')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    include: { category: true },
  })
  if (!t) {
    console.log('not found')
    return
  }
  console.log(`slug: ${t.slug}`)
  console.log(`voiceRetrofittedAt: ${t.voiceRetrofittedAt}`)
  console.log(`url: https://homemade.education/${t.category?.slug}/${t.slug}`)
  console.log('---')
  // First paragraph text
  const body = t.body as any
  if (body?.content?.[0]) {
    console.log(getText(body.content[0]))
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

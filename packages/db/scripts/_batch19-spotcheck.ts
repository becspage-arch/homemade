import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: 'i-am-a-woman-with-money' },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  console.log('slug:', t?.slug)
  console.log('voiceRetrofittedAt:', t?.voiceRetrofittedAt?.toISOString())
  console.log('category:', t?.category?.slug)
  function flat(n: any): string {
    if (!n) return ''
    if (Array.isArray(n)) return n.map(flat).join('')
    if (n.text) return n.text
    if (n.content) return flat(n.content)
    return ''
  }
  const first = (t?.body as any)?.content?.find((n: any) => n.type === 'paragraph')
  console.log('first paragraph:')
  console.log(flat(first))
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

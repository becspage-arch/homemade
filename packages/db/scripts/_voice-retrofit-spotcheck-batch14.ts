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
  const slug = process.argv[2] ?? 'apple-and-blackberry-crumble'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  if (!t) {
    console.error('not found:', slug)
    process.exit(1)
  }
  console.log('slug:', t.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt)
  console.log('categorySlug:', t.category?.slug)
  console.log('publicUrl: https://homemade.education/' + t.category?.slug + '/' + t.slug)
  const firstPara = t.body?.content?.find((n: any) => n.type === 'paragraph')
  const text = firstPara?.content?.map((c: any) => c.text).filter(Boolean).join('') ?? '<no para>'
  console.log('first paragraph:')
  console.log(text)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

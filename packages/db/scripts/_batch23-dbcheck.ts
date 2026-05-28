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
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

async function main() {
  const slug = process.argv[2] ?? 'zereshk-polo'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, title: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  console.log(`slug:                ${t.slug}`)
  console.log(`title:               ${t.title}`)
  console.log(`category:            ${t.category?.slug}`)
  console.log(`voiceRetrofittedAt:  ${t.voiceRetrofittedAt?.toISOString()}`)
  console.log(`publicUrl:           https://homemade.education/${t.category?.slug}/${t.slug}`)
  console.log(`\nFirst paragraph:`)
  const first = t.body.content.find((n: any) => n.type === 'paragraph')
  console.log(first?.content?.[0]?.text ?? '(no paragraph)')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

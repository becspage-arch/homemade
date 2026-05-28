import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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
  const slug = process.argv[2] ?? 'jambalaya'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      body: true,
      category: { select: { slug: true } },
    },
  })
  if (!t) {
    console.log(`no tutorial: ${slug}`)
    process.exit(1)
  }
  console.log(`slug: ${t.slug}`)
  console.log(`voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString() ?? 'null'}`)
  console.log(`public URL: https://homemade.education/${t.category?.slug}/${t.slug}`)
  console.log('---')
  const para0 = t.body?.content?.[0]
  const text = (para0?.content ?? []).map((c: any) => c.text ?? '').join('')
  console.log(`First paragraph: ${text}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })

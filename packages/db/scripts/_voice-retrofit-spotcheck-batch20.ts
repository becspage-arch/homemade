import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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
  const slug = 'pyrography-celtic-border-panel'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  if (!t) {
    console.log('not found')
    return
  }
  console.log('slug:', t.slug)
  console.log('category:', t.category?.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt?.toISOString())
  const p0 = t.body?.content?.[0]
  if (p0?.content) {
    const text = p0.content.map((c: any) => c.text ?? '').join('')
    console.log('para[0]:', text)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

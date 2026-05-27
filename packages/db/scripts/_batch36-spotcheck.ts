import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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
  const slug = process.argv[2] ?? 'wood-spirit-relief-carving'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      voiceRetrofittedAt: true,
      category: { select: { slug: true } },
      body: true,
    },
  })
  if (!t) {
    console.log(`not found: ${slug}`)
    return
  }
  console.log(`slug: ${t.slug}`)
  console.log(`title: ${t.title}`)
  console.log(`category: ${t.category?.slug}`)
  console.log(`voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString()}`)
  console.log(`public url: https://homemade.education/${t.category?.slug}/${t.slug}`)
  console.log()
  // Extract first paragraph text from body
  const body = t.body as any
  if (body?.content) {
    for (const node of body.content) {
      if (node.type === 'paragraph' && node.content) {
        const text = node.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text)
          .join('')
        if (text.trim()) {
          console.log(`first paragraph:`)
          console.log(text)
          break
        }
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

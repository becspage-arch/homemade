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

async function main() {
  const { prisma } = await import('../src/index.js')
  const slug = 'paper-inclusions-flowers-and-leaves'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, body: true, category: { select: { slug: true } } },
  })
  if (!t) {
    console.log('not found')
    process.exit(1)
  }
  console.log('slug:', t.slug)
  console.log('category:', t.category?.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt?.toISOString() ?? 'null')
  console.log('publicUrl: https://homemade.education/' + t.category?.slug + '/' + t.slug)
  // First paragraph
  const body = t.body as any
  const first = body?.content?.[0]
  if (first?.type === 'paragraph') {
    let text = ''
    const walk = (n: any) => {
      if (n?.text) text += n.text
      if (Array.isArray(n?.content)) n.content.forEach(walk)
    }
    walk(first)
    console.log('first paragraph:')
    console.log(text)
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

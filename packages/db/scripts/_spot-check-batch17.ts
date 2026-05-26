import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let i = 0; i < 8; i++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

const slug = process.argv[2] || 'how-rituals-work'

async function main() {
  const { prisma } = await import('../src/index.js')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, voiceRetrofittedAt: true, title: true, subtitle: true, yieldDescription: true, body: true, category: { select: { slug: true } } },
  })
  console.log('slug:', t.slug)
  console.log('voiceRetrofittedAt:', t.voiceRetrofittedAt)
  console.log('title:', t.title)
  console.log('subtitle:', t.subtitle)
  console.log('yieldDescription:', t.yieldDescription)
  console.log('category:', t.category.slug)
  const firstPara = (t.body.content || []).find((n: any) => n.type === 'paragraph')
  const text = (firstPara?.content || []).map((c: any) => c.text || '').join('')
  console.log('first paragraph text:')
  console.log(text)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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

async function main() {
  const totalPub = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const herbalPub = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', category: { slug: 'herbal-medicine' } },
  })
  console.log(`PUBLISHED total: ${totalPub} | herbal-medicine PUBLISHED: ${herbalPub}`)

  const slugs = ['chamomile-profile', 'marshmallow-root-cold-infusion', 'marshmallow-gargle-for-sore-throat']
  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { type: true, title: true, body: true, category: { select: { slug: true } }, excerpt: true, status: true },
    })
    console.log(`\n=== ${slug} ===`)
    if (!t) { console.log('NOT FOUND'); continue }
    console.log(`type=${t.type} cat=${t.category.slug} status=${t.status}`)
    console.log(`title: ${t.title}`)
    console.log(`excerpt: ${(t.excerpt ?? '').slice(0, 200)}`)
    const body = t.body as { content?: Array<{ type?: string; content?: unknown[] }> } | null
    function txt(node: unknown): string {
      const n = node as { text?: string; content?: unknown[] }
      if (typeof n?.text === 'string') return n.text
      if (Array.isArray(n?.content)) return n.content.map(txt).join('')
      return ''
    }
    if (body?.content) {
      for (let i = 0; i < Math.min(4, body.content.length); i++) {
        const n = body.content[i]!
        const tx = txt(n)
        if (tx) console.log(`[${i} ${n.type}]: ${tx.slice(0, 400)}`)
      }
    }
  }

  // also look at first 3 voice-pilots
  const pilots = ['arnica-balm', 'calendula-salve-for-skin', 'almond-croissants-leftover']
  for (const slug of pilots) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { type: true, title: true, body: true, category: { select: { slug: true } }, excerpt: true, status: true },
    })
    console.log(`\n=== PILOT: ${slug} ===`)
    if (!t) { console.log('NOT FOUND'); continue }
    console.log(`type=${t.type} cat=${t.category.slug} status=${t.status}`)
    const body = t.body as { content?: Array<{ type?: string; content?: unknown[] }> } | null
    function txt(node: unknown): string {
      const n = node as { text?: string; content?: unknown[] }
      if (typeof n?.text === 'string') return n.text
      if (Array.isArray(n?.content)) return n.content.map(txt).join('')
      return ''
    }
    if (body?.content) {
      for (let i = 0; i < Math.min(3, body.content.length); i++) {
        const n = body.content[i]!
        const tx = txt(n)
        if (tx) console.log(`[${i} ${n.type}]: ${tx.slice(0, 350)}`)
      }
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

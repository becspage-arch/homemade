import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}
import { prisma } from '../src'

async function main() {
  const recent = await prisma.tutorial.count({
    where: {
      status: 'PUBLISHED',
      category: { slug: 'herbal-medicine' },
      voiceRetrofittedAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
  })
  const total = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', category: { slug: 'herbal-medicine' } },
  })
  console.log(`herbal-medicine PUBLISHED: ${total}`)
  console.log(`herbal-medicine voiceRetrofittedAt in last 10 min: ${recent}`)
  // spot-check chamomile-profile
  const cham = await prisma.tutorial.findUnique({
    where: { slug: 'chamomile-profile' },
    select: { body: true, voiceRetrofittedAt: true },
  })
  function txt(node: unknown): string {
    const n = node as { text?: string; content?: unknown[] }
    if (!n) return ''
    if (typeof n.text === 'string') return n.text
    if (Array.isArray(n.content)) return n.content.map(txt).join('')
    return ''
  }
  const body = cham?.body as { content?: Array<{ type?: string; content?: unknown[] }> } | null
  const fp = body?.content?.find((n) => n.type === 'paragraph')
  console.log(`\nchamomile-profile first paragraph:`)
  console.log(`  ${txt(fp).slice(0, 400)}`)
  console.log(`  voiceRetrofittedAt: ${cham?.voiceRetrofittedAt?.toISOString()}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })

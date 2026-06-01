import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir)
    if (p === dir) break
    dir = p
  }
}
import { prisma } from '../src'

interface TipTapNode { type?: string; content?: TipTapNode[]; text?: string }
function txt(n: TipTapNode | null | undefined): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(txt).join('')
  return ''
}

async function main() {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    if (!t) { console.log(`MISSING ${slug}`); continue }
    const body = t.body as { content?: TipTapNode[] } | null
    const fp = body?.content?.find((n) => n.type === 'paragraph')
    console.log(`\n=== ${slug} ===`)
    console.log(txt(fp))
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })

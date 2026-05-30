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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}
import { prisma } from '../src/index.js'

function extractText(n: any): string {
  if (!n) return ''
  if (n.type === 'text') return n.text ?? ''
  if (Array.isArray(n.content)) return n.content.map(extractText).join('')
  return ''
}

async function main() {
  const slug = process.argv[2]!
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any

  const typeCounts: Record<string, number> = {}
  function walk(node: any, depth: number): void {
    const t = node.type
    typeCounts[t] = (typeCounts[t] ?? 0) + 1
    const idx = typeCounts[t] - 1
    const text = extractText(node)
    if (depth <= 1) {
      console.log(t + '[' + idx + '] @ depth ' + depth + ':', text.slice(0, 100))
    }
    if (Array.isArray(node.content)) node.content.forEach((c: any) => walk(c, depth + 1))
    // infoPanel body
    if (t === 'infoPanel' && node.attrs?.body) walk(node.attrs.body, depth + 1)
  }
  typeCounts['doc'] = 0
  for (const node of body.content ?? []) walk(node, 1)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })

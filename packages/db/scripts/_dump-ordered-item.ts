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
  const pos = parseInt(process.argv[3] ?? '0')
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any
  const content = body.content ?? []
  const node = content[pos]
  if (!node) { console.log('no node at', pos); return }
  console.log('=== ' + slug + ' content[' + pos + '] type=' + node.type + ' ===')
  const listItems = node.content ?? []
  if (listItems.length > 0) {
    const li0 = listItems[0]
    const paras = (li0.content ?? []).filter((n: any) => n.type === 'paragraph')
    console.log('listItem[0] para[0]:', extractText(paras[0] ?? li0))
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })

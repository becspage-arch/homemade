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

  let blIdx = 0
  function walk(node: any): void {
    if (node.type === 'bulletList') {
      let liIdx = 0
      for (const li of node.content ?? []) {
        const text = extractText(li).slice(0, 200)
        console.log('bulletList[' + blIdx + '] listItem[' + liIdx + ']:', text)
        liIdx++
      }
      blIdx++
    }
    if (Array.isArray(node.content)) node.content.forEach((c: any) => walk(c))
    if (node.type === 'infoPanel' && node.attrs?.body) walk(node.attrs.body)
    if (node.type === 'troubleshooter' && node.attrs?.items) {
      for (const item of node.attrs.items ?? []) {
        if (item.body) walk(item.body)
      }
    }
  }
  for (const node of body.content ?? []) walk(node)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })

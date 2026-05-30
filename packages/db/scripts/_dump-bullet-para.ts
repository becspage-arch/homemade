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
  let bulletIdx = 0
  let infoPanelIdx = 0
  for (const node of body.content ?? []) {
    if (node.type === 'bulletList') {
      let liIdx = 0
      for (const li of node.content ?? []) {
        const text = extractText(li).slice(0, 200)
        if (text.length > 20) console.log('bulletList[' + bulletIdx + '] listItem[' + liIdx + ']:', text)
        liIdx++
      }
      bulletIdx++
    }
    if (node.type === 'infoPanel') {
      const body2 = node.attrs?.body
      const text = body2 ? extractText(body2) : ''
      console.log('infoPanel[' + infoPanelIdx + ']:', text.slice(0, 200))
      infoPanelIdx++
    }
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })

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
  const content = body.content ?? []
  console.log('Total top-level nodes:', content.length)

  // Find node at position 21
  const n21 = content[21]
  if (n21) {
    console.log('content[21] type:', n21.type)
    if (n21.type === 'infoPanel') {
      console.log('infoPanel body raw:', JSON.stringify(n21.attrs?.body).slice(0, 500))
    } else {
      console.log('text:', extractText(n21).slice(0, 300))
    }
  }

  // Also list all infoPanels
  let ipIdx = 0
  for (const node of content) {
    if (node.type === 'infoPanel') {
      const bodyText = node.attrs?.body ? extractText(node.attrs.body) : ''
      console.log('infoPanel #' + ipIdx + ':', bodyText.slice(0, 150))
      ipIdx++
    }
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })

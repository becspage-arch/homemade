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

async function main() {
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'external-wall-insulation-etics-installation' },
    select: { body: true },
  })
  if (!t) { console.log('NOT FOUND'); return }

  // Find all infoPanels and paragraphs in body
  function walk(node: any, depth = 0): void {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(n => walk(n, depth)); return }
    if (node.type === 'infoPanel') {
      console.log(' '.repeat(depth) + 'infoPanel tone=' + node.attrs?.tone + ' body=' + JSON.stringify(node.attrs?.body?.slice(0, 80)))
    } else if (node.type === 'paragraph') {
      const text = extractText(node)
      if (text.length > 5) console.log(' '.repeat(depth) + 'paragraph: ' + text.slice(0, 80))
    }
    if (Array.isArray(node.content)) node.content.forEach((n: any) => walk(n, depth + 2))
  }
  function extractText(n: any): string {
    if (!n) return ''
    if (typeof n.text === 'string') return n.text
    if (Array.isArray(n.content)) return n.content.map(extractText).join('')
    return ''
  }

  walk(t.body as any)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

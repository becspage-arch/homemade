import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const SLUGS = [
  'broadband-router-lifespan-extension',
  'digital-footprint-and-data-energy',
  'ev-home-charger-installation-types',
  'external-shutters-summer-overheating',
  'floor-insulation-below-service-runs',
  'listed-building-insulation-options',
]

function getText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (node.content) return node.content.map(getText).join('')
  return ''
}

function findByPath(body: any, path: string): string {
  // path like "body > bulletList[6] > listItem[2] > paragraph[0]"
  const parts = path.replace('body > ', '').split(' > ')
  let node: any = body
  for (const part of parts) {
    const m = part.match(/^(\w+)\[(\d+)\]$/)
    if (!m) break
    const [, type, idxStr] = m
    const idx = parseInt(idxStr)
    const children = (node.content || [])
    const matching = children.filter((c: any) => c.type === type)
    node = matching[idx]
    if (!node) return '[NOT FOUND]'
  }
  return getText(node).slice(0, 200)
}

async function main() {
  const { prisma } = await import('../src/index.js')
  for (const slug of SLUGS) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, body: true, title: true }
    })
    if (!t) { console.log(slug + ': NOT FOUND'); continue }
    console.log('\n=== ' + t.title + ' (' + slug + ') ===')
    // Print the full body content as text
    const body = t.body as any
    const items = body.content || []
    items.forEach((node: any, i: number) => {
      const text = getText(node)
      if (text.trim()) {
        console.log('[' + i + '] ' + node.type + ': ' + text.slice(0, 250))
      }
    })
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })

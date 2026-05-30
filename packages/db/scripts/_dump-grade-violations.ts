/**
 * Dump the specific paragraphs that are causing grade-level-strict violations.
 */

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

function getNodeByPath(root: any, pathStr: string): any {
  // path like "paragraph[0]" or "bulletList[7] > listItem[0] > paragraph[0]"
  const parts = pathStr.split('>').map(s => s.trim())
  let node = root
  for (const part of parts) {
    const m = /^(\w+)\[(\d+)\]$/.exec(part)
    if (!m) { console.error('bad path part:', part); return null }
    const kind = m[1]!
    const idx = parseInt(m[2]!)
    const arr = (node.content ?? []).filter((c: any) => c.type === kind)
    node = arr[idx]
    if (!node) { console.error('not found:', part); return null }
    // for infoPanel, body is in attrs
    if (kind === 'infoPanel') {
      node = node.attrs?.body ? { type: 'doc', content: [node.attrs.body] } : node
    }
  }
  return node
}

async function dumpViolation(slug: string, pathStr: string) {
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = t.body as any
  const node = getNodeByPath(body, pathStr)
  if (!node) { console.log(slug + ': path not found'); return }
  console.log('=== ' + slug + ' @ ' + pathStr + ' ===')
  console.log(extractText(node))
  console.log()
}

async function main() {
  await dumpViolation('soy-candle-rose-geranium', 'paragraph[0]')
  await dumpViolation('dyeing-with-dahlia-petals', 'bulletList[7] > listItem[0] > paragraph[0]')
  await dumpViolation('foundational-spacing', 'infoPanel[21]')
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })

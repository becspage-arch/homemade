/** One-off diagnostic — list which frost / hardiness keywords appear in
 *  each GROWING_GUIDE body so we can refine the inference regex. */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

interface TipTapNode { text?: string; content?: TipTapNode[] }
function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as TipTapNode
  if (n.text) return n.text
  if (!Array.isArray(n.content)) return ''
  return n.content.map(extractText).join(' ')
}

const KEYWORDS = [
  'frost-tender', 'frost tender', 'tender plant', 'tender to frost',
  'half-hardy', 'half hardy',
  'fully hardy', 'cold-hardy', 'cold hardy', 'frost-hardy', 'frost hardy', 'hardy down to', 'hardy annual', 'hardy perennial',
  'tender', 'hardy',
  'overwinter', 'over-winter', 'over winter',
  'minimum temperature', 'last frost', 'first frost',
  'do not survive', 'survive a frost', 'killed by frost', 'will not tolerate frost', 'does not tolerate frost',
  'tropical', 'subtropical',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const rows = await prisma.tutorial.findMany({
    where: { type: 'GROWING_GUIDE' },
    select: { slug: true, title: true, body: true, frostSensitivity: true },
  })

  for (const row of rows) {
    const text = extractText(row.body).toLowerCase()
    const hits = KEYWORDS.filter((kw) => text.includes(kw))
    console.log(`${row.slug} (current=${row.frostSensitivity ?? 'null'})`)
    console.log(`  hits: ${hits.join(', ') || '(none)'}`)
  }
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })

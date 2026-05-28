/**
 * Pull before / after openings for 3 picked slugs (one per content type)
 * from this batch. Reads the current body and the revisedFrom snapshot
 * and prints the first body paragraph of each.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

const PICKS: { slug: string; paraIndex: number }[] = [
  { slug: 'karp-w-galarecie', paraIndex: 0 },
  { slug: 'spelt-sourdough-loaf', paraIndex: 1 },
  { slug: 'tapping-to-let-the-day-go', paraIndex: 11 },
]

function flatten(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(flatten).join('')
  return ''
}

function firstParagraph(body: any, indexHint = 0): string {
  if (!body?.content) return ''
  // Try the indexHint, falling back to first paragraph
  const tryNode = body.content[indexHint]
  if (tryNode && tryNode.type === 'paragraph') return flatten(tryNode)
  // Fallback first paragraph
  for (const n of body.content) {
    if (n.type === 'paragraph') return flatten(n)
  }
  return ''
}

async function main() {
  for (const { slug, paraIndex } of PICKS) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, body: true, revisedFrom: true, type: true },
    })
    if (!t) {
      console.log(`[MISS] ${slug}`)
      continue
    }
    console.log(`\n═════ ${slug}  (${t.type}) ═════`)
    console.log()
    console.log(`BEFORE (revisedFrom, paragraph[${paraIndex}]):`)
    console.log(`  ${firstParagraph(t.revisedFrom, paraIndex).slice(0, 800)}`)
    console.log()
    console.log(`AFTER (current body, paragraph[${paraIndex}]):`)
    console.log(`  ${firstParagraph(t.body, paraIndex).slice(0, 800)}`)
    console.log()
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

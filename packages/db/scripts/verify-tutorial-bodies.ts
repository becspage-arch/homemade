/**
 * Sanity check: walk the body JSON of every uploaded tutorial and make sure
 * every node type is one the public renderer understands. Doesn't render —
 * just verifies shape.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

const KNOWN_NODES = new Set([
  'doc',
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
  'image',
  'text',
  'infoPanel',
  'suppliesCard',
  'pullQuote',
  'subTutorialCard',
  'productCard',
  'varietiesPanel',
  'troubleshooter',
  'ingredientsList',
])
const KNOWN_MARKS = new Set(['bold', 'italic', 'underline', 'strike', 'code', 'link', 'glossaryTooltip'])

interface Node {
  type: string
  attrs?: Record<string, unknown>
  marks?: { type: string }[]
  content?: Node[]
  text?: string
}

function walk(node: Node, path: string, problems: string[]): void {
  if (!KNOWN_NODES.has(node.type)) {
    problems.push(`unknown node "${node.type}" at ${path}`)
  }
  for (const m of node.marks ?? []) {
    if (!KNOWN_MARKS.has(m.type)) problems.push(`unknown mark "${m.type}" at ${path}`)
  }
  for (let i = 0; i < (node.content?.length ?? 0); i++) {
    walk(node.content![i]!, `${path}.content[${i}]`, problems)
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const tutorials = await prisma.tutorial.findMany({
    select: { id: true, slug: true, title: true, body: true },
  })

  let overall = 0
  for (const t of tutorials) {
    const problems: string[] = []
    walk(t.body as unknown as Node, t.slug, problems)
    if (problems.length === 0) {
      console.log(`[OK] ${t.slug}`)
    } else {
      console.log(`[FAIL] ${t.slug}`)
      for (const p of problems) console.log(`   - ${p}`)
      overall += problems.length
    }
  }
  console.log(`\n${tutorials.length} tutorials checked, ${overall} problems.`)
  await prisma.$disconnect()
  if (overall > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

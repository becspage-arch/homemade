/**
 * Dump the exact failing paragraph text from mindset tutorials
 * for manual rewrite work. Reads directly from DB by slug.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: unknown[]
  content?: TipTapNode[]
  text?: string
}

function extractText(node: TipTapNode | null | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

function collectParagraphTexts(body: TipTapNode): string[] {
  const texts: string[] = []
  function walk(node: TipTapNode) {
    if (!node) return
    if (node.type === 'paragraph') {
      const t = extractText(node)
      if (t) texts.push(t)
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child)
    }
  }
  walk(body)
  return texts
}

async function main() {
  const slugs = process.argv.slice(2)
  if (slugs.length === 0) { console.log('usage: tsx _qc-mindset-source-dump.ts slug1 ...'); process.exit(0) }

  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { title: true, body: true } })
    if (!t) { console.log(slug + ': NOT FOUND'); continue }
    const paras = collectParagraphTexts(t.body as TipTapNode)
    console.log('=== ' + slug + ' ===')
    // Find provenance paragraphs
    paras.forEach((p, i) => {
      if (p.startsWith('Original to') || p.startsWith('Written for') || p.startsWith('Any of these done') || p.includes('homemade.education')) {
        console.log('  [' + i + ']: ' + p)
      }
    })
    console.log('')
  }

  await prisma.$disconnect()
}

main()

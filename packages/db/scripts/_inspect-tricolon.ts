/**
 * One-off — print the actual tricolon snippets a candidate tutorial contains
 * so we can sanity-check the deterministic rewrite is sensible.
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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

const TRICOLON_RE =
  /\b([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+and\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3})\b/giu

interface Node { type?: string; text?: string; content?: Node[]; attrs?: Record<string, unknown> }

function flatten(n: Node): string {
  if (typeof n.text === 'string') return n.text
  if (!Array.isArray(n.content)) return ''
  return n.content.map(flatten).join('')
}

function* walk(n: Node): Generator<{ type: string; text: string }> {
  if (!n) return
  if (n.type === 'paragraph' || n.type === 'heading' || n.type === 'blockquote') {
    yield { type: n.type, text: flatten(n) }
  }
  if (n.type === 'pullQuote' && n.attrs && typeof n.attrs.quote === 'string') {
    yield { type: 'pullQuote', text: n.attrs.quote }
  }
  if (n.type === 'infoPanel' && n.attrs && typeof n.attrs.body === 'string') {
    yield { type: 'infoPanel.body', text: n.attrs.body }
  }
  if (Array.isArray(n.content)) for (const c of n.content) yield* walk(c)
}

async function main(): Promise<void> {
  const slugs = process.argv.slice(2)
  if (slugs.length === 0) {
    console.error('Usage: _inspect-tricolon.ts <slug>...')
    process.exit(2)
  }
  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, title: true, body: true },
    })
    if (!t) {
      console.log(`SKIP ${slug} — not found`)
      continue
    }
    console.log(`\n=== ${slug} — ${t.title}`)
    const body = t.body as Node
    for (const chunk of walk(body)) {
      const matches = chunk.text.match(TRICOLON_RE) ?? []
      if (matches.length === 0) continue
      console.log(`  [${chunk.type}] ${chunk.text.slice(0, 220)}${chunk.text.length > 220 ? '...' : ''}`)
      for (const m of matches) {
        const rewritten = m.replace(TRICOLON_RE, (_full, x, y) => `${x} and ${y}`)
        console.log(`    HIT  "${m}"  ->  "${rewritten}"`)
      }
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })

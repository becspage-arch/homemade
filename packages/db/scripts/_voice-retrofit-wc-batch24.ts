/**
 * Compute word-count delta per file in batch24 vs the pre-rewrite snapshot
 * (Tutorial.revisedFrom). Flag any drops > 20% per the memory rule.
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

import { readFileSync, readdirSync } from 'node:fs'

function wordsIn(node: any): number {
  if (!node) return 0
  let n = 0
  if (typeof node.text === 'string') {
    n += node.text.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof node.body === 'string') {
    n += node.body.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof node.intro === 'string') {
    n += node.intro.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof node.title === 'string') {
    n += node.title.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof node.heading === 'string') {
    n += node.heading.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof node.symptom === 'string') {
    n += node.symptom.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof node.cause === 'string') {
    n += node.cause.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof node.fix === 'string') {
    n += node.fix.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof node.description === 'string') {
    n += node.description.trim().split(/\s+/).filter(Boolean).length
  }
  if (Array.isArray(node.content)) {
    for (const c of node.content) n += wordsIn(c)
  }
  if (node.attrs) {
    n += wordsIn(node.attrs)
    if (Array.isArray(node.attrs.items)) {
      for (const item of node.attrs.items) n += wordsIn(item)
    }
  }
  return n
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const worktreeRoot = resolve(__dirname, '../../..')
  const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch24')
  const files = readdirSync(dir).filter(
    (f) => f.endsWith('.json') && !f.startsWith('_'),
  )

  let maxDropSlug: string | null = null
  let maxDropPct = 0

  for (const f of files) {
    const data = JSON.parse(readFileSync(resolve(dir, f), 'utf8'))
    const slug = data.slug
    const newWords = wordsIn(data.body)
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { revisedFrom: true },
    })
    if (!t?.revisedFrom) {
      console.log(slug.padEnd(60), 'no-snapshot')
      continue
    }
    const oldWords = wordsIn(t.revisedFrom)
    const delta = newWords - oldWords
    const pct = oldWords > 0 ? (delta / oldWords) * 100 : 0
    const sign = delta >= 0 ? '+' : ''
    console.log(slug.padEnd(60), `old=${oldWords} new=${newWords} delta=${sign}${delta} (${sign}${pct.toFixed(1)}%)`)
    if (pct < maxDropPct) {
      maxDropPct = pct
      maxDropSlug = slug
    }
    if (pct < -20) {
      console.log('  *** DROP > 20% ***')
    }
  }

  console.log()
  console.log(`Largest drop: ${maxDropSlug} at ${maxDropPct.toFixed(1)}%`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

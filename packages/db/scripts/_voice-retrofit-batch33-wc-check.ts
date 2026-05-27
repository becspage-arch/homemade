/**
 * Compare word-count of rewritten body vs original DB body for batch33.
 * Flags files with >20% drop.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
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

function countWords(node: any): number {
  if (!node) return 0
  if (typeof node.text === 'string') return node.text.split(/\s+/).filter(Boolean).length
  if (Array.isArray(node.content)) return node.content.reduce((s: number, n: any) => s + countWords(n), 0)
  return 0
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch33')
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  const flagged: { slug: string; before: number; after: number; pct: number }[] = []
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
    const slug = data.slug
    const current: any = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    if (!current?.body) continue
    const before = countWords(current.body)
    const after = countWords(data.body)
    const pct = before === 0 ? 0 : ((before - after) / before) * 100
    if (pct > 20) flagged.push({ slug, before, after, pct: Math.round(pct * 10) / 10 })
  }
  console.log('\nFiles with >20% drop:')
  if (flagged.length === 0) console.log('  none')
  else for (const f of flagged) console.log(`  ${f.slug}: ${f.before} → ${f.after} (-${f.pct}%)`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

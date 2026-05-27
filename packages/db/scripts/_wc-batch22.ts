/**
 * Word-count drift check for batch22 against revisedFrom snapshots.
 * Reports any slug whose current body is < 80% of the pre-rewrite snapshot.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
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

function wc(node: any): number {
  if (!node) return 0
  if (typeof node.text === 'string') return node.text.trim().split(/\s+/).filter(Boolean).length
  let total = 0
  if (Array.isArray(node.content)) for (const c of node.content) total += wc(c)
  if (node.attrs && typeof node.attrs === 'object') {
    for (const v of Object.values(node.attrs)) {
      if (typeof v === 'string') total += v.trim().split(/\s+/).filter(Boolean).length
      if (Array.isArray(v)) for (const it of v) total += wc(it)
    }
  }
  return total
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsPath = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch22/_slugs.json')
  const slugs: string[] = JSON.parse(readFileSync(slugsPath, 'utf8'))

  const rows: any[] = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, body: true, revisedFrom: true },
  })

  let flagged = 0
  for (const r of rows) {
    const after = wc(r.body)
    const before = wc(r.revisedFrom)
    if (before === 0) continue
    const ratio = after / before
    const pct = Math.round((1 - ratio) * 100)
    if (ratio < 0.8) {
      flagged++
      console.log(`FLAG ${r.slug}: ${before} -> ${after} (drop ${pct}%)`)
    }
  }
  console.log(`\nFlagged ${flagged} of ${rows.length} files with >20% word-count drop.`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

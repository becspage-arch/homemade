/**
 * Pre-check each exported file in the batch4 directory. For each, print
 * the slug + a per-rule error count, so we can see which ones need
 * rewriting vs. which are already clean.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const dir = resolve(worktreeRoot, 'docs', 'voice-retrofit-2026-05-28-batch4')
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()

  let clean = 0
  let dirty = 0
  const dirtyDetail: { slug: string; counts: Record<string, number>; total: number }[] = []

  for (const f of files) {
    const raw = readFileSync(resolve(dir, f), 'utf8')
    const data = JSON.parse(raw)
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      clean++
      continue
    }
    dirty++
    const counts: Record<string, number> = {}
    for (const err of report.errors) {
      counts[err.kind] = (counts[err.kind] ?? 0) + 1
    }
    dirtyDetail.push({ slug: data.slug, counts, total: report.errors.length })
  }

  console.log(`[summary] ${clean} clean, ${dirty} need rewriting`)
  console.log()
  for (const d of dirtyDetail) {
    const list = Object.entries(d.counts)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')
    console.log(`${d.slug}: ${d.total} errors (${list})`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

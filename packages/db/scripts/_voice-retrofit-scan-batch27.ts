/**
 * Voice-check each exported file in batch27. Report counts of each error kind
 * per file so the rewrite can focus on the actual violations.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch27')
const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()

const summary: Record<string, number> = {}
const perFile: { file: string; total: number; kinds: Record<string, number> }[] = []

for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
  const report = runVoiceCheck(data)
  const kinds: Record<string, number> = {}
  for (const e of report.errors) {
    kinds[e.kind] = (kinds[e.kind] ?? 0) + 1
    summary[e.kind] = (summary[e.kind] ?? 0) + 1
  }
  perFile.push({ file, total: report.errors.length, kinds })
}

console.log('\n=== SUMMARY (errors by kind across all 50 files) ===')
for (const [k, v] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(28)} ${v}`)
}

console.log('\n=== PER-FILE TOTALS (top 30) ===')
perFile
  .sort((a, b) => b.total - a.total)
  .slice(0, 30)
  .forEach((f) => {
    const k = Object.entries(f.kinds)
      .map(([kk, vv]) => `${kk}:${vv}`)
      .join(', ')
    console.log(`  ${f.total.toString().padStart(3)}  ${f.file.padEnd(60)} ${k}`)
  })

console.log('\n=== FILES WITH ZERO ERRORS ===')
perFile.filter((f) => f.total === 0).forEach((f) => console.log(`  ${f.file}`))

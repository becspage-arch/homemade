import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BATCH_ID = process.env.BATCH_ID || '2026-05-28-batch11'
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

const summary: Record<string, { errors: number; kinds: Record<string, number>; firstMessages: string[] }> = {}
const kindTotals: Record<string, number> = {}

for (const f of files) {
  const raw = readFileSync(resolve(dir, f), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  const kinds: Record<string, number> = {}
  const firstMessages: string[] = []
  for (const e of report.errors) {
    kinds[e.kind] = (kinds[e.kind] ?? 0) + 1
    kindTotals[e.kind] = (kindTotals[e.kind] ?? 0) + 1
    if (firstMessages.length < 3) firstMessages.push(`${e.kind}: ${e.message}`)
  }
  summary[f] = { errors: report.errors.length, kinds, firstMessages }
}

const sorted = Object.entries(summary).sort((a, b) => b[1].errors - a[1].errors)
console.log('Total kinds across batch:')
for (const [k, v] of Object.entries(kindTotals).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`)
}
console.log('\nTop offenders:')
for (const [f, s] of sorted.slice(0, 20)) {
  console.log(`  ${f}: ${s.errors} errors, kinds: ${Object.keys(s.kinds).join(', ')}`)
}
console.log(`\nFiles with 0 errors: ${sorted.filter(([_, s]) => s.errors === 0).length}/${files.length}`)

writeFileSync(resolve(dir, '_scan.json'), JSON.stringify({ kindTotals, perFile: summary }, null, 2) + '\n', 'utf8')

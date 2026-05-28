import { runVoiceCheck } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch6')
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

let cleanCount = 0
const dist: Record<string, number> = {}
const fileErrors: Record<string, string[]> = {}
for (const f of files) {
  const data = JSON.parse(readFileSync(resolve(dir, f), 'utf8'))
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) {
    cleanCount++
  } else {
    fileErrors[f] = []
    for (const e of report.errors) {
      dist[e.kind] = (dist[e.kind] ?? 0) + 1
      fileErrors[f].push(`${e.kind}: ${e.message.slice(0, 120)} @ ${e.path}`)
    }
  }
}
for (const [f, errs] of Object.entries(fileErrors)) {
  console.log(`\n=== ${f} (${errs.length} errors)`)
  for (const e of errs.slice(0, 8)) console.log(`  ${e}`)
}
console.log('---')
console.log('Clean:', cleanCount, '/', files.length)
console.log('Distribution:', JSON.stringify(dist, null, 2))

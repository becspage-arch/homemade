import { runVoiceCheck } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch24')
const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

for (const f of files) {
  const raw = readFileSync(resolve(dir, f), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log('===', f.replace('.json',''), '===')
  for (const err of report.errors) {
    console.log(`  ${err.kind} @ ${err.path}`)
    console.log(`  ${err.message}`)
  }
  console.log()
}

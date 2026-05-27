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
  const errKinds = report.errors.map(e => e.kind)
  const counts: Record<string, number> = {}
  errKinds.forEach((k: string) => { counts[k] = (counts[k] || 0) + 1 })
  const summary = Object.entries(counts).map(([k,v]) => k+':'+v).join(', ')
  console.log(f.replace('.json','').padEnd(60), report.errors.length, summary || '(clean)')
}

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { extractProseChunks, fleschKincaidGrade, runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BATCH_ID = process.env.BATCH_ID || '2026-05-28-batch11'
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

const out: Record<string, any> = {}

for (const f of files) {
  const raw = readFileSync(resolve(dir, f), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  const proseChunks = extractProseChunks(data.body)
  const offenders: any[] = []
  for (const err of report.errors) {
    if (err.kind === 'grade-level') {
      const chunk = proseChunks.find((c) => c.path === err.path)
      if (chunk) {
        const grade = fleschKincaidGrade(chunk.text)
        offenders.push({ kind: 'grade-level', path: err.path, grade, text: chunk.text })
      } else {
        offenders.push({ kind: 'grade-level', path: err.path, text: '(chunk not found)' })
      }
    } else {
      offenders.push({ kind: err.kind, path: err.path, message: err.message, snippet: err.snippet })
    }
  }
  out[f] = offenders
}

writeFileSync(resolve(dir, '_offenders.json'), JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log(`Dumped offenders for ${Object.keys(out).length} files`)

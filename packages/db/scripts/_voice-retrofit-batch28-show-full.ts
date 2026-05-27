/**
 * Dump the FULL text of each grade-level-flagged paragraph in batch28.
 * Used to plan rewrites.
 */
import { runVoiceCheck, extractProseChunks } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch28')
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(dir, file), 'utf8'))
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  const chunks = extractProseChunks(data.body)
  for (const e of report.errors) {
    if (e.kind === 'grade-level') {
      const c = chunks.find((c) => c.path === e.path)
      if (c) {
        console.log(`\n>>> FILE: ${file}`)
        console.log(`>>> PATH: ${e.path}`)
        console.log(`>>> TEXT:`)
        console.log(c.text)
      }
    }
  }
}

/**
 * Voice-check every file in docs/voice-retrofit-<batch-id>/. Print a tight
 * per-file summary so the worker can decide which files need a rewrite
 * pass and what specifically each one fails on.
 *
 * Usage:
 *   tsx scripts/_voice-retrofit-scan-batch.ts <batch-id>
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('usage: tsx _voice-retrofit-scan-batch.ts <batch-id>')
    process.exit(1)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) {
    console.error(`batch dir not found: ${batchDir}`)
    process.exit(1)
  }
  const files = readdirSync(batchDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()
  let clean = 0
  let dirty = 0
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      console.log(`CLEAN  ${file}`)
      clean++
    } else {
      dirty++
      console.log(`DIRTY  ${file}  (${report.errors.length} errors)`)
      for (const e of report.errors) {
        console.log(`         ${e.kind}: ${e.message}  @  ${e.path}`)
      }
    }
  }
  console.log(`\nTotal: ${files.length}  clean: ${clean}  dirty: ${dirty}`)
}

main()

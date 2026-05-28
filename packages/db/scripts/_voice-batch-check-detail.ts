/**
 * Detailed voice-check report for a batch directory.
 *
 * For each dirty file, prints every error with its path, kind, message and
 * snippet so the worker can locate the offending paragraph quickly.
 *
 * Usage:
 *   tsx scripts/_voice-batch-check-detail.ts docs/voice-retrofit-<batch-id> [slug-substring]
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function main() {
  const argDir = process.argv[2]
  const slugFilter = process.argv[3] ?? ''
  if (!argDir) {
    console.error('Usage: tsx _voice-batch-check-detail.ts <batch-dir> [slug-substring]')
    process.exit(2)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, argDir)

  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  for (const file of files) {
    const full = resolve(batchDir, file)
    const raw = readFileSync(full, 'utf8')
    const data = JSON.parse(raw)
    if (slugFilter && !(data.slug ?? file).includes(slugFilter)) continue
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n=== ${data.slug ?? file} (${report.errors.length} errors) ===`)
    for (const err of report.errors) {
      console.log(`  [${err.kind}] ${err.path}`)
      console.log(`    msg: ${err.message}`)
      if (err.snippet) console.log(`    snippet: ${err.snippet}`)
    }
  }
}

main()

/**
 * Print every voice-check finding (kind + path + snippet/message) for each
 * dirty file in a batch. Used to target rewrites precisely.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('Usage: _voice-retrofit-detail.ts <batch-id> [slug-filter]')
    process.exit(1)
  }
  const slugFilter = process.argv[3]
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) {
    console.error(`Batch directory not found: ${batchDir}`)
    process.exit(1)
  }
  const files = readdirSync(batchDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .filter((f) => !slugFilter || f.includes(slugFilter))

  for (const file of files) {
    const raw = readFileSync(resolve(batchDir, file), 'utf8')
    const data = JSON.parse(raw)
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n=== ${file} ===`)
    for (const e of report.errors) {
      console.log(`  [${e.kind}] ${e.path}`)
      console.log(`    ${e.message}`)
      if (e.snippet) console.log(`    snippet: ${e.snippet.slice(0, 200)}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { runVoiceCheck } from './voice-check-lib.js'

async function main() {
  const batchId = process.argv[2]
  if (!batchId) throw new Error('batch id required')
  const worktreeRoot = resolve(__dirname, '../../..')
  const dir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(dir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n=== ${file} ===`)
    for (const e of report.errors) {
      console.log(`  ${e.kind} @ ${e.path}`)
      console.log(`    msg: ${e.message}`)
      if (e.snippet) console.log(`    snip: ${e.snippet}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

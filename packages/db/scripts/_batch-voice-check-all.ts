/**
 * Run voice-check on all files in a batch directory and report errors.
 * Usage: tsx scripts/_batch-voice-check-all.ts <batch-id>
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

const batchId = process.argv[2]
if (!batchId) { console.error('Usage: tsx scripts/_batch-voice-check-all.ts <batch-id>'); process.exit(1) }

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

let clean = 0
let dirty = 0

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  let data: any
  try { data = JSON.parse(raw) } catch { console.error(`PARSE ERROR: ${file}`); dirty++; continue }

  const report = runVoiceCheck(data)
  if (report.errors.length === 0) {
    clean++
  } else {
    dirty++
    console.log(`\n--- ${file} (${report.errors.length} errors) ---`)
    for (const e of report.errors) {
      console.log(`  [${e.kind}] ${e.message}${e.snippet ? ` | snippet: "${e.snippet}"` : ''}`)
      console.log(`    at: ${e.path}`)
    }
  }
}

console.log(`\nSummary: ${clean} clean, ${dirty} need work`)

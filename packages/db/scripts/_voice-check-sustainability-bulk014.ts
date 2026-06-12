/**
 * Voice-check all sustainability-bulk-014 briefs.
 * Usage: tsx scripts/_voice-check-sustainability-bulk014.ts
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'

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

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/sustainability-bulk-014-briefs')
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort()

let clean = 0
const dirty: string[] = []

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  let data: any
  try { data = JSON.parse(raw) } catch (e) { console.error(`PARSE ERROR: ${file} — ${e}`); dirty.push(file); continue }

  const report = runVoiceCheck(data)
  if (report.errors.length === 0) {
    clean++
    console.log(`OK: ${file}`)
  } else {
    dirty.push(file)
    console.log(`\nFAIL: ${file} (${report.errors.length} errors)`)
    for (const e of report.errors) {
      console.log(`  [${e.kind}] ${e.message}${e.snippet ? ` | snippet: "${e.snippet}"` : ''}`)
      console.log(`    at: ${e.path}`)
    }
  }
}

console.log(`\n=== Summary: ${clean} clean, ${dirty.length} failed ===`)
if (dirty.length > 0) {
  console.log('Failed files:')
  for (const f of dirty) console.log(`  ${f}`)
  process.exit(2)
}

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

const batchDir = process.argv[2]
if (!batchDir) {
  console.error('Usage: tsx check-batch23.ts <batch-dir>')
  process.exit(1)
}
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))
for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
  const report = runVoiceCheck(data)
  console.log(`\n=== ${data.slug} ===`)
  console.log(`  errors: ${report.errors.length}, warnings: ${report.warnings.length}`)
  for (const e of report.errors) {
    console.log(`  [ERR] ${e.kind}: ${e.message}`)
    console.log(`        path: ${e.path}`)
    if (e.snippet) console.log(`        snippet: ${e.snippet}`)
  }
  for (const w of report.warnings.slice(0, 8)) {
    console.log(`  [WARN] ${w.kind}: ${w.message}`)
  }
}

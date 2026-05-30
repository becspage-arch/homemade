import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { exitCodeFor, formatReport, runVoiceCheck } from './voice-check-lib.js'

const BRIEFS_DIR = resolve(__dirname, '../../../docs/baking-bulk-023-briefs')

const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json')).sort()
let passed = 0
let errors = 0
let warnings = 0

for (const fn of files) {
  const fp = join(BRIEFS_DIR, fn)
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(fp, 'utf8'))
  } catch (e) {
    console.error(`PARSE ERROR: ${fn}: ${e}`)
    errors++
    continue
  }
  const report = runVoiceCheck(parsed)
  const code = exitCodeFor(report)
  if (code === 2) {
    console.log(`\nERROR: ${fn}`)
    console.log(formatReport(report))
    errors++
  } else if (code === 1) {
    console.log(`WARN: ${fn}`)
    warnings++
  } else {
    passed++
  }
}

console.log(`\n--- Results: ${passed} passed, ${errors} errors, ${warnings} warnings ---`)
process.exit(errors > 0 ? 2 : warnings > 0 ? 1 : 0)

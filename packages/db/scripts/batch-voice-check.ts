/**
 * Batch voice check — runs voice-check on all files in a directory.
 * Usage: tsx scripts/batch-voice-check.ts <glob-or-dir>
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { exitCodeFor, formatReport, runVoiceCheck } from './voice-check-lib.js'

const arg = process.argv[2]
if (!arg) {
  console.error('Usage: batch-voice-check.ts <directory>')
  process.exit(1)
}

const dir = resolve(arg)
const files = readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .sort()

let totalErrors = 0
let totalWarnings = 0
const failures: string[] = []

for (const file of files) {
  const filePath = join(dir, file)
  const raw = JSON.parse(readFileSync(filePath, 'utf8'))
  const report = runVoiceCheck(raw)
  const code = exitCodeFor(report)
  const formatted = formatReport(report)
  if (code === 2) {
    console.log(`FAIL  ${file}`)
    console.log(formatted)
    totalErrors += report.errors.length
    failures.push(file)
  } else if (code === 1) {
    console.log(`WARN  ${file}`)
    console.log(formatted)
    totalWarnings += report.warnings.length
  } else {
    console.log(`OK    ${file}`)
  }
}

console.log(`\nSummary: ${files.length} files | ${totalErrors} errors | ${totalWarnings} warnings | ${failures.length} failures`)
if (failures.length > 0) {
  console.log('Failed:', failures.join(', '))
  process.exit(2)
}
process.exit(0)

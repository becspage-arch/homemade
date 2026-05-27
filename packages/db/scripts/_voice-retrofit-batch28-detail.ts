import { runVoiceCheck } from './voice-check-lib.js'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const slug = process.argv[2]
if (!slug) {
  console.error('usage: tsx _voice-retrofit-batch28-detail.ts <slug>')
  process.exit(1)
}
const filePath = resolve(worktreeRoot, `docs/voice-retrofit-2026-05-27-batch28/${slug}.json`)
const data = JSON.parse(readFileSync(filePath, 'utf8'))
const report = runVoiceCheck(data)
console.log(`errors: ${report.errors.length}`)
for (const e of report.errors) {
  console.log(`${e.kind} | ${e.message.slice(0, 100)}`)
  console.log(`  path: ${e.path}`)
  if (e.snippet) console.log(`  snippet: ${e.snippet.slice(0, 100)}`)
}
console.log(`warnings: ${report.warnings.length}`)
for (const w of report.warnings.slice(0, 10)) {
  console.log(`  W ${w.kind}: ${w.message.slice(0, 100)}`)
}

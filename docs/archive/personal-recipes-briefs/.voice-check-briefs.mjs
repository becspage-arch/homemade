// Voice-check all briefs by spawning tsx once with a small inline script that
// imports the compiled lib. Done in one process so it's fast.

import { spawnSync } from 'node:child_process'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

const TSX_SCRIPT = `
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runVoiceCheck, exitCodeFor } from './scripts/voice-check-lib.js'

const dir = '${join(REPO_ROOT, 'docs', 'personal-recipes-briefs').replace(/\\\\/g, '/')}'
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('.')).sort()

let clean = 0
let warnOnly = 0
let withErrors = 0
const errorBriefs = []
const warningCounts = {}

for (const f of files) {
  const raw = readFileSync(join(dir, f), 'utf8')
  let parsed
  try { parsed = JSON.parse(raw) } catch { withErrors++; errorBriefs.push({ slug: f, errors: ['INVALID JSON'] }); continue }
  const report = runVoiceCheck(parsed)
  const code = exitCodeFor(report)
  if (code === 0) clean++
  else if (code === 1) warnOnly++
  else {
    withErrors++
    errorBriefs.push({ slug: f, errors: report.errors.map(e => e.kind + ': ' + e.message + ' @ ' + e.path) })
  }
  for (const w of report.warnings) {
    warningCounts[w.kind] = (warningCounts[w.kind] || 0) + 1
  }
}

console.log('clean=' + clean + ' warnOnly=' + warnOnly + ' withErrors=' + withErrors)
console.log('Total warnings by kind:')
for (const [k, v] of Object.entries(warningCounts)) console.log('  ' + k + ': ' + v)
if (errorBriefs.length > 0) {
  console.log('\\nBriefs with errors:')
  for (const eb of errorBriefs.slice(0, 30)) {
    console.log('  ' + eb.slug)
    for (const e of eb.errors) console.log('    ' + e)
  }
  if (errorBriefs.length > 30) console.log('  ... and ' + (errorBriefs.length - 30) + ' more')
}
`

const res = spawnSync(
  'pnpm',
  ['--filter', '@homemade/db', 'exec', 'tsx', '-e', TSX_SCRIPT],
  { cwd: REPO_ROOT, stdio: 'inherit', shell: true, timeout: 300_000 },
)
process.exit(res.status ?? 0)

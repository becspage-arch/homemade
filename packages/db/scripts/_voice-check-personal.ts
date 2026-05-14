// Throwaway helper for the personal-recipes redo session. Voice-checks every
// brief in docs/personal-recipes-briefs/ in one tsx process. Delete after the
// session ships.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { exitCodeFor, runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..', '..')
const BRIEFS = join(REPO_ROOT, 'docs', 'personal-recipes-briefs')

const files = readdirSync(BRIEFS)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('.'))
  .sort()

let clean = 0
let warnOnly = 0
let withErrors = 0
const errorBriefs: { slug: string; errors: string[] }[] = []
const warningCounts: Record<string, number> = {}

for (const f of files) {
  const raw = readFileSync(join(BRIEFS, f), 'utf8')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    withErrors++
    errorBriefs.push({ slug: f, errors: ['INVALID JSON'] })
    continue
  }
  const report = runVoiceCheck(parsed)
  const code = exitCodeFor(report)
  if (code === 0) clean++
  else if (code === 1) warnOnly++
  else {
    withErrors++
    errorBriefs.push({
      slug: f,
      errors: report.errors.map((e) => `${e.kind}: ${e.message} @ ${e.path}`),
    })
  }
  for (const w of report.warnings) {
    warningCounts[w.kind] = (warningCounts[w.kind] ?? 0) + 1
  }
}

console.log(`clean=${clean} warnOnly=${warnOnly} withErrors=${withErrors}`)
console.log('Total warnings by kind:')
for (const [k, v] of Object.entries(warningCounts)) {
  console.log(`  ${k}: ${v}`)
}
if (errorBriefs.length > 0) {
  console.log('\nBriefs with errors:')
  for (const eb of errorBriefs.slice(0, 50)) {
    console.log(`  ${eb.slug}`)
    for (const e of eb.errors) console.log(`    ${e}`)
  }
  if (errorBriefs.length > 50) console.log(`  ... and ${errorBriefs.length - 50} more`)
}

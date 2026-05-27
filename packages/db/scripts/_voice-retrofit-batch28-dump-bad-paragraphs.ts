/**
 * For each file in batch28, dump the paragraphs that voice-check flagged.
 * Outputs path → text so we can rewrite by hand.
 */
import { runVoiceCheck, fleschKincaidGrade, extractProseChunks } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch28')
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(dir, file), 'utf8'))
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n========== ${file}`)
  for (const e of report.errors) {
    console.log(`[${e.kind}] ${e.path}`)
  }
  // For each grade-level error, find the paragraph text by path.
  const chunks = extractProseChunks(data.body)
  for (const e of report.errors) {
    if (e.kind === 'grade-level') {
      const c = chunks.find((c) => c.path === e.path)
      if (c) {
        const g = fleschKincaidGrade(c.text)
        console.log(`  GRADE=${g?.toFixed(1)} | ${c.text.slice(0, 400)}`)
      }
    }
  }
}

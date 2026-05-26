/**
 * For a single voice-retrofit JSON file, print every paragraph that fails
 * the grade-level rule with the full text. Helps the worker locate the
 * paragraph(s) to rewrite.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, extractProseChunks, fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const batchId = process.argv[2]
  const slug = process.argv[3]
  if (!batchId || !slug) {
    console.error('usage: tsx _voice-retrofit-show-paragraphs.ts <batch-id> <slug>')
    process.exit(1)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const file = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`, `${slug}.json`)
  if (!existsSync(file)) {
    console.error(`file not found: ${file}`)
    process.exit(1)
  }
  const data = JSON.parse(readFileSync(file, 'utf8'))
  const report = runVoiceCheck(data)
  console.log(`\n=== ${slug} ===`)
  console.log(`errors: ${report.errors.length}`)
  for (const err of report.errors) {
    console.log(`\n[${err.kind}] ${err.message}`)
    console.log(`  path: ${err.path}`)
    if (err.snippet) console.log(`  snippet: ${err.snippet}`)
  }
  console.log(`\n--- all paragraphs with grade-level ---`)
  const chunks = extractProseChunks(data.body)
  for (const chunk of chunks) {
    if (!chunk.paragraph || !chunk.path.startsWith('body')) continue
    const grade = fleschKincaidGrade(chunk.text)
    if (grade !== null && grade > 10) {
      console.log(`\n  grade ${grade.toFixed(1)} at ${chunk.path}:`)
      console.log(`  "${chunk.text}"`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/**
 * Print the actual offending paragraph text for each error in each batch
 * file. Used to scope the rewrites before doing them.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, extractProseChunks, fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('usage: tsx _voice-retrofit-show-violations.ts <batch-id> [slug]')
    process.exit(1)
  }
  const onlySlug = process.argv[3]
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  for (const file of files) {
    const raw = readFileSync(resolve(batchDir, file), 'utf8')
    const data = JSON.parse(raw)
    if (onlySlug && data.slug !== onlySlug) continue
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    const chunks = extractProseChunks(data.body)
    console.log(`\n=== ${data.slug} (${report.errors.length} error${report.errors.length === 1 ? '' : 's'}) ===`)
    for (const err of report.errors) {
      const chunk = chunks.find((c) => c.path === err.path)
      console.log(`  [${err.kind}] ${err.message}`)
      if (chunk) {
        const grade = fleschKincaidGrade(chunk.text)
        const gradeStr = grade !== null ? ` (grade ${grade.toFixed(1)})` : ''
        console.log(`    path: ${err.path}${gradeStr}`)
        console.log(`    text: ${chunk.text.replace(/\s+/g, ' ').slice(0, 400)}`)
      }
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

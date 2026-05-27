/**
 * Dump the offending paragraphs from each dirty batch29 file so the
 * rewrite worker can see what text needs fixing.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, extractProseChunks } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch29')
  const files = readdirSync(batchDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()
  for (const file of files) {
    const data: any = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n=== ${file} ===`)
    const chunks = extractProseChunks(data.body)
    for (const err of report.errors) {
      const matchingChunk = chunks.find((c) => c.path === err.path)
      console.log(`\n[${err.kind}] ${err.path}`)
      console.log(`  ${err.message}`)
      if (matchingChunk) {
        console.log(`  TEXT: ${matchingChunk.text.slice(0, 800)}${matchingChunk.text.length > 800 ? '…' : ''}`)
      }
    }
  }
}

main()

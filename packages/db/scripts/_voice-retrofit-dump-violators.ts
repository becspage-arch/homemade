/**
 * Dump full text of each violating paragraph for hand rewrite.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

import { runVoiceCheck, extractProseChunks, fleschKincaidGrade } from './voice-check-lib.js'

const BATCH_ID = process.env.BATCH_ID ?? '2026-05-27-batch31'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    const chunks = extractProseChunks(data.body)
    for (const err of report.errors) {
      const chunk = chunks.find((c) => c.path === err.path)
      const grade = chunk ? fleschKincaidGrade(chunk.text) : null
      console.log(`===FILE=${file}===PATH=${err.path}===GRADE=${grade?.toFixed(1) ?? '?'}===`)
      console.log(chunk?.text ?? '')
      console.log('===END===')
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/**
 * Voice-check every JSON file in docs/voice-retrofit-<BATCH_ID>/.
 * Prints per-file error/warn counts and a flat list of all errors.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

import { runVoiceCheck } from './voice-check-lib.js'

const BATCH_ID = process.env.BATCH_ID ?? '2026-05-27-batch31'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  const files = readdirSync(batchDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()

  let clean = 0
  let dirty = 0
  const failureMap: Record<string, { errors: number; kinds: string[] }> = {}

  for (const f of files) {
    const data = JSON.parse(readFileSync(resolve(batchDir, f), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      clean++
      console.log(`[OK]   ${f}`)
    } else {
      dirty++
      const kinds = Array.from(new Set(report.errors.map((e) => e.kind)))
      failureMap[f] = { errors: report.errors.length, kinds }
      console.log(`[ERR]  ${f} — ${report.errors.length} errors [${kinds.join(', ')}]`)
      for (const e of report.errors.slice(0, 6)) {
        console.log(`        ${e.kind}: ${e.message.slice(0, 100)} @ ${e.path}`)
      }
    }
  }

  console.log(`\nSummary: ${clean} clean, ${dirty} dirty (out of ${files.length})`)
  console.log('\nDirty files:')
  for (const [f, info] of Object.entries(failureMap)) {
    console.log(`  ${f}: ${info.errors} [${info.kinds.join(', ')}]`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

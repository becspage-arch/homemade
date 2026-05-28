/**
 * Scan every JSON file in a voice-retrofit batch directory with the voice
 * checker. Print a compact per-slug summary of error counts + kinds.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/_voice-retrofit-scan.ts <batch-id>
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('Usage: _voice-retrofit-scan.ts <batch-id>')
    process.exit(1)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) {
    console.error(`Batch directory not found: ${batchDir}`)
    process.exit(1)
  }

  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  let cleanCount = 0
  let dirtyCount = 0
  const totalsByKind: Record<string, number> = {}

  for (const file of files) {
    const raw = readFileSync(resolve(batchDir, file), 'utf8')
    let data: any
    try {
      data = JSON.parse(raw)
    } catch {
      console.log(`[PARSE-FAIL] ${file}`)
      continue
    }
    const report = runVoiceCheck(data)
    const errs = report.errors
    if (errs.length === 0) {
      cleanCount++
      continue
    }
    dirtyCount++
    const counts: Record<string, number> = {}
    for (const e of errs) {
      counts[e.kind] = (counts[e.kind] ?? 0) + 1
      totalsByKind[e.kind] = (totalsByKind[e.kind] ?? 0) + 1
    }
    const summary = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k}:${n}`)
      .join(' ')
    console.log(`[DIRTY ${errs.length.toString().padStart(3)}] ${file.replace('.json', '')}: ${summary}`)
  }

  console.log(`\nclean: ${cleanCount}, dirty: ${dirtyCount}`)
  console.log('Totals by kind:')
  for (const [k, n] of Object.entries(totalsByKind).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${n}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

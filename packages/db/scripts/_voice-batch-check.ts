/**
 * Voice-check a directory of exported tutorial JSON files.
 *
 * Walks each non-underscore JSON file in the batch dir and prints a compact
 * per-slug report of errors (and warnings) so the worker can target which
 * files need rewriting.
 *
 * Usage:
 *   tsx scripts/_voice-batch-check.ts docs/voice-retrofit-<batch-id>
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function main() {
  const argDir = process.argv[2]
  if (!argDir) {
    console.error('Usage: tsx _voice-batch-check.ts <batch-dir>')
    process.exit(2)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, argDir)

  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  let clean = 0
  let dirty = 0
  const dirtySlugs: { slug: string; errors: number; kinds: string[] }[] = []

  for (const file of files) {
    const full = resolve(batchDir, file)
    const raw = readFileSync(full, 'utf8')
    const data = JSON.parse(raw)
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      clean++
      continue
    }
    dirty++
    const kinds = Array.from(new Set(report.errors.map((e) => e.kind)))
    dirtySlugs.push({ slug: data.slug ?? file, errors: report.errors.length, kinds })
  }

  console.log(`Clean: ${clean}, Dirty: ${dirty}, Total: ${files.length}`)
  console.log()
  for (const d of dirtySlugs) {
    console.log(`[DIRTY] ${d.slug} — ${d.errors} errors: ${d.kinds.join(', ')}`)
  }
}

main()

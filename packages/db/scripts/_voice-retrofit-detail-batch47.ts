/**
 * For each file in batch4 that still has voice-check errors, dump the
 * actual offending text per error path so the rewrite step has exact
 * targets.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, extractProseChunks, extractMetadataChunks } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const dir = resolve(worktreeRoot, 'docs', 'voice-retrofit-2026-05-28-batch4')
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()

  for (const f of files) {
    const raw = readFileSync(resolve(dir, f), 'utf8')
    const data = JSON.parse(raw)
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue

    console.log('═══════════════════════════════════════════════')
    console.log(`${data.slug}  (${data.type})`)
    console.log('═══════════════════════════════════════════════')

    const chunks = [
      ...extractMetadataChunks(data),
      ...extractProseChunks(data.body),
    ]
    const byPath = new Map(chunks.map((c) => [c.path, c.text]))

    for (const err of report.errors) {
      console.log(`\n[${err.kind}] ${err.path}`)
      console.log(`  msg: ${err.message}`)
      const text = byPath.get(err.path)
      if (text) {
        console.log(`  text: ${text.replace(/\n/g, ' ')}`)
      }
    }
    console.log()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

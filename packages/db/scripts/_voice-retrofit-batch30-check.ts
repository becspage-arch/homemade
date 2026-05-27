/**
 * Run voice-check against every JSON file in the batch 30 directory and
 * summarise. Used to identify which tutorials need active rewriting vs
 * already pass.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

import { runVoiceCheck } from './voice-check-lib.js'

const BATCH_ID = '2026-05-27-batch30'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  console.log(`[check] scanning ${files.length} files`)

  const summary: { slug: string; errors: number; warnings: number; errorKinds: Record<string, number> }[] = []

  for (const file of files) {
    const raw = readFileSync(resolve(batchDir, file), 'utf8')
    const data = JSON.parse(raw)
    const report = runVoiceCheck(data)
    const errorKinds: Record<string, number> = {}
    for (const e of report.errors) errorKinds[e.kind] = (errorKinds[e.kind] ?? 0) + 1
    summary.push({
      slug: data.slug,
      errors: report.errors.length,
      warnings: report.warnings.length,
      errorKinds,
    })
  }

  const totalErr = summary.reduce((s, x) => s + x.errors, 0)
  const passing = summary.filter((s) => s.errors === 0).length
  console.log(`[check] ${passing}/${summary.length} pass cleanly, ${totalErr} total errors`)

  // Tally error kinds
  const kinds: Record<string, number> = {}
  for (const s of summary) for (const [k, v] of Object.entries(s.errorKinds)) kinds[k] = (kinds[k] ?? 0) + v
  console.log('error kinds:')
  for (const [k, v] of Object.entries(kinds).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)

  // Per-file detail
  console.log('\nfiles with errors:')
  for (const s of summary.filter((x) => x.errors > 0).sort((a, b) => b.errors - a.errors)) {
    const kk = Object.entries(s.errorKinds).map(([k, v]) => `${k}=${v}`).join(', ')
    console.log(`  ${s.errors.toString().padStart(3)} ${s.slug} (${kk})`)
  }

  writeFileSync(resolve(batchDir, '_check-pre.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

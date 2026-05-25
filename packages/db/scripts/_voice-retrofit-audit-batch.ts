/**
 * Audit each file in docs/voice-retrofit-<batch-id>/ — run runVoiceCheck on
 * the JSON as-exported and print a per-slug error summary. Surfaces the
 * specific rule violations that need to be fixed by the rewrite step.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('usage: tsx _voice-retrofit-audit-batch.ts <batch-id>')
    process.exit(1)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) {
    console.error(`batch dir not found: ${batchDir}`)
    process.exit(1)
  }

  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  const counters = new Map<string, number>()
  const perSlug: { slug: string; errors: { kind: string; message: string; snippet?: string }[] }[] = []
  let totalErrors = 0
  let cleanCount = 0

  for (const file of files) {
    const raw = readFileSync(resolve(batchDir, file), 'utf8')
    const data = JSON.parse(raw)
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      cleanCount++
      perSlug.push({ slug: data.slug, errors: [] })
      continue
    }
    totalErrors += report.errors.length
    perSlug.push({
      slug: data.slug,
      errors: report.errors.map((e) => ({ kind: e.kind, message: e.message, snippet: e.snippet })),
    })
    for (const e of report.errors) counters.set(e.kind, (counters.get(e.kind) ?? 0) + 1)
  }

  console.log(`\n=== Voice-check audit: batch ${batchId} (${files.length} files) ===`)
  console.log(`Clean: ${cleanCount}/${files.length}`)
  console.log(`Total errors: ${totalErrors}`)
  console.log('\nError counts by kind:')
  for (const [kind, n] of Array.from(counters.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${kind.padEnd(28)}  ${n}`)
  }
  console.log('\nPer-slug breakdown (only slugs with errors):')
  for (const r of perSlug) {
    if (r.errors.length === 0) continue
    console.log(`\n[${r.slug}] ${r.errors.length} error(s):`)
    for (const e of r.errors.slice(0, 12)) {
      const snippet = e.snippet ? ` :: "${e.snippet}"` : ''
      console.log(`  - ${e.kind}: ${e.message}${snippet}`)
    }
    if (r.errors.length > 12) console.log(`  ... and ${r.errors.length - 12} more`)
  }
  console.log('\nClean slugs:')
  for (const r of perSlug) if (r.errors.length === 0) console.log(`  ${r.slug}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

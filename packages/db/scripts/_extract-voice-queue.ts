import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Extract the BLOCK-status slug queue from full-corpus audit JSON into
// docs/voice-pattern-queue-<date>.json — a stable input for the qc-fix-batch
// routine to chew through.

const REPO_ROOT = resolve(__dirname, '../../..')
const SRC = resolve(REPO_ROOT, 'docs/full-corpus-2026-06-01/qc-audit-2026-06-01.json')
const OUT = resolve(REPO_ROOT, 'docs/voice-pattern-queue-2026-06-01.json')

const data = JSON.parse(readFileSync(SRC, 'utf8')) as {
  totalScanned: number
  perCategory: Record<string, { total: number; pass: number; block: number; warnOnly: number }>
  verdicts: Array<{
    slug: string
    categorySlug: string
    type: string
    status: string
    findings: Array<{ severity: string; kind: string }>
  }>
}

const queue = data.verdicts
  .filter((v) => v.status === 'BLOCK')
  .map((v) => ({
    slug: v.slug,
    category: v.categorySlug,
    type: v.type,
    blockKinds: [...new Set(v.findings.filter((f) => f.severity === 'BLOCK').map((f) => f.kind))],
  }))

const out = {
  generatedAt: new Date().toISOString(),
  totalScanned: data.totalScanned,
  totalBlocked: queue.length,
  perCategory: data.perCategory,
  queue,
}
writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8')
console.log(`wrote ${OUT} — ${queue.length} blocked slugs`)

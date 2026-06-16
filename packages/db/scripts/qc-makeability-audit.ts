/**
 * Makeability audit + un-publish.
 *
 *   tsx scripts/qc-makeability-audit.ts                 # DRY RUN — audit only
 *   tsx scripts/qc-makeability-audit.ts --apply         # un-publish failures
 *   tsx scripts/qc-makeability-audit.ts --sample-fails  # also print sample fails
 *
 * Dry run (default): loads every PUBLISHED Tutorial row, runs the per-type
 * makeability gate, and writes
 *   docs/makeability-audit-<date>.json     (per-slug results)
 *   docs/makeability-summary-<date>.md      (per-category/type pass-fail table)
 * No DB writes.
 *
 * --apply: in addition, sets status=DRAFT + qcBlockReason on every FAIL,
 * preserving publishedAt and slug. Never deletes a row, never touches
 * heroMediaId, never changes a slug. Binary block — no warning tier.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

const DATE = '2026-06-16'
const DOCS = resolve(__dirname, '..', 'docs')

interface Result {
  slug: string; category: string; subCategory: string | null; type: string
  ruleKey: string; ok: boolean; reasons: string[]; rules: string[]
  unmakeable: boolean   // has a non-voice (structural / hard-garbage) failure -> un-publish
  voiceOnly: boolean    // makeable, but carries a voice nit (em-dash / banned) -> keep + flag
}

// Non-blocking rule families: voice nits + improvement flags. Present in
// reasons (so they show in the report) but never trigger un-publishing.
const isNonBlocking = (rule: string): boolean => rule.startsWith('voice:') || rule.startsWith('flag:')

async function main() {
  const apply = process.argv.includes('--apply')
  const sampleFails = process.argv.includes('--sample-fails')

  const { prisma } = await import('../src/index.js')
  const { Prisma } = await import('@prisma/client')
  const { auditMakeability, ruleKeyFor, buildMakeabilityBlockReason } = await import('./qc-makeability-rules/index.js')
  const { MAKEABILITY_SELECT, buildContexts } = await import('./qc-makeability-rules/loader.js')

  const ids = await prisma.tutorial.findMany({ where: { status: 'PUBLISHED' }, select: { id: true } })
  console.log(`PUBLISHED rows to audit: ${ids.length}`)

  const results: Result[] = []
  const CHUNK = 400
  const checkedAt = new Date().toISOString()

  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK).map((r) => r.id)
    const rows = await prisma.tutorial.findMany({ where: { id: { in: slice } }, select: MAKEABILITY_SELECT })
    const contexts = await buildContexts(prisma, rows as never)
    for (const ctx of contexts) {
      const r = auditMakeability(ctx)
      const ruleKey = ruleKeyFor(ctx)
      const unmakeable = r.rules.some((rule) => !isNonBlocking(rule))
      const voiceOnly = !r.ok && !unmakeable
      results.push({
        slug: ctx.slug, category: ctx.categorySlug, subCategory: ctx.subCategorySlug,
        type: ctx.type, ruleKey, ok: r.ok, reasons: r.reasons, rules: r.rules, unmakeable, voiceOnly,
      })
    }
    process.stdout.write(`\r  audited ${Math.min(i + CHUNK, ids.length)}/${ids.length}`)
  }
  process.stdout.write('\n')

  // ─── Aggregate ────────────────────────────────────────────────────────────
  // FAIL = unmakeable (un-published). PASS (for the tables) = makeable, whether
  // or not it carries a voice nit. voiceOnly rows are makeable + kept + flagged.
  const total = results.length
  const failed = results.filter((r) => r.unmakeable).length      // un-published
  const passed = total - failed                                   // makeable, kept
  const fullyClean = results.filter((r) => r.ok).length
  const voiceOnly = results.filter((r) => r.voiceOnly).length

  type Bucket = { n: number; pass: number; fail: number }
  const byCat = new Map<string, Bucket>()
  const byType = new Map<string, Bucket>()
  const byCatType = new Map<string, Bucket>()
  const reasonFreq = new Map<string, number>()
  const ruleFreq = new Map<string, number>()
  const bump = (m: Map<string, Bucket>, k: string, ok: boolean) => {
    const b = m.get(k) ?? { n: 0, pass: 0, fail: 0 }
    b.n++; ok ? b.pass++ : b.fail++; m.set(k, b)
  }
  for (const r of results) {
    const ok = !r.unmakeable
    bump(byCat, r.category, ok)
    bump(byType, r.type, ok)
    bump(byCatType, `${r.category}\t${r.type}`, ok)
    if (r.unmakeable) {
      for (let i = 0; i < r.reasons.length; i++) {
        if (isNonBlocking(r.rules[i])) continue // count only the un-publishing reasons
        reasonFreq.set(r.reasons[i], (reasonFreq.get(r.reasons[i]) ?? 0) + 1)
        ruleFreq.set(r.rules[i], (ruleFreq.get(r.rules[i]) ?? 0) + 1)
      }
    }
  }

  // ─── Write JSON ───────────────────────────────────────────────────────────
  mkdirSync(DOCS, { recursive: true })
  const jsonPath = resolve(DOCS, `makeability-audit-${DATE}.json`)
  writeFileSync(jsonPath, JSON.stringify({
    date: DATE, total, makeable: passed, unpublished: failed, fullyClean, voiceOnly,
    results: results.map((r) => ({
      slug: r.slug, category: r.category, subCategory: r.subCategory, type: r.type,
      ruleKey: r.ruleKey, unmakeable: r.unmakeable, voiceOnly: r.voiceOnly, reasons: r.reasons,
    })),
  }, null, 2))

  // ─── Write MD summary ─────────────────────────────────────────────────────
  const pct = (f: number, n: number) => n === 0 ? '0.0' : ((f / n) * 100).toFixed(1)
  const lines: string[] = []
  lines.push(`# Makeability audit — ${DATE}`, '')
  lines.push(`PUBLISHED audited: **${total}**  ·  MAKEABLE (kept): **${passed}**  ·  UN-PUBLISHED (failed makeability): **${failed}** (${pct(failed, total)}%)`, '')
  lines.push(`Of the ${passed} kept rows, ${fullyClean} are fully clean and ${voiceOnly} are makeable but carry a voice nit (em/en dash or banned phrasing) flagged for an in-place fix — NOT un-published, per the locked don't-over-prune rule.`, '')
  lines.push(`FAIL here means a genuine makeability gap (missing chart / method / ingredients / steps / broken body), not a style nit.`, '')

  lines.push('## Per-type', '', '| Type | n | PASS | FAIL | % fail |', '|---|--:|--:|--:|--:|')
  for (const [k, b] of [...byType.entries()].sort((a, b) => b[1].fail - a[1].fail)) {
    lines.push(`| ${k} | ${b.n} | ${b.pass} | ${b.fail} | ${pct(b.fail, b.n)}% |`)
  }
  lines.push('')

  lines.push('## Per-category', '', '| Category | n | PASS | FAIL | % fail |', '|---|--:|--:|--:|--:|')
  for (const [k, b] of [...byCat.entries()].sort((a, b) => b[1].fail - a[1].fail)) {
    lines.push(`| ${k} | ${b.n} | ${b.pass} | ${b.fail} | ${pct(b.fail, b.n)}% |`)
  }
  lines.push('')

  lines.push('## Per-category × type', '', '| Category | Type | n | PASS | FAIL | % fail |', '|---|---|--:|--:|--:|--:|')
  for (const [k, b] of [...byCatType.entries()].sort()) {
    const [c, t] = k.split('\t')
    lines.push(`| ${c} | ${t} | ${b.n} | ${b.pass} | ${b.fail} | ${pct(b.fail, b.n)}% |`)
  }
  lines.push('')

  lines.push('## 10 worst categories by % failure (min 20 rows)', '', '| Category | n | FAIL | % fail |', '|---|--:|--:|--:|')
  for (const [k, b] of [...byCat.entries()].filter(([, b]) => b.n >= 20).sort((a, b) => Number(pct(b[1].fail, b[1].n)) - Number(pct(a[1].fail, a[1].n))).slice(0, 10)) {
    lines.push(`| ${k} | ${b.n} | ${b.fail} | ${pct(b.fail, b.n)}% |`)
  }
  lines.push('')

  lines.push('## Most common failure reasons', '', '| count | reason |', '|--:|---|')
  for (const [reason, n] of [...reasonFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)) {
    lines.push(`| ${n} | ${reason.replace(/\|/g, '\\|')} |`)
  }
  lines.push('')

  lines.push('## Sample FAIL — un-published (5 per type, with reasons)', '')
  for (const type of [...byType.keys()]) {
    const fails = results.filter((r) => r.type === type && r.unmakeable).slice(0, 5)
    if (fails.length === 0) continue
    lines.push(`### ${type}`)
    for (const f of fails) {
      const reasons = f.reasons.filter((_, i) => !isNonBlocking(f.rules[i]))
      lines.push(`- \`${f.slug}\` (${f.category}) — ${reasons.join('; ')}`)
    }
    lines.push('')
  }

  lines.push('## Sample PASS — makeable (5 per type, sanity)', '')
  for (const type of [...byType.keys()]) {
    const passes = results.filter((r) => r.type === type && !r.unmakeable).slice(0, 5)
    if (passes.length === 0) continue
    lines.push(`### ${type}`)
    for (const p of passes) lines.push(`- \`${p.slug}\` (${p.category})${p.voiceOnly ? ' [voice nit flagged]' : ''}`)
    lines.push('')
  }

  lines.push('## Voice-nit rows (makeable, KEPT, flagged for in-place fix)', '')
  const nits = results.filter((r) => r.voiceOnly)
  lines.push(`${nits.length} rows. These contain an em/en dash or banned phrasing but are otherwise makeable; they stay PUBLISHED. Sample:`, '')
  for (const n of nits.slice(0, 25)) lines.push(`- \`${n.slug}\` (${n.category}/${n.type}) — ${n.reasons.join('; ')}`)
  lines.push('')

  const mdPath = resolve(DOCS, `makeability-summary-${DATE}.md`)
  writeFileSync(mdPath, lines.join('\n'))

  // ─── Console summary ──────────────────────────────────────────────────────
  console.log(`\nPUBLISHED audited: ${total}  MAKEABLE(kept): ${passed}  UN-PUBLISHED: ${failed} (${pct(failed, total)}%)`)
  console.log(`fully clean: ${fullyClean}  ·  voice-nit-only (kept, flagged): ${voiceOnly}`)
  console.log('\nby type (fail/n):')
  for (const [k, b] of [...byType.entries()].sort((a, b) => b[1].fail - a[1].fail)) console.log(`  ${k.padEnd(14)} ${b.fail}/${b.n} (${pct(b.fail, b.n)}%)`)
  console.log('\nby category (fail/n):')
  for (const [k, b] of [...byCat.entries()].sort((a, b) => b[1].fail - a[1].fail)) console.log(`  ${k.padEnd(22)} ${b.fail}/${b.n} (${pct(b.fail, b.n)}%)`)
  console.log('\ntop rule ids fired:')
  for (const [k, n] of [...ruleFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${String(n).padStart(5)}  ${k}`)
  console.log(`\nwrote ${jsonPath}`)
  console.log(`wrote ${mdPath}`)

  if (sampleFails) {
    console.log('\n=== sample fails per ruleKey ===')
    const byRule = new Map<string, Result[]>()
    for (const r of results) if (r.unmakeable) { const a = byRule.get(r.ruleKey) ?? []; a.push(r); byRule.set(r.ruleKey, a) }
    for (const [rk, arr] of byRule) {
      console.log(`\n[${rk}] ${arr.length} fails`)
      for (const f of arr.slice(0, 6)) console.log(`  ${f.slug} :: ${f.reasons.join(' | ')}`)
    }
  }

  // ─── Phase 3 — un-publish ───────────────────────────────────────────────
  if (apply) {
    console.log('\n--apply: un-publishing failures to DRAFT...')
    let done = 0
    for (const r of results.filter((x) => x.unmakeable)) {
      const reason = buildMakeabilityBlockReason(
        { ok: false, reasons: r.reasons, rules: r.rules },
        { ruleKey: r.ruleKey, blockedFromStatus: 'PUBLISHED', checkedAt, source: 'qc-makeability-audit' },
      )
      await prisma.tutorial.update({
        where: { slug: r.slug },
        // status -> DRAFT; publishedAt + slug + heroMediaId untouched.
        data: { status: 'DRAFT', qcBlockReason: reason as never },
      })
      done++
      if (done % 100 === 0) process.stdout.write(`\r  un-published ${done}/${failed}`)
    }
    process.stdout.write(`\r  un-published ${done}/${failed}\n`)
    const remaining = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
    console.log(`PUBLISHED after un-publish: ${remaining}`)
  } else {
    console.log('\n(dry run — no DB writes. Re-run with --apply to un-publish failures.)')
  }

  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })

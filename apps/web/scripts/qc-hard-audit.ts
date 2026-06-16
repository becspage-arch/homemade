/**
 * Hard-enforcement makeability audit + un-publish.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/qc-hard-audit.ts              # DRY RUN
 *   pnpm --filter @homemade/web exec tsx scripts/qc-hard-audit.ts --apply      # un-publish failures
 *
 * Re-audits every PUBLISHED public content surface against the LOCKED
 * completeness checklist (feedback_content_completeness_checklist), enforced
 * line for line by the hardened qc-makeability-rules. Three surfaces:
 *
 *   1. Tutorial rows (RECIPE / TECHNIQUE / PATTERN / PRACTICE / READING / STITCH
 *      / REMEDY / GROWING_GUIDE / HERB_PROFILE) — the per-type dispatcher.
 *   2. Standalone cross-stitch Pattern rows (the library + Stitching Mama set) —
 *      the cross-stitch checklist run against the resolved Pattern.data facts.
 *   3. SewingPattern rows (house + freesewing) — the sewing checklist run against
 *      getResolvedPattern() output (UNRESOLVED = fail). Works for both storage
 *      paths.
 *
 * Binary: a row PASSES only if it satisfies every cross-cutting rule AND every
 * MANDATORY type item. There is no warning / flag tier. --apply un-publishes
 * every failure (Tutorial -> status DRAFT; Pattern / SewingPattern -> visibility
 * PRIVATE), preserving publishedAt + slug + every image field, and records the
 * structured reasons in qcBlockReason. It never deletes a row.
 *
 * This script lives in apps/web (not packages/db) because the sewing dispatcher
 * live-drafts freesewing pieces, and the @freesewing/* packages only resolve
 * here. It is excluded from the apps/web typecheck and run via tsx.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

import { prisma } from '@homemade/db'
import { auditMakeability, ruleKeyFor, buildMakeabilityBlockReason } from '../../../packages/db/scripts/qc-makeability-rules/index'
import { MAKEABILITY_SELECT, buildContexts, crossStitchDataFacts } from '../../../packages/db/scripts/qc-makeability-rules/loader'
import { crossStitchReasons } from '../../../packages/db/scripts/qc-makeability-rules/pattern-cross-stitch'
import { mechanicalChecks } from '../../../packages/db/scripts/qc-makeability-rules/shared'
import { auditResolvedSewingPattern } from '../../../packages/db/scripts/qc-makeability-rules/pattern-sewing'
import { getResolvedPattern } from '../src/lib/sewing/getResolvedPattern'

const DATE = '2026-06-16'
// Write the audit artifacts next to the existing QC docs in packages/db.
const DOCS = resolve(__dirname, '../../../packages/db/docs')

interface Result {
  surface: 'tutorial' | 'cross-stitch' | 'sewing'
  slug: string
  /** Row id — used for the Pattern / SewingPattern un-publish (slug may be null). */
  id?: string
  category: string
  subCategory: string | null
  type: string
  ruleKey: string
  ok: boolean
  reasons: string[]
  rules: string[]
  source?: string
}

async function main() {
  const apply = process.argv.includes('--apply')

  const results: Result[] = []
  const checkedAt = new Date().toISOString()

  // ── 1) Tutorials ───────────────────────────────────────────────────────────
  const ids = await prisma.tutorial.findMany({ where: { status: 'PUBLISHED' }, select: { id: true } })
  console.log(`Tutorials PUBLISHED to audit: ${ids.length}`)
  const CHUNK = 400
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK).map((r) => r.id)
    const rows = await prisma.tutorial.findMany({ where: { id: { in: slice } }, select: MAKEABILITY_SELECT })
    const contexts = await buildContexts(prisma, rows as never)
    for (const ctx of contexts) {
      const r = auditMakeability(ctx)
      results.push({
        surface: 'tutorial', slug: ctx.slug, category: ctx.categorySlug,
        subCategory: ctx.subCategorySlug, type: ctx.type, ruleKey: ruleKeyFor(ctx),
        ok: r.ok, reasons: r.reasons, rules: r.rules,
      })
    }
    process.stdout.write(`\r  audited ${Math.min(i + CHUNK, ids.length)}/${ids.length}`)
  }
  process.stdout.write('\n')

  // ── 2) Standalone cross-stitch Pattern rows ─────────────────────────────────
  const xsRows = await prisma.pattern.findMany({
    where: { visibility: 'PUBLIC', type: 'CROSS_STITCH' },
    select: {
      id: true, slug: true, name: true, description: true, data: true, designerId: true,
      hasBackstitch: true, hasFrenchKnots: true,
      subCategory: { select: { slug: true } },
    },
  })
  console.log(`Cross-stitch Pattern rows (PUBLIC) to audit: ${xsRows.length}`)
  for (const row of xsRows) {
    const facts = crossStitchDataFacts(row.data, { hasBackstitch: row.hasBackstitch, hasFrenchKnots: row.hasFrenchKnots })
    const designerOrMeta =
      !!row.designerId ||
      (!!row.data && typeof row.data === 'object' &&
        typeof (row.data as Record<string, unknown>).metadata === 'object' &&
        !!((row.data as { metadata?: Record<string, unknown> }).metadata?.designer))
    // Build a full ChartFacts shape for the pure rule.
    const chartFacts = {
      tutorialChartDefinition: false, crochetChartData: false, knittingChartData: false,
      needleworkChartData: false, insetChartWithSymbols: false, hasChartNode: false,
      ...facts,
    }
    const mech = mechanicalChecks(`${row.name} ${row.description ?? ''}`)
    const structural = crossStitchReasons(chartFacts as never, designerOrMeta)
    const reasons = [...mech.reasons, ...structural]
    const rules = [...mech.rules, ...structural.map(() => 'cross-stitch:pattern')]
    results.push({
      surface: 'cross-stitch', slug: row.slug ?? `pattern:${row.name}`, id: row.id, category: 'cross-stitch',
      subCategory: row.subCategory?.slug ?? null, type: 'PATTERN', ruleKey: 'pattern-cross-stitch',
      ok: reasons.length === 0, reasons, rules,
    })
  }

  // ── 3) SewingPattern rows (house + freesewing) ──────────────────────────────
  const sewRows = await prisma.sewingPattern.findMany({
    where: { visibility: 'PUBLIC' },
    include: { subCategory: { select: { slug: true } } },
  })
  console.log(`SewingPattern rows (PUBLIC) to audit: ${sewRows.length}`)
  for (const row of sewRows) {
    const resolved = await getResolvedPattern(row as never)
    const r = auditResolvedSewingPattern(resolved)
    results.push({
      surface: 'sewing', slug: row.slug, id: row.id, category: 'sewing',
      subCategory: row.subCategory?.slug ?? null, type: 'PATTERN', ruleKey: 'pattern-sewing',
      ok: r.ok, reasons: r.reasons, rules: r.rules, source: resolved.source,
    })
  }

  // ── Aggregate ───────────────────────────────────────────────────────────────
  const total = results.length
  const failed = results.filter((r) => !r.ok).length
  const passed = total - failed

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
    bump(byCat, r.category, r.ok)
    bump(byType, r.type, r.ok)
    bump(byCatType, `${r.category}\t${r.type}`, r.ok)
    if (!r.ok) {
      for (let i = 0; i < r.reasons.length; i++) {
        reasonFreq.set(r.reasons[i], (reasonFreq.get(r.reasons[i]) ?? 0) + 1)
        ruleFreq.set(r.rules[i] ?? '?', (ruleFreq.get(r.rules[i] ?? '?') ?? 0) + 1)
      }
    }
  }

  const pct = (f: number, n: number) => (n === 0 ? '0.0' : ((f / n) * 100).toFixed(1))

  // ── JSON ──────────────────────────────────────────────────────────────────
  mkdirSync(DOCS, { recursive: true })
  const jsonPath = resolve(DOCS, `hard-audit-${DATE}.json`)
  writeFileSync(jsonPath, JSON.stringify({
    date: DATE, total, passed, failed,
    perSurface: {
      tutorial: tally(results, 'tutorial'),
      'cross-stitch': tally(results, 'cross-stitch'),
      sewing: tally(results, 'sewing'),
    },
    results: results.map((r) => ({
      surface: r.surface, slug: r.slug, category: r.category, subCategory: r.subCategory,
      type: r.type, ruleKey: r.ruleKey, ok: r.ok, source: r.source, reasons: r.reasons,
    })),
  }, null, 2))

  // ── Summary MD ──────────────────────────────────────────────────────────────
  const lines: string[] = []
  lines.push(`# Hard makeability audit — ${DATE}`, '')
  lines.push('Locked completeness checklist enforced line for line. Binary: a row PASSES only if it satisfies every cross-cutting rule AND every MANDATORY type item. No flag / warning tier.', '')
  lines.push(`Audited: **${total}**  ·  PASS: **${passed}** (${pct(passed, total)}%)  ·  FAIL / un-published: **${failed}** (${pct(failed, total)}%)`, '')
  lines.push('| Surface | n | PASS | FAIL | % fail |', '|---|--:|--:|--:|--:|')
  for (const s of ['tutorial', 'cross-stitch', 'sewing'] as const) {
    const t = tally(results, s)
    lines.push(`| ${s} | ${t.n} | ${t.pass} | ${t.fail} | ${pct(t.fail, t.n)}% |`)
  }
  lines.push('')

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

  lines.push('## Per-category x type', '', '| Category | Type | n | PASS | FAIL | % fail |', '|---|---|--:|--:|--:|--:|')
  for (const [k, b] of [...byCatType.entries()].sort()) {
    const [c, t] = k.split('\t')
    lines.push(`| ${c} | ${t} | ${b.n} | ${b.pass} | ${b.fail} | ${pct(b.fail, b.n)}% |`)
  }
  lines.push('')

  lines.push('## 10 worst (category, type) pairs by fail count (min 10 rows)', '', '| Category | Type | n | FAIL | % fail |', '|---|---|--:|--:|--:|')
  for (const [k, b] of [...byCatType.entries()].filter(([, b]) => b.n >= 10).sort((a, b) => b[1].fail - a[1].fail).slice(0, 10)) {
    const [c, t] = k.split('\t')
    lines.push(`| ${c} | ${t} | ${b.n} | ${b.fail} | ${pct(b.fail, b.n)}% |`)
  }
  lines.push('')

  lines.push('## Most common failure reasons', '', '| count | reason |', '|--:|---|')
  for (const [reason, n] of [...reasonFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 35)) {
    lines.push(`| ${n} | ${reason.replace(/\|/g, '\\|')} |`)
  }
  lines.push('')

  lines.push('## Sample FAIL (5 per type, with reasons)', '')
  for (const type of [...byType.keys()]) {
    const fails = results.filter((r) => r.type === type && !r.ok).slice(0, 5)
    if (!fails.length) continue
    lines.push(`### ${type}`)
    for (const f of fails) lines.push(`- \`${f.slug}\` (${f.category}${f.source ? `, ${f.source}` : ''}) — ${f.reasons.join('; ')}`)
    lines.push('')
  }

  lines.push('## Sample PASS (5 per type, sanity)', '')
  for (const type of [...byType.keys()]) {
    const passes = results.filter((r) => r.type === type && r.ok).slice(0, 5)
    if (!passes.length) { lines.push(`### ${type}`, '- (none passed)', ''); continue }
    lines.push(`### ${type}`)
    for (const p of passes) lines.push(`- \`${p.slug}\` (${p.category}${p.source ? `, ${p.source}` : ''})`)
    lines.push('')
  }

  const mdPath = resolve(DOCS, `hard-audit-summary-${DATE}.md`)
  writeFileSync(mdPath, lines.join('\n'))

  // ── Console ─────────────────────────────────────────────────────────────────
  console.log(`\nAudited ${total}  PASS ${passed} (${pct(passed, total)}%)  FAIL ${failed} (${pct(failed, total)}%)`)
  console.log('\nby type (fail/n):')
  for (const [k, b] of [...byType.entries()].sort((a, b) => b[1].fail - a[1].fail)) console.log(`  ${k.padEnd(14)} ${b.fail}/${b.n} (${pct(b.fail, b.n)}%)`)
  console.log('\nby category (fail/n):')
  for (const [k, b] of [...byCat.entries()].sort((a, b) => b[1].fail - a[1].fail)) console.log(`  ${k.padEnd(22)} ${b.fail}/${b.n} (${pct(b.fail, b.n)}%)`)
  console.log('\ntop rule ids fired:')
  for (const [k, n] of [...ruleFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${String(n).padStart(5)}  ${k}`)
  console.log(`\nwrote ${jsonPath}`)
  console.log(`wrote ${mdPath}`)

  // ── --apply: un-publish failures ────────────────────────────────────────────
  if (apply) {
    console.log('\n--apply: un-publishing failures...')
    let tut = 0, xs = 0, sew = 0
    for (const r of results.filter((x) => !x.ok)) {
      const reason = buildMakeabilityBlockReason(
        { ok: false, reasons: r.reasons, rules: r.rules },
        { ruleKey: r.ruleKey, blockedFromStatus: r.surface === 'tutorial' ? 'PUBLISHED' : 'PUBLIC', checkedAt, source: 'qc-hard-audit' },
      )
      if (r.surface === 'tutorial') {
        await prisma.tutorial.update({ where: { slug: r.slug }, data: { status: 'DRAFT', qcBlockReason: reason as never } })
        tut++
      } else if (r.surface === 'cross-stitch') {
        await prisma.pattern.update({ where: { id: r.id }, data: { visibility: 'PRIVATE', qcBlockReason: reason as never } })
        xs++
      } else {
        await prisma.sewingPattern.update({ where: { id: r.id }, data: { visibility: 'PRIVATE', qcBlockReason: reason as never } })
        sew++
      }
    }
    console.log(`un-published: tutorials=${tut} cross-stitch=${xs} sewing=${sew}`)
    const remTut = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
    const remXs = await prisma.pattern.count({ where: { visibility: 'PUBLIC', type: 'CROSS_STITCH' } })
    const remSew = await prisma.sewingPattern.count({ where: { visibility: 'PUBLIC' } })
    console.log(`remaining PUBLISHED: tutorials=${remTut} cross-stitch=${remXs} sewing=${remSew}`)
  } else {
    console.log('\n(dry run — no DB writes. Re-run with --apply to un-publish failures.)')
  }

  await prisma.$disconnect()
}

function tally(results: { surface: string; ok: boolean }[], surface: string) {
  const subset = results.filter((r) => r.surface === surface)
  const fail = subset.filter((r) => !r.ok).length
  return { n: subset.length, pass: subset.length - fail, fail }
}

main().catch((e) => { console.error(e); process.exit(1) })

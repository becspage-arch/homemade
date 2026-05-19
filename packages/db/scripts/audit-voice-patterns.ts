/**
 * audit-voice-patterns — sweep published tutorials against the 8 voice
 * patterns locked on 2026-05-19.
 *
 * The 8 patterns (from `feedback_homemade_voice.md`, additions of 2026-05-19):
 *   1. Em dashes: ZERO in body content.
 *   2. No safety advice blocks / no medical-financial advice.
 *   3. No false specificness (jargon / brand-trademark / over-pinned detail).
 *   4. Word precision per category (no "cooking" in natural-home etc.).
 *   5. Glossary coverage strengthened (registered terms used inline, definitions
 *      explanatory, no unflagged domain jargon).
 *   6. Sensible time units (raw hours over 48 must be days / weeks).
 *   7. Orientation before depth (first body block is plain-English prose).
 *   8. Consistent formatting across categories (canonical block types). Not
 *      detectable programmatically with high precision; not enforced here.
 *
 * Each tutorial is also scanned against the legacy voice-check rules (banned
 * phrases, banned openers, negation patterns, price mentions, wrap-ups,
 * americanisms, tricolons, temperature canonical, servings/yield). Legacy
 * findings are reported but do NOT count toward the 8-rule violation tally.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/audit-voice-patterns.ts
 *   pnpm --filter @homemade/db exec tsx scripts/audit-voice-patterns.ts --include-drafts
 *   pnpm --filter @homemade/db exec tsx scripts/audit-voice-patterns.ts --category cooking
 *   pnpm --filter @homemade/db exec tsx scripts/audit-voice-patterns.ts --rule 1
 *   pnpm --filter @homemade/db exec tsx scripts/audit-voice-patterns.ts --no-write
 *
 * Output (unless --no-write):
 *   docs/voice-audit-2026-05-19.md   — human-readable table
 *   docs/voice-audit-2026-05-19.json — machine-readable, used by the rewrite step
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

import { runVoiceCheck, type Finding, type FindingKind } from './voice-check-lib.js'

interface CliFlags {
  includeDrafts: boolean
  category: string | null
  rule: number | null
  write: boolean
}

function parseArgs(argv: string[]): CliFlags {
  let includeDrafts = false
  let category: string | null = null
  let rule: number | null = null
  let write = true
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--include-drafts') includeDrafts = true
    else if (arg === '--no-write') write = false
    else if (arg === '--category') {
      category = argv[i + 1] ?? null
      i++
    } else if (arg === '--rule') {
      const n = parseInt(argv[i + 1] ?? '', 10)
      if (Number.isFinite(n) && n >= 1 && n <= 8) rule = n
      i++
    }
  }
  return { includeDrafts, category, rule, write }
}

// ─── 8-pattern classification ──────────────────────────────────────────────

const RULE_KIND_MAP: Record<number, Set<FindingKind>> = {
  1: new Set(['em-dash-paragraph', 'em-dash-sentence']),
  2: new Set(['safety-block', 'medical-claim']),
  3: new Set(['unflagged-jargon', 'brand-trademark']),
  // Rule 4 is filled in by the category-aware verb check below.
  4: new Set([]),
  5: new Set(['glossary-coverage', 'empty-glossary-def']),
  6: new Set(['raw-hours']),
  // Rule 7 is filled in by the orientation-heuristic.
  7: new Set([]),
  8: new Set([]),
}

const RULE_LABELS: Record<number, string> = {
  1: 'em-dash zero',
  2: 'safety / medical block',
  3: 'false specificness',
  4: 'word precision per category',
  5: 'glossary coverage',
  6: 'sensible time units',
  7: 'orientation before depth',
  8: 'consistent formatting',
}

const LEGACY_KINDS = new Set<FindingKind>([
  'banned-phrase',
  'banned-opener',
  'negation-pattern',
  'price-mention',
  'wrap-up',
  'americanism',
  'tricolon',
  'temperature-canonical',
  'servings-yield',
])

function classifyFinding(kind: FindingKind): number | 'legacy' | null {
  for (const ruleNum of [1, 2, 3, 5, 6] as const) {
    if (RULE_KIND_MAP[ruleNum].has(kind)) return ruleNum
  }
  if (LEGACY_KINDS.has(kind)) return 'legacy'
  return null
}

// ─── Rule 4 — word precision per category ──────────────────────────────────

const WRONG_VERB_BY_CATEGORY: Record<string, string[]> = {
  'natural-home': ['cooking', 'cooked', 'cooks'],
  herbal: ['cooking', 'cooked', 'cooks'],
  mindset: ['exercising', 'exercises', 'performing', 'performed', 'performs'],
}

function checkWordPrecision(categorySlug: string, body: unknown): Finding[] {
  const banned = WRONG_VERB_BY_CATEGORY[categorySlug]
  if (!banned || banned.length === 0) return []
  const text = flattenText(body).toLowerCase()
  const findings: Finding[] = []
  for (const word of banned) {
    const re = new RegExp(`(^|[^\\p{L}])(${word})(?=$|[^\\p{L}])`, 'iu')
    if (re.test(text)) {
      findings.push({
        severity: 'error',
        kind: 'banned-phrase',
        message: `wrong-domain verb "${word}" in ${categorySlug} body (rule 4 — word precision per category)`,
        path: 'body',
        snippet: word,
      })
    }
  }
  return findings
}

// ─── Rule 7 — orientation before depth ─────────────────────────────────────

const JARGON_WATCH_FOR_ORIENTATION = [
  'supersedure',
  'propolis',
  'varroa',
  'pullet',
  'weaner',
  'fenbendazole',
  'colostrum',
  'drenching',
  'standstill',
  'crown board',
  'autoclave',
  'mordant',
  'gelatinise',
  'autolyse',
  'levain',
  'bannetons',
]

function checkOrientation(body: unknown): Finding[] {
  if (!body || typeof body !== 'object') return []
  const content = (body as { content?: unknown[] }).content
  if (!Array.isArray(content) || content.length === 0) return []
  const first = content[0] as { type?: string; content?: unknown[] }
  // If the first block is a structural block (heading / panel / supplies card),
  // there's no orientation paragraph.
  if (!first || typeof first !== 'object') {
    return [{ severity: 'error', kind: 'banned-phrase', message: 'no first body block (rule 7 — orientation before depth)', path: 'body[0]' }]
  }
  if (first.type !== 'paragraph') {
    return [
      {
        severity: 'error',
        kind: 'banned-phrase',
        message: `body opens with "${first.type}" rather than a plain-prose orientation paragraph (rule 7 — orientation before depth)`,
        path: 'body[0]',
      },
    ]
  }
  // Length sanity — a real orientation paragraph reads as several clauses.
  const text = flattenText(first).trim()
  if (text.length < 80) {
    return [
      {
        severity: 'error',
        kind: 'banned-phrase',
        message: `body opens with a very short paragraph (${text.length} chars) — orientation paragraph must explain what this is and why (rule 7)`,
        path: 'body[0]',
        snippet: text.slice(0, 60),
      },
    ]
  }
  // Domain jargon in the orientation paragraph must be wrapped in a
  // glossaryTooltip mark. Walk the children for raw text vs. wrapped text.
  const rawWords = collectUnwrappedWords(first as TipTapLike)
  const lowerRaw = rawWords.map((w) => w.toLowerCase())
  for (const term of JARGON_WATCH_FOR_ORIENTATION) {
    if (lowerRaw.some((w) => w === term || w.includes(term))) {
      return [
        {
          severity: 'error',
          kind: 'banned-phrase',
          message: `orientation paragraph uses "${term}" without a glossary tooltip (rule 7 — explain domain terms in plain English first)`,
          path: 'body[0]',
          snippet: term,
        },
      ]
    }
  }
  return []
}

interface TipTapLike {
  type?: string
  text?: string
  marks?: { type?: string }[]
  content?: TipTapLike[]
}

function flattenText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as TipTapLike
  if (typeof n.text === 'string') return n.text
  if (!Array.isArray(n.content)) return ''
  return n.content.map((c) => flattenText(c)).join(' ')
}

function collectUnwrappedWords(node: TipTapLike): string[] {
  const out: string[] = []
  function walk(n: TipTapLike): void {
    if (!n || typeof n !== 'object') return
    if (typeof n.text === 'string') {
      const marks = Array.isArray(n.marks) ? n.marks : []
      const hasTooltip = marks.some((m) => m && m.type === 'glossaryTooltip')
      if (!hasTooltip) {
        const words = n.text.match(/[\p{L}-]+/gu) ?? []
        for (const w of words) out.push(w)
      }
      return
    }
    if (Array.isArray(n.content)) for (const c of n.content) walk(c)
  }
  walk(node)
  return out
}

// ─── Body scan + classification ────────────────────────────────────────────

interface TutorialAudit {
  id: string
  slug: string
  title: string
  category: string
  status: string
  verdict: 'PASS' | 'VIOLATES'
  violations: number[] // rule numbers 1-8
  errorCount: number
  warningCount: number
  legacyCount: number
  findings: Array<{
    rule: number | 'legacy'
    severity: string
    kind: string
    message: string
    path: string
    snippet?: string
  }>
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))

  const { prisma, TutorialStatus } = await import('../src/index.js')

  const statuses = flags.includeDrafts
    ? [TutorialStatus.PUBLISHED, TutorialStatus.DRAFT, TutorialStatus.IN_REVIEW]
    : [TutorialStatus.PUBLISHED]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: { in: statuses } }
  if (flags.category) {
    const cat = await prisma.category.findUnique({ where: { slug: flags.category }, select: { id: true } })
    if (!cat) {
      console.error(`audit-voice-patterns: no category with slug "${flags.category}"`)
      process.exit(2)
    }
    where.categoryId = cat.id
  }

  const tutorials = await prisma.tutorial.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      sourceNotes: true,
      body: true,
      status: true,
      category: { select: { slug: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  console.log(`audit-voice-patterns: scanning ${tutorials.length} tutorials...`)

  const audits: TutorialAudit[] = []
  let scanned = 0

  for (const t of tutorials) {
    scanned++
    if (scanned % 250 === 0) console.log(`  ...${scanned}/${tutorials.length}`)

    const report = runVoiceCheck({
      subtitle: t.subtitle,
      excerpt: t.excerpt,
      sourceNotes: t.sourceNotes,
      body: t.body,
    })

    const extra: Finding[] = []
    extra.push(...checkWordPrecision(t.category.slug, t.body))
    extra.push(...checkOrientation(t.body))

    const allFindings: Array<Finding & { rule: number | 'legacy' }> = []

    for (const f of [...report.errors, ...report.warnings]) {
      const cls = classifyFinding(f.kind)
      if (cls === null) continue
      allFindings.push({ ...f, rule: cls })
    }

    // Word-precision and orientation findings are tagged manually so they
    // land in rules 4 and 7 regardless of the classifier mapping.
    for (const f of extra) {
      const rule = f.message.includes('rule 4') ? 4 : f.message.includes('rule 7') ? 7 : 'legacy'
      allFindings.push({ ...f, rule })
    }

    const violatedRules = new Set<number>()
    let errorCount = 0
    let warningCount = 0
    let legacyCount = 0
    for (const f of allFindings) {
      if (typeof f.rule === 'number') {
        violatedRules.add(f.rule)
        if (f.severity === 'error') errorCount++
        else warningCount++
      } else {
        legacyCount++
      }
    }

    const verdict: 'PASS' | 'VIOLATES' = violatedRules.size > 0 ? 'VIOLATES' : 'PASS'

    if (flags.rule !== null && verdict === 'VIOLATES' && !violatedRules.has(flags.rule)) continue
    if (flags.rule !== null && verdict === 'PASS') continue

    audits.push({
      id: t.id,
      slug: t.slug,
      title: t.title,
      category: t.category.slug,
      status: String(t.status),
      verdict,
      violations: [...violatedRules].sort((a, b) => a - b),
      errorCount,
      warningCount,
      legacyCount,
      findings: allFindings.map((f) => ({
        rule: f.rule,
        severity: f.severity,
        kind: f.kind,
        message: f.message,
        path: f.path,
        snippet: f.snippet,
      })),
    })
  }

  // ─── Aggregation ──────────────────────────────────────────────────────────
  const total = audits.length
  const violators = audits.filter((a) => a.verdict === 'VIOLATES')
  const passers = audits.filter((a) => a.verdict === 'PASS')
  const violationPct = total > 0 ? Math.round((violators.length / total) * 1000) / 10 : 0

  const categoriesSeen = [...new Set(audits.map((a) => a.category))].sort()
  const distribution: Record<string, { total: number; violators: number; perRule: Record<number, number>; legacy: number }> = {}
  for (const c of categoriesSeen) {
    distribution[c] = { total: 0, violators: 0, perRule: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }, legacy: 0 }
  }
  for (const a of audits) {
    const d = distribution[a.category]!
    d.total++
    if (a.verdict === 'VIOLATES') d.violators++
    for (const r of a.violations) d.perRule[r]++
    d.legacy += a.legacyCount
  }

  const overallPerRule: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }
  for (const a of violators) for (const r of a.violations) overallPerRule[r]++

  // ─── Console summary ──────────────────────────────────────────────────────
  console.log('')
  console.log(`audit-voice-patterns: ${total} tutorials, ${violators.length} violators (${violationPct}%), ${passers.length} clean`)
  console.log('')
  console.log('PER-RULE TOTALS (overall, tutorials with at least one finding in that rule):')
  for (let r = 1; r <= 8; r++) {
    console.log(`  rule ${r} (${RULE_LABELS[r]}): ${overallPerRule[r]}`)
  }
  console.log('')
  console.log('PER-CATEGORY:')
  for (const c of categoriesSeen) {
    const d = distribution[c]!
    const pct = d.total > 0 ? Math.round((d.violators / d.total) * 1000) / 10 : 0
    console.log(`  ${c.padEnd(22)} total=${String(d.total).padStart(4)} violators=${String(d.violators).padStart(4)} (${pct}%)  r1=${d.perRule[1]} r2=${d.perRule[2]} r3=${d.perRule[3]} r4=${d.perRule[4]} r5=${d.perRule[5]} r6=${d.perRule[6]} r7=${d.perRule[7]} r8=${d.perRule[8]}  legacy=${d.legacy}`)
  }

  if (flags.write) {
    const docsDir = resolveRepoPath('docs')
    if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true })

    const json = {
      generatedAt: new Date().toISOString(),
      flags,
      totals: {
        scanned: tutorials.length,
        inReport: total,
        violators: violators.length,
        passers: passers.length,
        violationPct,
      },
      overallPerRule,
      distribution,
      ruleLabels: RULE_LABELS,
      tutorials: audits,
    }
    const jsonPath = resolve(docsDir, 'voice-audit-2026-05-19.json')
    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf8')

    const md = renderMarkdown({ totals: json.totals, overallPerRule, distribution, audits, categoriesSeen })
    const mdPath = resolve(docsDir, 'voice-audit-2026-05-19.md')
    writeFileSync(mdPath, md, 'utf8')

    console.log('')
    console.log(`wrote ${jsonPath}`)
    console.log(`wrote ${mdPath}`)
  }

  await prisma.$disconnect()
}

function resolveRepoPath(rel: string): string {
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, rel)
    if (existsSync(candidate)) return candidate
    const pkg = resolve(dir, 'package.json')
    if (existsSync(pkg)) {
      // continue walking up — the docs dir lives at repo root
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  // Fallback — write into current working dir if docs/ is not found.
  return resolve(process.cwd(), rel)
}

interface RenderInput {
  totals: { scanned: number; inReport: number; violators: number; passers: number; violationPct: number }
  overallPerRule: Record<number, number>
  distribution: Record<string, { total: number; violators: number; perRule: Record<number, number>; legacy: number }>
  audits: TutorialAudit[]
  categoriesSeen: string[]
}

function renderMarkdown(input: RenderInput): string {
  const { totals, overallPerRule, distribution, audits, categoriesSeen } = input
  const lines: string[] = []
  lines.push('# Voice audit — 2026-05-19')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('Scope: PUBLISHED (unless `--include-drafts` was passed) tutorials scanned against the 8 voice patterns locked on 2026-05-19, plus the legacy voice-check rules.')
  lines.push('')
  lines.push('## Totals')
  lines.push('')
  lines.push(`- Scanned: ${totals.scanned}`)
  lines.push(`- In report: ${totals.inReport}`)
  lines.push(`- Violators: ${totals.violators} (${totals.violationPct}%)`)
  lines.push(`- Clean: ${totals.passers}`)
  lines.push('')
  lines.push('## Overall per-rule totals')
  lines.push('')
  lines.push('| Rule | Label | Tutorials with finding |')
  lines.push('|------|-------|------------------------|')
  for (let r = 1; r <= 8; r++) {
    lines.push(`| ${r} | ${RULE_LABELS[r]} | ${overallPerRule[r]} |`)
  }
  lines.push('')
  lines.push('## Per-category distribution')
  lines.push('')
  lines.push('| Category | Total | Violators | % | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | Legacy findings |')
  lines.push('|----------|-------|-----------|---|----|----|----|----|----|----|----|----|-----------------|')
  for (const c of categoriesSeen) {
    const d = distribution[c]!
    const pct = d.total > 0 ? Math.round((d.violators / d.total) * 1000) / 10 : 0
    lines.push(`| ${c} | ${d.total} | ${d.violators} | ${pct}% | ${d.perRule[1]} | ${d.perRule[2]} | ${d.perRule[3]} | ${d.perRule[4]} | ${d.perRule[5]} | ${d.perRule[6]} | ${d.perRule[7]} | ${d.perRule[8]} | ${d.legacy} |`)
  }
  lines.push('')
  lines.push('## Tutorial rows')
  lines.push('')
  lines.push('| Slug | Title | Category | Verdict | Violations | Errors | Warnings | Legacy |')
  lines.push('|------|-------|----------|---------|------------|--------|----------|--------|')
  for (const a of audits) {
    const violations = a.violations.length > 0 ? a.violations.join(',') : '—'
    const title = a.title.replace(/\|/g, '\\|').slice(0, 80)
    lines.push(`| ${a.slug} | ${title} | ${a.category} | ${a.verdict} | ${violations} | ${a.errorCount} | ${a.warningCount} | ${a.legacyCount} |`)
  }
  lines.push('')
  return lines.join('\n') + '\n'
}

main().catch(async (err) => {
  console.error(`audit-voice-patterns: ${err instanceof Error ? err.stack ?? err.message : err}`)
  process.exit(1)
})

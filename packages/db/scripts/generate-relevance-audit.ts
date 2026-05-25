/**
 * Subject-relevance — generate the audit doc.
 *
 * Reads a queue file + a verdicts file and produces:
 *
 *   docs/image-relevance-audit-2026-05-21.json  — per-tutorial verdicts joined
 *                                                 with tutorial / image context
 *   docs/image-relevance-audit-2026-05-21.md    — human-readable summary
 *                                                 (per-category percentages,
 *                                                 5 sample tutorials per
 *                                                 tier per category, top
 *                                                 WRONG-source breakdown,
 *                                                 lenient-verification
 *                                                 disagreement counts)
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/generate-relevance-audit.ts \
 *     [--queue PATH] [--verdicts PATH] [--out-base PATH]
 *
 * The script does not write to the DB. It is safe to re-run.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

interface QueueEntry {
  mediaId: string
  tutorialId: string
  tutorialSlug: string
  tutorialTitle: string
  category: string
  subCategory: string | null
  imageUrl: string
  imageSource: string
  existingVerificationStatus: string
}

interface QueueFile {
  generatedAt: string
  totalCandidates: number
  enqueued: number
  filter: { category: string; sources: string[]; stratify: boolean }
  entries: QueueEntry[]
}

interface VerdictRow {
  mediaId: string
  tier: 'EXACT' | 'PARTIAL' | 'WRONG'
  reason: string
  confidence: number
}

interface VerdictFile {
  verdicts: VerdictRow[]
}

interface CliFlags {
  queuePath: string
  verdictsPath: string
  outBase: string
}

function parseCli(argv: string[]): CliFlags {
  let queuePath = ''
  let verdictsPath = ''
  let outBase = ''
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--queue') queuePath = argv[++i]!
    else if (a.startsWith('--queue=')) queuePath = a.slice('--queue='.length)
    else if (a === '--verdicts') verdictsPath = argv[++i]!
    else if (a.startsWith('--verdicts=')) verdictsPath = a.slice('--verdicts='.length)
    else if (a === '--out-base') outBase = argv[++i]!
    else if (a.startsWith('--out-base=')) outBase = a.slice('--out-base='.length)
  }
  const docs = resolve(__dirname, '..', '..', '..', 'docs')
  if (!queuePath) queuePath = resolve(docs, 'image-relevance-queue.json')
  if (!verdictsPath) verdictsPath = resolve(docs, 'image-relevance-verdicts.json')
  if (!outBase) outBase = resolve(docs, `image-relevance-audit-${new Date().toISOString().slice(0, 10)}`)
  return { queuePath, verdictsPath, outBase }
}

interface JoinedRow extends QueueEntry {
  tier: 'EXACT' | 'PARTIAL' | 'WRONG'
  reason: string
  confidence: number
}

interface CategoryStats {
  category: string
  total: number
  exact: number
  partial: number
  wrong: number
  exactPct: number
  partialPct: number
  wrongPct: number
}

interface SourceStats {
  source: string
  total: number
  wrong: number
  wrongPct: number
}

interface AuditDoc {
  generatedAt: string
  queuePath: string
  verdictsPath: string
  scored: number
  unscored: number
  overall: {
    exact: number
    partial: number
    wrong: number
    exactPct: number
    partialPct: number
    wrongPct: number
  }
  perCategory: CategoryStats[]
  perSource: SourceStats[]
  /** Tutorials whose existing 2-tier verification was VERIFIED but the new
   *  relevance scorer marked WRONG. Strong signal that the old rubric let
   *  subject-mismatches through. */
  lenientDisagreements: Array<{
    mediaId: string
    tutorialSlug: string
    tutorialTitle: string
    category: string
    imageUrl: string
    existingVerificationStatus: string
    relevanceTier: 'WRONG' | 'PARTIAL'
    reason: string
  }>
  entries: JoinedRow[]
}

function main(): void {
  const flags = parseCli(process.argv.slice(2))

  if (!existsSync(flags.queuePath)) {
    console.error(`Queue file not found: ${flags.queuePath}`)
    process.exit(1)
  }
  if (!existsSync(flags.verdictsPath)) {
    console.error(`Verdicts file not found: ${flags.verdictsPath}`)
    process.exit(1)
  }

  const queue = JSON.parse(readFileSync(flags.queuePath, 'utf8')) as QueueFile
  const verdicts = JSON.parse(readFileSync(flags.verdictsPath, 'utf8')) as VerdictFile

  const verdictByMedia = new Map<string, VerdictRow>()
  for (const v of verdicts.verdicts) verdictByMedia.set(v.mediaId, v)

  const joined: JoinedRow[] = []
  let unscored = 0
  for (const e of queue.entries) {
    const v = verdictByMedia.get(e.mediaId)
    if (!v) {
      unscored += 1
      continue
    }
    joined.push({
      ...e,
      tier: v.tier,
      reason: v.reason,
      confidence: v.confidence,
    })
  }

  // Overall
  const total = joined.length
  const exact = joined.filter((r) => r.tier === 'EXACT').length
  const partial = joined.filter((r) => r.tier === 'PARTIAL').length
  const wrong = joined.filter((r) => r.tier === 'WRONG').length

  // Per category
  const byCat = new Map<string, JoinedRow[]>()
  for (const r of joined) {
    if (!byCat.has(r.category)) byCat.set(r.category, [])
    byCat.get(r.category)!.push(r)
  }
  const perCategory: CategoryStats[] = []
  for (const [cat, rows] of byCat) {
    const e = rows.filter((r) => r.tier === 'EXACT').length
    const p = rows.filter((r) => r.tier === 'PARTIAL').length
    const w = rows.filter((r) => r.tier === 'WRONG').length
    const t = rows.length
    perCategory.push({
      category: cat,
      total: t,
      exact: e,
      partial: p,
      wrong: w,
      exactPct: pct(e, t),
      partialPct: pct(p, t),
      wrongPct: pct(w, t),
    })
  }
  perCategory.sort((a, b) => b.total - a.total)

  // Per source
  const bySrc = new Map<string, JoinedRow[]>()
  for (const r of joined) {
    if (!bySrc.has(r.imageSource)) bySrc.set(r.imageSource, [])
    bySrc.get(r.imageSource)!.push(r)
  }
  const perSource: SourceStats[] = []
  for (const [src, rows] of bySrc) {
    const w = rows.filter((r) => r.tier === 'WRONG').length
    perSource.push({
      source: src,
      total: rows.length,
      wrong: w,
      wrongPct: pct(w, rows.length),
    })
  }
  perSource.sort((a, b) => b.wrongPct - a.wrongPct)

  // Lenient-rubric disagreements
  const lenient = joined
    .filter((r) => r.existingVerificationStatus === 'VERIFIED' && (r.tier === 'WRONG' || r.tier === 'PARTIAL'))
    .map((r) => ({
      mediaId: r.mediaId,
      tutorialSlug: r.tutorialSlug,
      tutorialTitle: r.tutorialTitle,
      category: r.category,
      imageUrl: r.imageUrl,
      existingVerificationStatus: r.existingVerificationStatus,
      relevanceTier: r.tier as 'WRONG' | 'PARTIAL',
      reason: r.reason,
    }))

  const doc: AuditDoc = {
    generatedAt: new Date().toISOString(),
    queuePath: flags.queuePath,
    verdictsPath: flags.verdictsPath,
    scored: total,
    unscored,
    overall: {
      exact,
      partial,
      wrong,
      exactPct: pct(exact, total),
      partialPct: pct(partial, total),
      wrongPct: pct(wrong, total),
    },
    perCategory,
    perSource,
    lenientDisagreements: lenient,
    entries: joined,
  }

  writeFileSync(`${flags.outBase}.json`, JSON.stringify(doc, null, 2), 'utf8')
  writeFileSync(`${flags.outBase}.md`, renderMarkdown(doc), 'utf8')

  console.log(`\nrelevance audit doc written to:`)
  console.log(`  ${flags.outBase}.json`)
  console.log(`  ${flags.outBase}.md`)
  console.log(`\nscored: ${total} (unscored: ${unscored})`)
  console.log(`overall: EXACT ${exact} (${doc.overall.exactPct}%)`)
  console.log(`         PARTIAL ${partial} (${doc.overall.partialPct}%)`)
  console.log(`         WRONG ${wrong} (${doc.overall.wrongPct}%)`)
  if (doc.overall.wrongPct > 60) {
    console.log('\n*** WRONG > 60% — sanity-check stop tripped. Hand off to Rebecca. ***')
  }
}

function pct(n: number, total: number): number {
  if (total === 0) return 0
  return Math.round((n / total) * 1000) / 10
}

function renderMarkdown(doc: AuditDoc): string {
  const out: string[] = []
  out.push(`# Image relevance audit — ${doc.generatedAt.slice(0, 10)}`)
  out.push('')
  out.push(`Source queue: \`${rel(doc.queuePath)}\``)
  out.push(`Verdicts: \`${rel(doc.verdictsPath)}\``)
  out.push(`Scored: **${doc.scored}** (unscored in queue: ${doc.unscored})`)
  out.push('')
  out.push('## Overall')
  out.push('')
  out.push('| Tier | Count | Share |')
  out.push('|------|------:|------:|')
  out.push(`| EXACT | ${doc.overall.exact} | ${doc.overall.exactPct}% |`)
  out.push(`| PARTIAL | ${doc.overall.partial} | ${doc.overall.partialPct}% |`)
  out.push(`| WRONG | ${doc.overall.wrong} | ${doc.overall.wrongPct}% |`)
  out.push('')
  if (doc.overall.wrongPct > 60) {
    out.push('> **Sanity-check stop tripped: WRONG > 60%.**')
    out.push('> ')
    out.push('> Re-sourcing at this scale is a strategic call (where do we source')
    out.push('> from if 60%+ of stock is unusable). Recommended approaches:')
    out.push('> ')
    out.push('> - accept procedural cards for the worst categories;')
    out.push('> - switch sources for the rest (e.g. drop Pixabay entirely if it')
    out.push('>   carries the highest WRONG rate);')
    out.push('> - or tighten orchestrator queries before any re-source pass.')
    out.push('')
  }
  out.push('## Per category')
  out.push('')
  out.push('| Category | Total | EXACT | PARTIAL | WRONG | WRONG% |')
  out.push('|----------|------:|------:|--------:|------:|-------:|')
  for (const c of doc.perCategory) {
    out.push(
      `| ${c.category} | ${c.total} | ${c.exact} (${c.exactPct}%) | ${c.partial} (${c.partialPct}%) | ${c.wrong} (${c.wrongPct}%) | ${c.wrongPct}% |`,
    )
  }
  out.push('')
  out.push('## Per source')
  out.push('')
  out.push('| Source | Total scored | WRONG | WRONG% |')
  out.push('|--------|-------------:|------:|-------:|')
  for (const s of doc.perSource) {
    out.push(`| ${s.source} | ${s.total} | ${s.wrong} | ${s.wrongPct}% |`)
  }
  out.push('')
  if (doc.lenientDisagreements.length > 0) {
    out.push('## Lenient-rubric disagreements')
    out.push('')
    out.push(
      `${doc.lenientDisagreements.length} tutorials had Media.verificationStatus = VERIFIED ` +
        '(passed the existing 2-tier rubric) but the strict relevance scorer marked them WRONG or PARTIAL. ' +
        'This is the volume of subject-mismatch that the existing rubric let through.',
    )
    out.push('')
    out.push('| Tutorial | Category | Relevance | Reason |')
    out.push('|----------|----------|-----------|--------|')
    for (const d of doc.lenientDisagreements.slice(0, 50)) {
      const r = d.reason.length > 90 ? `${d.reason.slice(0, 90)}…` : d.reason
      out.push(`| ${d.tutorialSlug} | ${d.category} | ${d.relevanceTier} | ${r.replace(/\|/g, '\\|')} |`)
    }
    if (doc.lenientDisagreements.length > 50) {
      out.push(`| _… ${doc.lenientDisagreements.length - 50} more in .json_ |  |  |  |`)
    }
    out.push('')
  }

  out.push('## Samples per tier per category')
  out.push('')
  const byCat = new Map<string, JoinedRow[]>()
  for (const e of doc.entries) {
    if (!byCat.has(e.category)) byCat.set(e.category, [])
    byCat.get(e.category)!.push(e)
  }
  for (const [cat, rows] of byCat) {
    out.push(`### ${cat}`)
    out.push('')
    for (const tier of ['EXACT', 'PARTIAL', 'WRONG'] as const) {
      const sample = rows.filter((r) => r.tier === tier).slice(0, 5)
      if (sample.length === 0) continue
      out.push(`**${tier}**`)
      out.push('')
      for (const s of sample) {
        out.push(`- \`${s.tutorialSlug}\` — ${s.tutorialTitle}`)
        out.push(`  - source: ${s.imageSource}, existing: ${s.existingVerificationStatus}, confidence: ${s.confidence}`)
        out.push(`  - reason: ${s.reason}`)
        out.push(`  - image: ${s.imageUrl}`)
      }
      out.push('')
    }
  }

  return out.join('\n') + '\n'
}

function rel(p: string): string {
  const root = resolve(__dirname, '..', '..', '..')
  if (p.startsWith(root)) return p.slice(root.length + 1).replace(/\\/g, '/')
  return p.replace(/\\/g, '/')
}

main()

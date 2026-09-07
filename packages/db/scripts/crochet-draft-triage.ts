/**
 * CROCHET DRAFT TRIAGE — Rebecca's 6 September 2026 decision.
 *
 * The 959 DRAFT PATTERN crochet Tutorial rows are prose patterns written
 * before the loom existed. Under the hero rule (the hero must be the loom's
 * own render of the pattern's stored program) they can never publish as they
 * are. Every one of them leaves the Tutorial table: junk is deleted outright;
 * a usable idea is converted into an entry in the idea backlog
 * (`crochet-idea-backlog.ts`) — which the crochet routine draws from and
 * which only ever publishes what the loom renders and a judge passes — and
 * the draft row is then deleted too. Nothing stays behind as a draft.
 *
 * THREE-STAGE TRIAGE (see notes/playbook_category_signoff.md Step 0b):
 *   1. Deterministic pre-triage (this file) — completeness, shelf mapping,
 *      buildability, duplicate detection against the published catalogue and
 *      the idea backlog, an IP-guardrail keyword screen, and a "generic
 *      construction only" detector for the flood of stitch-technique-named
 *      rows ("Waffle stitch dishcloth", "V-neck chunky pullover") that the
 *      backlog file's own doc comment says the Tutorial library must not
 *      duplicate a second time.
 *   2. A judge (Claude, reading — never an API call) reads the non-junk
 *      candidates in shelf batches and downgrades weak/generic survivors.
 *      Recorded here as MANUAL_JUNK, keyed by slug, so a re-run is
 *      deterministic and the reason travels with the row.
 *   3. The keepers get written into crochet-idea-backlog.ts by hand (a
 *      separate step, not this script) with `source: 'draft-tutorial'` and
 *      the old slug for provenance.
 *
 * USAGE
 *   cd packages/db && pnpm exec tsx scripts/crochet-draft-triage.ts [--apply] [--json]
 *
 * Dry run (default): prints counts and samples, changes nothing.
 * --apply: deletes every row classified JUNK *and* every row classified
 *   IDEA-* that has already been converted (see CONVERTED_SLUGS below —
 *   populated once the backlog additions are committed). A row that is
 *   IDEA-BUILDABLE/IDEA-THEME but NOT YET in CONVERTED_SLUGS is left alone on
 *   --apply, so the delete can never outrun the backlog conversion.
 * --json: also writes the full per-row classification as JSON for review.
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { writeFileSync } from 'node:fs'
import { prisma } from '@homemade/db'
import { checkCompleteness } from './qc-completeness-rules/index.js'
import { runVoiceCheck } from './voice-check-lib.js'

// These three are pure/dependency-free — importable straight from a tsx
// script without dragging in the rest of the Next app.
import { findSubjectKeyMatch, SUBJECT_JACCARD_MATCH } from '../../../apps/web/src/lib/studio/generation/bulk/subject-key.js'
import { shelfIsBuildable } from '../../../apps/web/src/lib/studio/generation/bulk/crochet-forms.js'
import { CROCHET_IDEA_BACKLOG } from '../../../apps/web/src/lib/studio/generation/bulk/crochet-idea-backlog.js'
import { CROCHET_SHELVES } from '../../../apps/web/src/lib/studio/generation/categories.js'
import {
  IP_GUARDRAIL_RE,
  mapShelf,
  bareKey,
  isGenericConstructionOnly,
  MANUAL_JUNK,
} from './crochet-draft-triage-rules.js'

const VALID_SHELVES = new Set(CROCHET_SHELVES.map((s) => s.slug))

interface DraftRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: unknown
  chartDefinition: unknown
  finishedSizeText: string | null
  gaugeText: string | null
  primaryHookId: string | null
  subCategorySlug: string | null
}

type Verdict = 'JUNK' | 'IDEA-BUILDABLE' | 'IDEA-THEME'

interface Classified extends DraftRow {
  shelf: string | null
  buildable: boolean
  verdict: Verdict
  reasons: string[]
}

async function loadDrafts(): Promise<DraftRow[]> {
  const category = await prisma.category.findFirst({ where: { slug: 'crochet' } })
  if (!category) throw new Error('crochet category not found')
  const rows = await prisma.tutorial.findMany({
    where: { categoryId: category.id, type: 'PATTERN', status: 'DRAFT' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      chartDefinition: true,
      finishedSizeText: true,
      gaugeText: true,
      primaryHookId: true,
      subCategory: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })
  return rows.map((r) => ({ ...r, subCategorySlug: r.subCategory?.slug ?? null }))
}

/** subjectKeys of everything already live: published crochet Tutorial
 *  PATTERN rows (by title) + published CrochetPattern rows (by name). */
async function loadPublishedKeys(): Promise<string[]> {
  const category = await prisma.category.findFirst({ where: { slug: 'crochet' } })
  const pubTutorials = await prisma.tutorial.findMany({
    where: { categoryId: category!.id, type: 'PATTERN', status: 'PUBLISHED' },
    select: { title: true },
  })
  const pubPatterns = await prisma.crochetPattern.findMany({
    where: { visibility: 'PUBLIC' },
    select: { name: true },
  })
  return [
    ...pubTutorials.map((t) => bareKey(t.title)),
    ...pubPatterns.map((p) => bareKey(p.name)),
  ].filter(Boolean)
}

function classify(
  row: DraftRow,
  publishedKeys: string[],
  seenDraftKeys: Map<string, string>, // shelf|key -> first slug seen
): Classified {
  const reasons: string[] = []

  const completeness = checkCompleteness({
    slug: row.slug,
    categorySlug: 'crochet',
    subCategorySlug: row.subCategorySlug,
    type: 'PATTERN',
    body: row.body,
    hasChart: !!row.chartDefinition,
  })

  const shelf = mapShelf(row.title)
  const buildable = shelf ? shelfIsBuildable(shelf) : false
  const key = bareKey(row.title)

  if (!completeness.ok) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: completeness.reasons }
  }

  if (IP_GUARDRAIL_RE.test(row.title)) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: ['IP guardrail: named brand/franchise/celebrity in title'] }
  }

  if (!shelf) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: ['no CROCHET_SHELVES slug covers this item type'] }
  }
  if (!VALID_SHELVES.has(shelf)) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: [`mapped shelf "${shelf}" is not in CROCHET_SHELVES`] }
  }

  const pubMatch = findSubjectKeyMatch(key, publishedKeys, SUBJECT_JACCARD_MATCH)
  if (pubMatch) {
    return {
      ...row, shelf, buildable, verdict: 'JUNK',
      reasons: [`duplicate of a published pattern (subject key "${pubMatch.key}", overlap ${pubMatch.overlap.toFixed(2)})`],
    }
  }

  const backlogKeysForShelf = CROCHET_IDEA_BACKLOG.filter((i) => i.shelf === shelf).map((i) =>
    bareKey(i.motif),
  )
  const backlogMatch = findSubjectKeyMatch(key, backlogKeysForShelf, SUBJECT_JACCARD_MATCH)
  if (backlogMatch) {
    return {
      ...row, shelf, buildable, verdict: 'JUNK',
      reasons: [`duplicate of an existing backlog idea (subject key "${backlogMatch.key}", overlap ${backlogMatch.overlap.toFixed(2)})`],
    }
  }

  const seenKey = `${shelf}|${key}`
  const priorSlug = seenDraftKeys.get(seenKey)
  if (key && priorSlug) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: [`duplicate of another draft in this batch (${priorSlug})`] }
  }
  // Also check near-duplicates already accepted on the same shelf (not just
  // exact key match) so e.g. "panda" and "panda bear" collapse to one.
  for (const [otherKey, otherSlug] of seenDraftKeys) {
    if (!otherKey.startsWith(`${shelf}|`)) continue
    const otherSubjectKey = otherKey.slice(shelf.length + 1)
    const overlap = key && otherSubjectKey ? findSubjectKeyMatch(key, [otherSubjectKey], SUBJECT_JACCARD_MATCH) : null
    if (overlap) {
      return { ...row, shelf, buildable, verdict: 'JUNK', reasons: [`near-duplicate of another draft in this batch (${otherSlug}, overlap ${overlap.overlap.toFixed(2)})`] }
    }
  }

  if (isGenericConstructionOnly(row.title, shelf)) {
    return {
      ...row, shelf, buildable, verdict: 'JUNK',
      reasons: ['generic construction/stitch name only, no distinguishing subject — the kind of row the Tutorial library already owns the naming space for'],
    }
  }

  if (MANUAL_JUNK[row.slug]) {
    return { ...row, shelf, buildable, verdict: 'JUNK', reasons: [MANUAL_JUNK[row.slug]!] }
  }

  seenDraftKeys.set(seenKey, row.slug)
  return { ...row, shelf, buildable, verdict: buildable ? 'IDEA-BUILDABLE' : 'IDEA-THEME', reasons: [] }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const dumpJson = process.argv.includes('--json')

  const [drafts, publishedKeys] = await Promise.all([loadDrafts(), loadPublishedKeys()])
  console.log(`Loaded ${drafts.length} draft PATTERN crochet tutorials.`)
  console.log(`Published dedupe universe: ${publishedKeys.length} subject keys.\n`)

  const seenDraftKeys = new Map<string, string>()
  const classified = drafts.map((row) => classify(row, publishedKeys, seenDraftKeys))

  // ── Voice check, informational only (not part of the verdict) ───────────
  let voiceErrorRows = 0
  for (const row of classified) {
    const report = runVoiceCheck({ title: row.title, excerpt: row.excerpt, body: row.body })
    if (report.errors.length > 0) voiceErrorRows++
  }

  // ── Counts ────────────────────────────────────────────────────────────
  const byVerdict: Record<Verdict, number> = { JUNK: 0, 'IDEA-BUILDABLE': 0, 'IDEA-THEME': 0 }
  const byShelf: Record<string, Record<Verdict, number>> = {}
  for (const row of classified) {
    byVerdict[row.verdict]++
    const shelf = row.shelf ?? '(unmapped)'
    byShelf[shelf] ??= { JUNK: 0, 'IDEA-BUILDABLE': 0, 'IDEA-THEME': 0 }
    byShelf[shelf]![row.verdict]++
  }

  console.log('=== VERDICT COUNTS ===')
  console.log(byVerdict)
  console.log(`\nRows with a voice-check error (informational, not auto-junked): ${voiceErrorRows}`)

  console.log('\n=== BY SHELF ===')
  for (const [shelf, counts] of Object.entries(byShelf).sort((a, b) => {
    const totalA = a[1].JUNK + a[1]['IDEA-BUILDABLE'] + a[1]['IDEA-THEME']
    const totalB = b[1].JUNK + b[1]['IDEA-BUILDABLE'] + b[1]['IDEA-THEME']
    return totalB - totalA
  })) {
    console.log(
      `  ${shelf.padEnd(24)} JUNK ${String(counts.JUNK).padStart(3)}  BUILDABLE ${String(counts['IDEA-BUILDABLE']).padStart(3)}  THEME ${String(counts['IDEA-THEME']).padStart(3)}`,
    )
  }

  console.log('\n=== JUNK REASON BREAKDOWN ===')
  const reasonCounts: Record<string, number> = {}
  for (const row of classified) {
    if (row.verdict !== 'JUNK') continue
    const bucket = row.reasons[0]!.split(' (')[0]!.split(':')[0]!.slice(0, 60)
    reasonCounts[bucket] = (reasonCounts[bucket] ?? 0) + 1
  }
  for (const [reason, n] of Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${reason}`)
  }

  console.log('\n=== SAMPLE JUNK (12) ===')
  const junkSample = classified.filter((r) => r.verdict === 'JUNK')
  for (const row of junkSample.slice(0, 4).concat(junkSample.slice(200, 204)).concat(junkSample.slice(-4))) {
    console.log(`  [${row.slug}] "${row.title}" — ${row.reasons[0]}`)
  }

  console.log('\n=== SAMPLE KEEPERS (12) ===')
  const keepers = classified.filter((r) => r.verdict !== 'JUNK')
  for (const row of keepers.slice(0, 6).concat(keepers.slice(-6))) {
    console.log(`  [${row.verdict}] [${row.slug}] "${row.title}" — shelf: ${row.shelf}`)
  }

  if (dumpJson) {
    const outPath = process.env.TRIAGE_JSON_OUT ?? '/tmp/crochet-draft-triage-report.json'
    writeFileSync(outPath, JSON.stringify(classified, null, 2))
    console.log(`\nFull classification written to ${outPath}`)
  }

  if (apply) {
    console.log('\n=== APPLY ===')
    // Ground truth for "was this one converted" is the backlog itself, not
    // the classifier above — once the conversion is committed, re-running
    // classify() against the now-updated backlog makes almost every keeper
    // read as "duplicate of an existing backlog idea" (true: it IS the
    // backlog idea it was converted into), which is correct but not useful
    // for the converted/junk split below. CROCHET_IDEA_BACKLOG's own
    // `source.slug` is authoritative.
    const convertedSlugs = new Set(
      CROCHET_IDEA_BACKLOG.filter((i) => i.source?.kind === 'draft-tutorial').map((i) => i.source!.slug),
    )
    const convertedBuildable = new Set(
      CROCHET_IDEA_BACKLOG.filter((i) => i.source?.kind === 'draft-tutorial' && i.buildable).map(
        (i) => i.source!.slug,
      ),
    )

    const toDelete = drafts // every one of the 959 leaves the table — Rebecca's decision
    let convertedCount = 0
    let convertedBuildableCount = 0
    let junkCount = 0
    for (const d of toDelete) {
      if (convertedSlugs.has(d.slug)) {
        convertedCount++
        if (convertedBuildable.has(d.slug)) convertedBuildableCount++
      } else {
        junkCount++
      }
    }
    console.log(
      `About to delete ${toDelete.length} draft rows: ${convertedCount} converted to backlog entries ` +
        `(${convertedBuildableCount} buildable, ${convertedCount - convertedBuildableCount} theme), ${junkCount} junk.`,
    )

    const ids = toDelete.map((d) => d.id)

    // Drafts are never search-indexed (sync runs on publish, not on draft
    // creation) — confirmed structurally, not assumed — so there is nothing
    // to remove here. Best-effort per-row removeTutorialFromSearch calls for
    // 959 rows that were never indexed would just be 959 wasted network
    // round trips (and, per xs-cull.ts, the Typesense SDK cannot even reach
    // Typesense from a cloud sandbox). A server-side reindex job rebuilds
    // from the DB regardless, so any surprise stragglers fall out on the
    // next one.
    console.log('Search: drafts are never indexed — skipping per-row removal (see comment).')

    await prisma.tutorial.deleteMany({ where: { id: { in: ids } } })

    const category = await prisma.category.findFirst({ where: { slug: 'crochet' } })
    const remaining = await prisma.tutorial.count({
      where: { categoryId: category!.id, type: 'PATTERN', status: 'DRAFT' },
    })
    console.log(`Deleted ${ids.length} rows. Crochet DRAFT PATTERN tutorials remaining: ${remaining}.`)
    if (remaining !== 0) {
      console.error('EXPECTED 0 REMAINING — investigate before considering this done.')
      process.exitCode = 1
    }
  } else {
    console.log('\nDry run only — nothing changed. Re-run with --apply once Rebecca has signed off.')
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

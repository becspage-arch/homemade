import { prisma, TutorialStatus, PipelineStatus, Visibility } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { anthropicConfigured } from '@/lib/anthropic'
import { PATTERN_CATEGORIES, CROSS_STITCH_SHELVES, CROCHET_SHELVES } from '@/lib/studio/generation/categories'
import { PATTERN_LED_CATEGORY_SLUGS, isPatternLedSlug, patternLedCraftStats } from '@/lib/pattern-led-category-counts'
import { autopilotStates, crossStitchSourceMode, crossStitchGateMode, makerPhotoGateMode } from '@/lib/studio/generation/bulk/autopilot-state'
import { candidateStats, candidateWarnings, CANDIDATE_SWEEP_DAYS } from '@/lib/studio/generation/bulk/candidates'
import { liveShelfCounts } from '@/lib/studio/generation/bulk/dedupe-guard'
import { liveCrochetShelfCounts } from '@/lib/studio/generation/bulk/crochet-dedupe'
import { shelfIsBuildable } from '@/lib/studio/generation/bulk/crochet-forms'
import {
  crossStitchSpendWindow,
  approxSpend,
  XS_DAILY_GENERATION_CAP,
  XS_DAILY_PRO_CAP,
  SCHNELL_UNIT_COST,
  PRO_UNIT_COST,
  crochetSpendWindow,
  approxCrochetSpend,
  CROCHET_DAILY_RENDER_CAP,
  CROCHET_DAILY_ILLUSTRATION_CAP,
  CROCHET_RENDER_UNIT_COST,
} from '@/lib/studio/generation/bulk/spend-guard'
import { RunBatchControl, AutopilotToggle, SourceModeToggle, GateModeToggle, PhotoGateModeToggle } from './run-controls'
import type { BulkCraft } from './actions'

export const dynamic = 'force-dynamic'

const INNGEST_DASHBOARD_URL = 'https://app.inngest.com/env/production/functions'

/**
 * Category ceilings — the cron idles once a craft hits its target. The
 * cross-stitch number is DERIVED from the per-shelf targets in categories.ts, so
 * this page and the Inngest job read the same one source. BULK_XS_TARGET is an
 * ops override only.
 */
const XS_TARGET = Number(process.env.BULK_XS_TARGET) || PATTERN_CATEGORIES['cross-stitch']!.patternTarget
const NW_TARGET = Number(process.env.BULK_NW_TARGET) || 1500
const CR_TARGET = Number(process.env.BULK_CROCHET_TARGET) || PATTERN_CATEGORIES.crochet!.patternTarget

/** A run whose counters have not moved for this long is dead, not slow. */
const STALL_HOURS = 6

function relativeTime(when: Date): string {
  const diff = Date.now() - when.getTime()
  const s = Math.floor(Math.max(0, diff) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function stateBadge(status: PipelineStatus): { text: string; color: string } {
  if (status === PipelineStatus.COMPLETE) return { text: 'At target', color: 'var(--color-espresso)' }
  if (status === PipelineStatus.NOT_READY) return { text: 'Not signed off', color: 'var(--color-warm-taupe)' }
  return { text: 'On demand', color: 'var(--color-sage)' }
}

interface RunRow {
  id: string
  craft: string
  trigger: string
  requested: number
  published: number
  culled: number
  duplicates: number
  skipped: number
  parked: number
  repaired: number
  generations: number
  proGenerations: number
  modelBriefs: number
  paleSkips: number
  propRejects: number
  collisionRejects: number
  dressedBriefs: number
  errors: number
  killReasons: string[]
  rejectSamples: unknown
  startedAt: Date
  updatedAt: Date
  finishedAt: Date | null
  skipReason: string | null
}

/** Most common cull reason in a run — the "why did it dip" signal. */
function topKill(reasons: string[]): string | null {
  if (!reasons?.length) return null
  const counts = new Map<string, number>()
  for (const r of reasons) counts.set(r, (counts.get(r) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0]
}

function runLine(r: RunRow): string {
  const tag = r.trigger === 'cron' ? 'auto' : 'manual'
  if (r.requested === 0 && r.skipReason) return `[${tag}] ${r.craft}: skipped — ${r.skipReason}`
  const done = r.published + r.culled + r.duplicates + r.errors + r.skipped + r.parked
  const inflight = !r.finishedAt && done < r.requested ? ` · ${done}/${r.requested} done…` : ''
  const stalled = isStalled(r) ? ' · STALLED' : ''
  const kill = topKill(r.killReasons)
  const killNote = kill ? ` · top kill: “${kill}”` : ''
  // A run that fell back to the pool sampler reads as a normal run otherwise.
  const authored =
    r.craft === 'cross-stitch' && r.requested > 0
      ? ` · ${r.modelBriefs}/${r.requested} briefs model-authored${r.modelBriefs < r.requested ? ' (rest sampled)' : ''}`
      : ''
  const pale = r.paleSkips > 0 ? ` · ${r.paleSkips} pale (rejected before the gate)` : ''
  // The brief post-filter's work, before a single Flux call was paid for.
  const props = r.propRejects > 0 ? ` · ${r.propRejects} briefs rejected for props` : ''
  const clashes = r.collisionRejects > 0 ? ` · ${r.collisionRejects} rejected as within-batch repeats` : ''
  // All-verbatim reads as a healthy run from every other counter, so it is stated.
  const dressed =
    r.craft === 'cross-stitch' && r.requested > 0 ? ` · ${r.dressedBriefs}/${r.requested} re-dressed` : ''
  // CANDIDATES MODE reads differently, and saying "0 published" about a run that
  // parked twelve candidates is simply wrong: `parked` is what the firing did,
  // and `published` / `culled` are what a session decided about it afterwards.
  if (r.parked > 0) {
    return `[${tag}] ${r.craft}: ${r.parked} parked, ${r.published} kept, ${r.culled} rejected, ${r.duplicates} duplicates, ${r.skipped} skipped, ${r.generations} gens (${r.proGenerations} Pro), ${r.errors} errors (of ${r.requested})${pale}${inflight}${stalled}${killNote}`
  }
  return `[${tag}] ${r.craft}: ${r.published} published, ${r.culled} culled, ${r.duplicates} duplicates, ${r.skipped} skipped, ${r.repaired} repairs, ${r.generations} gens (${r.proGenerations} Pro), ${r.errors} errors (of ${r.requested})${authored}${pale}${props}${clashes}${dressed}${inflight}${stalled}${killNote}`
}

/** One kept render from a run — what the gate threw away. */
interface RejectSampleRow {
  slug: string
  attempt: number
  url: string
  verdict: string
  reasons: string[]
  lane: string
  shelf: string
  colours: number
}

/**
 * The reject samples on a run, defensively read: the column is Json, written by
 * a different deploy than the one rendering it, so anything shaped wrong is
 * simply not shown.
 */
function rejectSamplesOf(raw: unknown): RejectSampleRow[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (r): r is RejectSampleRow =>
      Boolean(r) && typeof r === 'object' && typeof (r as RejectSampleRow).url === 'string' && typeof (r as RejectSampleRow).slug === 'string',
  )
}

/**
 * WHAT THE GATE KILLED — a strip of the run's rejected renders, reason on hover.
 *
 * A cull used to leave one sentence behind, which is no way to tell a correct
 * kill from an over-tight guard. Small on purpose: it is a glance, and the
 * contact sheet (apps/web/scripts/xs-rejects-sheet.ts) is the close look.
 */
function RejectStrip({ samples }: { samples: RejectSampleRow[] }) {
  if (!samples.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '4px 0 8px' }}>
      {samples.map((s) => (
        <a
          key={`${s.slug}-a${s.attempt}`}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          title={`${s.slug} · attempt ${s.attempt} · ${s.lane}/${s.shelf} · ${s.colours} colours · ${s.verdict} — ${s.reasons.join('; ')}`}
          style={{ display: 'block', lineHeight: 0, border: '0.5px solid var(--color-warm-taupe)', borderRadius: 3, overflow: 'hidden' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.url} alt={`${s.slug} — ${s.verdict}`} width={54} height={54} style={{ objectFit: 'cover', display: 'block' }} />
        </a>
      ))}
    </div>
  )
}

/** A run still open long after its counters stopped moving. */
function isStalled(r: RunRow): boolean {
  return !r.finishedAt && Date.now() - new Date(r.updatedAt).getTime() > STALL_HOURS * 60 * 60 * 1000
}

/**
 * The health banner. An unattended autopilot's only failure signal is its own
 * output, so three shapes of nothing are called out at the top of the page:
 * the last finished run produced no gems, the last three produced none between
 * them, or a run died mid-fan-out and never finished.
 */
function healthWarnings(runs: RunRow[]): string[] {
  const xs = runs.filter((r) => r.craft === 'cross-stitch' && r.requested > 0)
  const out: string[] = []
  const finished = xs.filter((r) => r.finishedAt)
  const last = finished[0]
  if (last && last.published === 0) {
    out.push(`The most recent finished cross-stitch run published nothing (${last.culled} culled, ${last.duplicates} duplicates, ${last.errors} errors of ${last.requested}).`)
  }
  const lastThree = finished.slice(0, 3)
  if (lastThree.length === 3 && lastThree.reduce((n, r) => n + r.published, 0) === 0) {
    out.push('The last three finished cross-stitch runs published nothing between them — the gate, the planner or the duplicate guard is rejecting everything.')
  }
  const stalled = xs.filter(isStalled)
  if (stalled.length) {
    out.push(`${stalled.length} cross-stitch run${stalled.length === 1 ? '' : 's'} stalled — no progress for over ${STALL_HOURS} hours.`)
  }
  return out
}

const H2: React.CSSProperties = { fontFamily: 'var(--font-fraunces)', fontSize: 22, margin: '0 0 12px', color: 'var(--color-espresso)' }
const LORA_SM: React.CSSProperties = { fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }

function ProgressBar({ pct, full }: { pct: number; full: boolean }) {
  return (
    <div style={{ height: 6, background: 'var(--color-linen-grey)', borderRadius: 3, overflow: 'hidden', maxWidth: 320 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: full ? 'var(--color-espresso)' : 'var(--color-sage)', borderRadius: 3 }} />
    </div>
  )
}

interface ShelfProgress {
  slug: string
  name: string
  count: number
  target: number
  hold: boolean
  /** Crochet only: the loom cannot build this item type yet, so it has no
   *  generation lane and sits at its target waiting for the engine. */
  waiting?: boolean
}

/**
 * A craft's daily spend line. The two crafts spend on different things — a
 * cross-stitch idea is a Flux image, a crochet idea is a Fargate render — so
 * the card takes the labels rather than assuming Flux.
 */
interface SpendLine {
  used: number
  cap: number
  unit: string
  secondUsed: number
  secondCap: number
  secondUnit: string
  approx: number
  note: string
}

function CraftCard({
  name,
  published,
  target,
  autopilotOn,
  sourceMode,
  sourceModeLocked,
  gateMode,
  gateModeLocked,
  disabled,
  disabledReason,
  craft,
  defaultCount,
  extraNote,
  shelves,
  spend,
}: {
  name: string
  published: number
  target: number
  autopilotOn: boolean
  sourceMode?: string
  sourceModeLocked?: string
  gateMode?: string
  gateModeLocked?: string
  disabled: boolean
  disabledReason?: string
  craft: BulkCraft
  defaultCount: number
  extraNote?: string
  shelves?: ShelfProgress[]
  spend?: SpendLine
}) {
  const pct = target > 0 ? Math.min(100, Math.round((published / target) * 100)) : 0
  const full = published >= target
  return (
    <article className="admin-kpi-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 19, margin: 0, color: 'var(--color-espresso)' }}>{name}</h3>
        {full && <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>At target</span>}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 14, color: 'var(--color-espresso)', marginBottom: 6 }}>
          {published.toLocaleString()}
          <span style={{ color: 'var(--color-warm-taupe)' }}> / {target.toLocaleString()} published</span>
        </div>
        <ProgressBar pct={pct} full={full} />
      </div>
      {spend && (
        <p style={{ ...LORA_SM, margin: 0, lineHeight: 1.6 }}>
          Last 24h: <strong style={{ color: spend.used >= spend.cap ? 'var(--color-burnt-sienna)' : 'var(--color-espresso)' }}>{spend.used}</strong>/{spend.cap} {spend.unit}
          {'  ·  '}
          <strong style={{ color: spend.secondUsed >= spend.secondCap ? 'var(--color-burnt-sienna)' : 'var(--color-espresso)' }}>{spend.secondUsed}</strong>/{spend.secondCap} {spend.secondUnit}
          {'  ·  '}≈&nbsp;${spend.approx.toFixed(2)} spend
          <br />
          <span style={{ fontSize: 11 }}>{spend.note}</span>
        </p>
      )}
      {shelves && shelves.length > 0 && (
        <div>
          <div style={{ ...LORA_SM, marginBottom: 6 }}>
            Shelves (published / target · “hold” = at the size it should be, never generated into · “no lane yet” = the
            loom cannot build that shape yet, so nothing is planned for it)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {shelves.map((sh) => {
              const done = sh.count >= sh.target
              return (
                <span
                  key={sh.slug}
                  title={`${sh.slug}${sh.hold ? ' (hold)' : sh.waiting ? ' (the loom cannot build this shape yet)' : ''}`}
                  style={{
                    fontFamily: 'var(--font-lora)',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: 'var(--color-linen-grey)',
                    color:
                      sh.hold || sh.waiting
                        ? 'var(--color-warm-taupe)'
                        : done
                          ? 'var(--color-espresso)'
                          : 'var(--color-burnt-sienna)',
                    opacity: sh.hold || sh.waiting ? 0.6 : 1,
                  }}
                >
                  {sh.name} {sh.count}/{sh.target}
                  {sh.hold ? ' · hold' : sh.waiting ? ' · no lane yet' : ''}
                </span>
              )
            })}
          </div>
        </div>
      )}
      {extraNote && <p style={{ ...LORA_SM, margin: 0, lineHeight: 1.5 }}>{extraNote}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
        <AutopilotToggle craft={craft} enabled={autopilotOn} />
        {gateMode && <GateModeToggle mode={gateMode} locked={gateModeLocked} />}
        {sourceMode && <SourceModeToggle mode={sourceMode} locked={sourceModeLocked} />}
        <RunBatchControl craft={craft} defaultCount={defaultCount} disabled={disabled} disabledReason={disabledReason} />
      </div>
    </article>
  )
}

export default async function AdminBulkGenerationPage() {
  const actor = await getCurrentDbUser()
  if (!actor || !isAdmin(actor)) redirect('/admin')

  const [
    xsCount,
    nwCount,
    crCount,
    recent,
    categoriesRaw,
    publishedTutorialRows,
    subCats,
    craftStats,
  ] = await Promise.all([
    prisma.pattern.count({ where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC } }),
    prisma.needleworkPattern.count({ where: { ownerUserId: null, visibility: Visibility.PUBLIC } }),
    prisma.crochetPattern.count({ where: { ownerUserId: null, visibility: Visibility.PUBLIC } }),
    prisma.bulkRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: {
        id: true, craft: true, trigger: true, requested: true, published: true,
        culled: true, duplicates: true, skipped: true, parked: true, repaired: true, generations: true,
        proGenerations: true, modelBriefs: true, paleSkips: true, propRejects: true,
        collisionRejects: true, dressedBriefs: true, errors: true, killReasons: true,
        rejectSamples: true, startedAt: true, updatedAt: true,
        finishedAt: true, skipReason: true,
      },
    }),
    prisma.category.findMany({
      orderBy: [{ launchOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, slug: true, name: true, pipelineStatus: true, targetTutorialCount: true, lastAutopilotRunAt: true },
    }),
    prisma.tutorial.groupBy({ by: ['categoryId'], where: { status: TutorialStatus.PUBLISHED }, _count: { _all: true } }),
    // Sub-categories for every pattern-led category (not just the two with a
    // PATTERN_CATEGORIES entry) so needlework/knitting/sewing get a
    // published-per-shelf breakdown too.
    prisma.subCategory.findMany({
      where: { category: { slug: { in: [...PATTERN_LED_CATEGORY_SLUGS] } } },
      select: { id: true, name: true, categoryId: true },
    }),
    // Published/draft/per-sub-category counts for all five pattern-led
    // categories, each read from its own table — see
    // pattern-led-category-counts.ts. Crochet, needlework, knitting and
    // sewing each have their own model; only cross-stitch shares `Pattern`.
    patternLedCraftStats(),
  ])

  const publishedTutorialsByCategoryId = new Map(publishedTutorialRows.map((r) => [r.categoryId, r._count._all]))
  const patternCountBySubcatId = new Map<string, number>()
  for (const stat of Object.values(craftStats)) {
    for (const [id, count] of stat.publishedBySubCategoryId) patternCountBySubcatId.set(id, count)
  }
  const subcatsByCategoryId = new Map<string, { name: string; count: number }[]>()
  for (const sc of subCats) {
    const list = subcatsByCategoryId.get(sc.categoryId) ?? []
    list.push({ name: sc.name, count: patternCountBySubcatId.get(sc.id) ?? 0 })
    subcatsByCategoryId.set(sc.categoryId, list)
  }
  for (const list of subcatsByCategoryId.values()) list.sort((a, b) => b.count - a.count)

  const [shelfCounts, spendWindow, crochetShelfCounts, crochetSpend] = await Promise.all([
    liveShelfCounts().catch(() => ({}) as Record<string, number>),
    crossStitchSpendWindow().catch(() => ({ generations: 0, proGenerations: 0, since: new Date() })),
    liveCrochetShelfCounts().catch(() => ({}) as Record<string, number>),
    crochetSpendWindow().catch(() => ({ generations: 0, proGenerations: 0, since: new Date() })),
  ])
  const xsShelves: ShelfProgress[] = CROSS_STITCH_SHELVES.map((sh) => ({
    slug: sh.slug,
    name: sh.name,
    count: shelfCounts[sh.slug] ?? 0,
    target: sh.target,
    hold: Boolean(sh.hold),
  })).sort((a, b) => Number(a.hold) - Number(b.hold) || b.target - a.target || a.slug.localeCompare(b.slug))
  // Crochet lists every item type it means to fill, with the ones the loom
  // cannot build yet shown greyed as "no lane yet" — so the gap between the
  // catalogue's ambition and the engine's reach is visible rather than implied.
  const crochetShelves: ShelfProgress[] = CROCHET_SHELVES.map((sh) => ({
    slug: sh.slug,
    name: sh.name,
    count: crochetShelfCounts[sh.slug] ?? 0,
    target: sh.target,
    hold: Boolean(sh.hold),
    waiting: !shelfIsBuildable(sh.slug),
  })).sort(
    (a, b) =>
      Number(a.waiting) - Number(b.waiting) || b.target - a.target || a.slug.localeCompare(b.slug),
  )
  const warnings = healthWarnings(recent as RunRow[])


  const gateWired = anthropicConfigured()
  const renderWired = process.env.LOOM_RENDER === 'fargate'
  const autopilot = await autopilotStates()
  const xsSourceMode = await crossStitchSourceMode().catch(() => 'schnell')
  const xsGateMode = await crossStitchGateMode().catch(() => 'candidates')
  const photoGateMode = await makerPhotoGateMode().catch(() => 'api')
  const candidates = await candidateStats().catch(() => ({ pending: 0, oldest: null, lastJudgedAt: null }))
  const candidateWarns = candidateWarnings(candidates)
  const xsAutopilot = autopilot['cross-stitch']
  const nwAutopilot = autopilot.needlework
  const crAutopilot = autopilot.crochet

  // In candidates mode a batch does not need the API gate wired at all — it
  // parks candidates for a session to judge — so "Run a batch" stays live.
  const xsDisabled = xsGateMode === 'api' && !gateWired
  const nwDisabled = !gateWired || !renderWired
  const nwDisabledReason = !gateWired ? 'Gate not wired.' : !renderWired ? 'Fargate render not wired.' : undefined
  const crDisabled = !gateWired || !renderWired
  const crDisabledReason = !gateWired
    ? 'Gate not wired.'
    : !renderWired
      ? 'Fargate render not wired, so a pattern could not hero itself.'
      : undefined

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Bulk generation</h1>
          <p>
            Server-side catalogue fill for the pattern crafts. Each batch plans varied briefs across the
            full complexity range, generates on the shared engine, runs the ruthless keep-or-kill vision
            gate, and publishes only the gems — stopping automatically at each craft&rsquo;s target. Run one
            on demand below, or let the cron fill in the background. Every run — manual and automatic —
            is recorded under Recent runs below (published / culled / regenerations / errors + top kill
            reasons); live per-step logs are in the{' '}
            <a href={INNGEST_DASHBOARD_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-sage)' }}>Inngest dashboard</a>.
          </p>
        </div>
      </div>

      {[...warnings, ...candidateWarns].length > 0 && (
        <section
          style={{
            marginBottom: 20,
            padding: '14px 16px',
            borderRadius: 4,
            border: '0.5px solid var(--color-burnt-sienna)',
            background: 'var(--color-cream)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, margin: '0 0 8px', color: 'var(--color-burnt-sienna)' }}>
            The cross-stitch autopilot needs a look
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            {[...warnings, ...candidateWarns].map((w) => (
              <li key={w} style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-espresso)' }}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Generation status: wiring ─────────────────────────────────── */}
      <section style={{ marginBottom: 20 }}>
        <p style={{ ...LORA_SM, margin: 0, lineHeight: 1.7 }}>
          Cross-stitch judging:{' '}
          <strong style={{ color: 'var(--color-espresso)' }}>
            {xsGateMode === 'candidates' ? 'Claude sessions (no API spend on the cron path)' : 'the API vision gate'}
          </strong>
          {'  ·  '}Vision gate: <strong style={{ color: gateWired ? 'var(--color-sage)' : 'var(--color-burnt-sienna)' }}>{gateWired ? 'wired' : 'not wired'}</strong>
          {'  ·  '}Needlework render (Fargate): <strong style={{ color: renderWired ? 'var(--color-sage)' : 'var(--color-burnt-sienna)' }}>{renderWired ? 'wired' : 'not wired'}</strong>
          <br />
          Candidates waiting to be judged:{' '}
          <strong style={{ color: candidates.pending > 0 ? 'var(--color-espresso)' : 'var(--color-warm-taupe)' }}>{candidates.pending}</strong>
          {candidates.oldest ? ` · oldest ${relativeTime(candidates.oldest)}` : ''}
          {candidates.lastJudgedAt ? ` · last judged ${relativeTime(candidates.lastJudgedAt)}` : ' · never judged'}
          {'  ·  '}Maker photos: <strong style={{ color: 'var(--color-espresso)' }}>{photoGateMode === 'api' ? 'checked on upload' : 'checked by the routine'}</strong>
          <br />
          <span style={{ fontSize: 11 }}>
            A candidate is an UNLISTED pattern: it reaches no public page, no sitemap, no search index and no
            public count until a session keeps it. Anything still un-judged after {CANDIDATE_SWEEP_DAYS} days is
            retired as rejected with the reason “unjudged”.
          </span>
        </p>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PhotoGateModeToggle
            mode={photoGateMode}
            locked={process.env.MAKER_PHOTO_GATE_MODE ? `Pinned to “${process.env.MAKER_PHOTO_GATE_MODE}” by MAKER_PHOTO_GATE_MODE.` : undefined}
          />
        </div>
      </section>

      {/* ── The two bulk crafts ───────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>Craft generation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <CraftCard
            name="Cross-stitch"
            published={xsCount}
            target={XS_TARGET}
            autopilotOn={xsAutopilot}
            sourceMode={xsSourceMode}
            sourceModeLocked={
              process.env.BULK_XS_SOURCE_MODE ? `Pinned to “${process.env.BULK_XS_SOURCE_MODE}” by BULK_XS_SOURCE_MODE.` : undefined
            }
            gateMode={xsGateMode}
            gateModeLocked={
              process.env.BULK_XS_GATE_MODE ? `Pinned to “${process.env.BULK_XS_GATE_MODE}” by BULK_XS_GATE_MODE.` : undefined
            }
            disabled={xsDisabled}
            disabledReason={xsDisabled ? 'Gate not wired — a batch would publish nothing.' : undefined}
            craft="cross-stitch"
            defaultCount={xsGateMode === 'candidates' ? 12 : 10}
            shelves={xsShelves}
            spend={{
              used: spendWindow.generations,
              cap: XS_DAILY_GENERATION_CAP,
              unit: 'generations',
              secondUsed: spendWindow.proGenerations,
              secondCap: XS_DAILY_PRO_CAP,
              secondUnit: 'Flux Pro',
              approx: approxSpend(spendWindow),
              note: `Approximate, costed at $${SCHNELL_UNIT_COST.toFixed(3)} per schnell generation and $${PRO_UNIT_COST.toFixed(3)} per Flux Pro generation. At either cap the batch skips rather than spends.`,
            }}
          />
          <CraftCard
            name="Needlework"
            published={nwCount}
            target={NW_TARGET}
            autopilotOn={nwAutopilot}
            disabled={nwDisabled}
            disabledReason={nwDisabledReason}
            craft="needlework"
            defaultCount={4}
            extraNote="Each piece renders individually on AWS, so needlework is slower + pricier than cross-stitch."
          />
          <CraftCard
            name="Crochet"
            published={crCount}
            target={CR_TARGET}
            autopilotOn={crAutopilot}
            disabled={crDisabled}
            disabledReason={crDisabledReason}
            craft="crochet"
            defaultCount={6}
            shelves={crochetShelves}
            spend={{
              used: crochetSpend.generations,
              cap: CROCHET_DAILY_RENDER_CAP,
              unit: 'renders',
              secondUsed: crochetSpend.proGenerations,
              secondCap: CROCHET_DAILY_ILLUSTRATION_CAP,
              secondUnit: 'illustrations',
              approx: approxCrochetSpend(crochetSpend),
              note: `Approximate, costed at $${CROCHET_RENDER_UNIT_COST.toFixed(3)} per Fargate render and $${PRO_UNIT_COST.toFixed(3)} per illustration. At either cap the batch skips rather than spends.`,
            }}
            extraNote="Every pattern heroes itself: the loom renders its own stitch program on AWS, which takes minutes per piece, so batches are small. Only the shelves with a lane are planned into."
          />
        </div>
      </section>

      {/* ── Library progress across every category ────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>Library progress</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ width: 120 }}>State</th>
                <th style={{ width: 200 }}>Published / target</th>
                <th style={{ width: 130 }}>Last filled</th>
              </tr>
            </thead>
            <tbody>
              {categoriesRaw.map((cat) => {
                const cfg = PATTERN_CATEGORIES[cat.slug]
                const craftStat = isPatternLedSlug(cat.slug) ? craftStats[cat.slug] : undefined
                const isPatternLed = craftStat != null
                // Every pattern-led category reads from its own table via
                // craftStats (cross-stitch included) — never tutorials.
                const published = craftStat ? craftStat.published : publishedTutorialsByCategoryId.get(cat.id) ?? 0
                // cross-stitch and crochet have a proper shelf-derived target;
                // needlework/knitting/sewing have no sign-off pass yet, so
                // `targetTutorialCount` is the only target number that exists.
                const target = cfg ? cfg.patternTarget : cat.targetTutorialCount
                const unit = isPatternLed ? 'patterns' : 'guides'
                const pct = target && target > 0 ? Math.min(100, Math.round((published / target) * 100)) : 0
                const badge = stateBadge(cat.pipelineStatus)
                const breakdown = isPatternLed ? subcatsByCategoryId.get(cat.id) ?? [] : []
                return (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 15, color: 'var(--color-espresso)' }}>{cat.name}</div>
                      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: 'var(--color-warm-taupe)' }}>{cat.slug} · {unit}</div>
                      {breakdown.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {breakdown.map((b) => (
                            <span key={b.name} title={`${b.count} ${unit}`} style={{ fontFamily: 'var(--font-lora)', fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--color-linen-grey)', color: b.count === 0 ? 'var(--color-burnt-sienna)' : 'var(--color-espresso)' }}>
                              {b.name} {b.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: badge.color }}>{badge.text}</span>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-espresso)', marginBottom: 4 }}>
                        {published.toLocaleString()}
                        {target != null && <span style={{ color: 'var(--color-warm-taupe)' }}> / {target.toLocaleString()}</span>}
                      </div>
                      {target != null && target > 0 && <ProgressBar pct={pct} full={cat.pipelineStatus === PipelineStatus.COMPLETE} />}
                    </td>
                    <td style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
                      {cat.lastAutopilotRunAt ? relativeTime(cat.lastAutopilotRunAt) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Recent runs (manual + automatic cron) ─────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>Recent runs</h2>
        {recent.length === 0 ? (
          <p style={{ ...LORA_SM, margin: 0 }}>No runs recorded yet.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            {recent.map((r) => (
              <li key={r.id} style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-espresso)' }}>
                <span style={{ color: 'var(--color-warm-taupe)' }}>{relativeTime(new Date(r.startedAt))}</span> — {runLine(r)}
                <RejectStrip samples={rejectSamplesOf(r.rejectSamples)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

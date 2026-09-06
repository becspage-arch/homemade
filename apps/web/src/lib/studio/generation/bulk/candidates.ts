import { Prisma, prisma, Visibility } from '@homemade/db'
import { CROSS_STITCH_SHELVES, CROSS_STITCH_SHELF_BY_SLUG } from '../categories'
import { STYLE, type StyleKey } from './cross-stitch-style'
import type { CrossStitchBrief, PlannerMode } from './planner'
import { shelfDeficits } from './shelf-plan'
import { subjectKey, findSubjectKeyMatch } from './subject-key'
import { CROSS_STITCH_THEMES } from './subject-pool'

/**
 * THE PARKING BAY — everything that happens to a cross-stitch candidate between
 * the generator and the catalogue.
 *
 * In the 'candidates' gate mode (autopilot-state.ts) the cron path makes no
 * paid-model call at all. It generates, checks the deterministic guards, and
 * PARKS the result as an UNLISTED `Pattern` row with `candidateStatus 'PENDING'`.
 * A Claude Code session on Rebecca's Max plan then looks at the contact sheets
 * and keeps, rejects or re-rolls each one — `apps/web/scripts/xs-candidates.ts`
 * is that session's hands, and this module is what it calls.
 *
 * Everything here is REVERSIBLE and recorded on the row: a keep is a visibility
 * flip plus a search sync, a reject is a visibility flip plus the reasons, and
 * both write `judgedAt` / `judgedBy` / `judgeReasons` so the decision survives
 * the session that made it.
 *
 * Deliberately NOT `server-only`: the judging CLI is a plain `tsx` script and
 * imports this module directly, so it must not drag in the Next.js server
 * boundary. Nothing here needs sharp, the Anthropic client or a request.
 */

export const CANDIDATE_STATUSES = ['PENDING', 'KEPT', 'REJECTED', 'REROLL'] as const
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number]

/**
 * How long an un-judged candidate may sit before the stalled-run sweep retires
 * it with reason 'unjudged'.
 *
 * Seven days is long enough that a week of no sessions loses nothing worth
 * keeping, and short enough that the parking bay cannot grow forever behind a
 * routine that quietly stopped firing. A swept candidate is REJECTED, not
 * deleted — its thumbnail and its reasons stay, so the sweep is visible rather
 * than a silent disappearance.
 */
export const CANDIDATE_SWEEP_DAYS = 7

/**
 * How many times ONE idea may be re-rolled before it is spent.
 *
 * A re-roll says "good idea, bad picture", and a fresh stochastic roll usually
 * fixes exactly that. Three says the fault is in the idea rather than the roll,
 * and the shelf is better served by the next subject in the pool.
 */
export const MAX_CANDIDATE_REROLLS = 3

/** The pending parking bay — what a session is being asked to look at. */
export const PENDING_WHERE = {
  type: 'CROSS_STITCH' as const,
  ownerUserId: null,
  visibility: Visibility.UNLISTED,
  candidateStatus: 'PENDING',
}

/** Candidates a session has asked for a fresh roll of. */
export const REROLL_WHERE = {
  type: 'CROSS_STITCH' as const,
  ownerUserId: null,
  candidateStatus: 'REROLL',
}

export interface PendingCandidate {
  id: string
  slug: string
  name: string
  shelf: string
  lane: string
  colourCount: number
  widthCells: number
  heightCells: number
  rerollCount: number
  bulkRunId: string | null
  createdAt: Date
  /** R2 key of the persisted beauty thumbnail — the exact chart that would ship. */
  thumbnailKey: string | null
}

interface GenerationMetaBrief {
  subject?: unknown
  shelf?: unknown
  lane?: unknown
  themeId?: unknown
}

/** The brief a candidate was generated from, read defensively out of its meta. */
export function briefOf(meta: unknown): GenerationMetaBrief | null {
  if (!meta || typeof meta !== 'object') return null
  const brief = (meta as { brief?: unknown }).brief
  if (!brief || typeof brief !== 'object') return null
  return brief as GenerationMetaBrief
}

function laneOf(meta: unknown): string {
  const lane = briefOf(meta)?.lane
  return typeof lane === 'string' ? lane : '?'
}

/** Every pending candidate, oldest first — the judging queue. */
export async function pendingCandidates(limit = 500): Promise<PendingCandidate[]> {
  const rows = await prisma.pattern.findMany({
    where: PENDING_WHERE,
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      colourCount: true,
      widthCells: true,
      heightCells: true,
      rerollCount: true,
      bulkRunId: true,
      createdAt: true,
      generationMeta: true,
      subCategory: { select: { slug: true } },
      thumbnail: { select: { r2Key: true } },
    },
  })
  // A row with no slug cannot be judged by slug, and the judging CLI addresses
  // everything by slug — so it is not part of the queue.
  return rows
    .filter((r): r is typeof r & { slug: string } => typeof r.slug === 'string' && r.slug.length > 0)
    .map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    shelf: r.subCategory?.slug ?? '?',
    lane: laneOf(r.generationMeta),
    colourCount: r.colourCount ?? 0,
    widthCells: r.widthCells ?? 0,
    heightCells: r.heightCells ?? 0,
    rerollCount: r.rerollCount,
    bulkRunId: r.bulkRunId,
    createdAt: r.createdAt,
    thumbnailKey: r.thumbnail?.r2Key ?? null,
  }))
}

export interface CandidateStats {
  pending: number
  /** When the oldest pending candidate was generated. Null when none are waiting. */
  oldest: Date | null
  /** When a session last judged anything. Null when nothing has ever been judged. */
  lastJudgedAt: Date | null
}

/** The two numbers the admin banner is built on. Cheap — two counts and a max. */
export async function candidateStats(): Promise<CandidateStats> {
  const [pending, oldestRow, lastJudged] = await Promise.all([
    prisma.pattern.count({ where: PENDING_WHERE }),
    prisma.pattern.findFirst({
      where: PENDING_WHERE,
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    }),
    prisma.pattern.findFirst({
      where: { type: 'CROSS_STITCH', ownerUserId: null, judgedAt: { not: null } },
      orderBy: { judgedAt: 'desc' },
      select: { judgedAt: true },
    }),
  ])
  return {
    pending,
    oldest: oldestRow?.createdAt ?? null,
    lastJudgedAt: lastJudged?.judgedAt ?? null,
  }
}

/** Pending candidates piled this high mean the routine has stopped keeping up. */
export const PENDING_BACKLOG_WARN = 150
/** Nothing judged for this long means the routine has stopped firing. */
export const UNJUDGED_WARN_HOURS = 12

/**
 * The admin banner lines, and the same text the Sentry warning carries. Pure so
 * the wording is testable and the page and the alert can never drift apart.
 */
export function candidateWarnings(stats: CandidateStats, now = new Date()): string[] {
  const out: string[] = []
  if (stats.pending > PENDING_BACKLOG_WARN) {
    out.push(
      `${stats.pending} candidates are waiting to be judged (over ${PENDING_BACKLOG_WARN}) — the judging routine is not keeping up with the cron.`,
    )
  }
  const since = stats.lastJudgedAt ? now.getTime() - stats.lastJudgedAt.getTime() : null
  if (stats.pending > 0 && (since === null || since > UNJUDGED_WARN_HOURS * 60 * 60 * 1000)) {
    out.push(
      stats.lastJudgedAt
        ? `Nothing has been judged for ${Math.floor((since ?? 0) / 3_600_000)} hours and ${stats.pending} candidates are waiting — check the cross-stitch judging routine fired.`
        : `${stats.pending} candidates are waiting and nothing has ever been judged — check the cross-stitch judging routine is wired.`,
    )
  }
  return out
}

// ─────────────────────────── keep / reject / reroll ───────────────────────────

export interface JudgeOutcome {
  /** Rows actually changed by this call. */
  changed: number
  /** Slugs that were already in the target state — idempotent, not an error. */
  alreadyDone: string[]
  /** Slugs with no pending candidate row. */
  notFound: string[]
}

const emptyOutcome = (): JudgeOutcome => ({ changed: 0, alreadyDone: [], notFound: [] })

/**
 * KEEP: the candidate goes PUBLIC and joins the search index, its run's
 * `published` counter goes up, and the decision is written on the row.
 *
 * Idempotent: a slug that is already KEPT is reported, not re-published, so a
 * session that lost its connection halfway can simply run the same command again.
 */
export async function keepCandidates(slugs: string[], judgedBy: string): Promise<JudgeOutcome> {
  const out = emptyOutcome()
  if (!slugs.length) return out
  const { syncPatternDoc } = await import('@homemade/search')
  const { buildPatternDoc } = await import('@homemade/db/search-docs')
  const now = new Date()

  for (const slug of slugs) {
    const row = await prisma.pattern.findUnique({
      where: { slug },
      select: { id: true, candidateStatus: true, visibility: true, bulkRunId: true },
    })
    if (!row || row.candidateStatus === null) {
      out.notFound.push(slug)
      continue
    }
    if (row.candidateStatus === 'KEPT' && row.visibility === Visibility.PUBLIC) {
      out.alreadyDone.push(slug)
      continue
    }
    await prisma.pattern.update({
      where: { id: row.id },
      // `select` keeps the RETURNING clause to one column — the row carries the
      // whole chart, and asking for every column ties this to the live schema.
      select: { id: true },
      data: {
        visibility: Visibility.PUBLIC,
        publishedAt: now,
        candidateStatus: 'KEPT',
        judgedAt: now,
        judgedBy,
        judgeReasons: ['kept'],
        // A kept candidate is no longer blocked by anything: clear any record
        // left by an earlier reject so the row reads honestly.
        qcBlockReason: Prisma.DbNull,
      },
    })
    if (row.bulkRunId) {
      await prisma.bulkRun
        .update({ where: { id: row.bulkRunId }, data: { published: { increment: 1 } }, select: { id: true } })
        .catch(() => null)
    }
    // NON-FATAL, exactly as in xs-cull: the DB flip is the decision, the index a
    // derived copy the server-side reindex rebuilds anyway.
    try {
      const doc = await buildPatternDoc(row.id)
      if (doc) await syncPatternDoc(doc)
    } catch (err) {
      console.warn(`  search sync threw for ${slug}: ${err instanceof Error ? err.message : String(err)}`)
    }
    out.changed++
  }
  return out
}

export interface RejectRecord {
  slug: string
  reason: string
}

/**
 * REJECT: the candidate goes PRIVATE with its reasons on the row, its run's
 * `culled` counter goes up, and the thumbnail is KEPT — a rejected candidate is
 * the reject sample now, and the calibration record for the locked bar.
 *
 * Idempotent, and reversible: nothing is deleted and the row keeps its chart.
 */
export async function rejectCandidates(
  recs: RejectRecord[],
  judgedBy: string,
  opts: { source?: string } = {},
): Promise<JudgeOutcome> {
  const out = emptyOutcome()
  if (!recs.length) return out
  const { removePatternFromSearch } = await import('@homemade/search')
  const now = new Date()
  const source = opts.source ?? 'xs-candidates'

  for (const rec of recs) {
    const row = await prisma.pattern.findUnique({
      where: { slug: rec.slug },
      select: { id: true, candidateStatus: true, visibility: true, bulkRunId: true },
    })
    if (!row || row.candidateStatus === null) {
      out.notFound.push(rec.slug)
      continue
    }
    if (row.candidateStatus === 'REJECTED' && row.visibility === Visibility.PRIVATE) {
      out.alreadyDone.push(rec.slug)
      continue
    }
    await prisma.pattern.update({
      where: { id: row.id },
      select: { id: true },
      data: {
        visibility: Visibility.PRIVATE,
        publishedAt: null,
        candidateStatus: 'REJECTED',
        judgedAt: now,
        judgedBy,
        judgeReasons: [rec.reason],
        // Mirrors the QC pass's shape so the admin block-reason surfaces and the
        // duplicate guard's culled population read it with no special case — a
        // rejected idea is spent, and must not be commissioned again.
        qcBlockReason: { blocked: true, reasons: [rec.reason], source, checkedAt: now.toISOString() },
      },
    })
    if (row.bulkRunId) {
      await prisma.bulkRun
        .update({ where: { id: row.bulkRunId }, data: { culled: { increment: 1 } }, select: { id: true } })
        .catch(() => null)
    }
    // A candidate was never in the index, but a previously-kept row might be.
    try {
      await removePatternFromSearch(row.id)
    } catch (err) {
      console.warn(`  search removal threw for ${rec.slug}: ${err instanceof Error ? err.message : String(err)}`)
    }
    out.changed++
  }
  return out
}

/**
 * REROLL: a good idea with a bad roll. The row is marked REROLL and stays
 * UNLISTED; the next dispatcher firing re-plans its brief as one of its ideas
 * and retires this row. Capped at MAX_CANDIDATE_REROLLS per idea.
 */
export async function rerollCandidates(slugs: string[], judgedBy: string): Promise<JudgeOutcome & { capped: string[] }> {
  const out = { ...emptyOutcome(), capped: [] as string[] }
  const now = new Date()
  for (const slug of slugs) {
    const row = await prisma.pattern.findUnique({
      where: { slug },
      select: { id: true, candidateStatus: true, rerollCount: true },
    })
    if (!row || row.candidateStatus === null) {
      out.notFound.push(slug)
      continue
    }
    if (row.candidateStatus === 'REROLL') {
      out.alreadyDone.push(slug)
      continue
    }
    if (row.rerollCount >= MAX_CANDIDATE_REROLLS) {
      out.capped.push(slug)
      continue
    }
    await prisma.pattern.update({
      where: { id: row.id },
      select: { id: true },
      data: { candidateStatus: 'REROLL', judgedAt: now, judgedBy, judgeReasons: ['reroll'] },
    })
    out.changed++
  }
  return out
}

// ─────────────────────────── the re-roll queue ───────────────────────────

/** One idea waiting to be generated again, as a brief the dispatcher can fan out. */
export interface RerollRequest {
  /** The candidate row this request came from, now retired. */
  patternId: string
  /** How many re-rolls this idea will have had once the new candidate lands. */
  rerollCount: number
  brief: CrossStitchBrief
}

/**
 * Rebuild a planner brief from a parked candidate's `generationMeta`.
 *
 * `generationMeta` stores the brief as it was planned plus the style beside it,
 * so this is a reassembly rather than a guess — every field the generator reads
 * comes back exactly as it went in. The two it cannot recover are cosmetic: the
 * slug (a fresh one, so the re-roll is its own row and the old one stays as the
 * record of what was wrong) and the shelf's display name, which is canonical
 * and looked up. Returns null when the meta is unreadable or the shelf no
 * longer exists — a shelf that has been retired must not be generated into.
 */
export function rebuildBrief(meta: unknown, slug: string): CrossStitchBrief | null {
  const brief = briefOf(meta)
  if (!brief) return null
  const subject = typeof brief.subject === 'string' ? brief.subject : null
  const shelfSlug = typeof brief.shelf === 'string' ? brief.shelf : null
  if (!subject || !shelfSlug) return null
  const shelf = CROSS_STITCH_SHELF_BY_SLUG[shelfSlug]
  if (!shelf) return null

  const raw = brief as Record<string, unknown>
  const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
  const style = (meta as { style?: unknown }).style
  const sat = raw.sat
  return {
    slug,
    subject,
    subjectKey: typeof raw.subjectKey === 'string' && raw.subjectKey ? raw.subjectKey : subjectKey(subject),
    style: typeof style === 'string' && style in STYLE ? (style as StyleKey) : 'bright',
    w: num(raw.w, 155),
    h: num(raw.h, 155),
    colours: num(raw.colours, 40),
    lane: typeof raw.lane === 'string' ? raw.lane : 'medium',
    // A re-roll is the sampler's work now, whoever wrote the original brief:
    // no model was called to produce it.
    source: 'sampler',
    plannerMode: (typeof raw.plannerMode === 'string' ? raw.plannerMode : 'constrained') as PlannerMode,
    dressed: raw.dressed === true,
    ...(typeof sat === 'number' ? { sat } : {}),
    shelf: shelf.slug,
    shelfName: shelf.name,
    themeId: typeof raw.themeId === 'string' ? raw.themeId : shelf.slug,
  }
}

/**
 * Take up to `limit` re-roll requests off the queue and RETIRE the rows they
 * came from, so the same request can never be dispatched twice.
 *
 * The retired row goes PRIVATE with reason 'rerolled': its subject is about to
 * be generated again, so leaving it UNLISTED would make the new candidate look
 * like a duplicate of the old one to the guard. A request whose brief cannot be
 * read, or whose idea has run out of re-rolls, is retired as REJECTED with the
 * reason on the row rather than silently dropped.
 */
export async function takeRerollRequests(limit: number): Promise<RerollRequest[]> {
  if (limit <= 0) return []
  const rows = await prisma.pattern.findMany({
    where: REROLL_WHERE,
    orderBy: { judgedAt: 'asc' },
    take: limit,
    select: { id: true, slug: true, rerollCount: true, generationMeta: true },
  })
  const now = new Date()
  const out: RerollRequest[] = []
  for (const row of rows) {
    const nextCount = row.rerollCount + 1
    const capped = row.rerollCount >= MAX_CANDIDATE_REROLLS
    // A fresh slug, so the re-roll is its own row and the one being replaced
    // stays exactly as it was — the record of what was wrong with the idea.
    const brief = capped ? null : rebuildBrief(row.generationMeta, `${row.slug}-r${nextCount}`)
    const reason = capped ? 'reroll: cap reached' : !brief ? 'reroll: no readable brief' : 'rerolled'
    await prisma.pattern.update({
      where: { id: row.id },
      select: { id: true },
      data: {
        visibility: Visibility.PRIVATE,
        publishedAt: null,
        candidateStatus: 'REJECTED',
        judgedAt: now,
        judgeReasons: [reason],
        qcBlockReason: { blocked: true, reasons: [reason], source: 'xs-candidates-reroll', checkedAt: now.toISOString() },
      },
    })
    if (brief) out.push({ patternId: row.id, rerollCount: nextCount, brief })
  }
  return out
}

/**
 * Retire candidates nobody judged. Called from the dispatcher's existing
 * stalled-run sweep, so the parking bay is tidied on the same schedule
 * everything else is — no separate cron, nothing to forget to wire.
 */
export async function sweepUnjudgedCandidates(days = CANDIDATE_SWEEP_DAYS): Promise<number> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const stale = await prisma.pattern.findMany({
    where: { ...PENDING_WHERE, createdAt: { lt: cutoff } },
    select: { id: true, bulkRunId: true },
  })
  if (!stale.length) return 0
  const now = new Date()
  await prisma.pattern.updateMany({
    where: { id: { in: stale.map((r) => r.id) } },
    data: {
      visibility: Visibility.PRIVATE,
      publishedAt: null,
      candidateStatus: 'REJECTED',
      judgedAt: now,
      judgedBy: 'sweep',
      judgeReasons: ['unjudged'],
      qcBlockReason: { blocked: true, reasons: ['unjudged'], source: 'candidate-sweep', checkedAt: now.toISOString() },
    },
  })
  for (const row of stale) {
    if (!row.bulkRunId) continue
    await prisma.bulkRun
      .update({ where: { id: row.bulkRunId }, data: { culled: { increment: 1 } }, select: { id: true } })
      .catch(() => null)
  }
  return stale.length
}

// ─────────────────────────── the pool check ───────────────────────────

export interface PoolShelfCheck {
  slug: string
  name: string
  /** PUBLIC patterns on the shelf today. */
  count: number
  target: number
  /** How many the shelf still owes. */
  deficit: number
  /** Subjects the pool holds for this shelf. */
  poolSubjects: number
  /** Of those, how many the catalogue has not already spent. */
  unused: number
  /** True when the shelf will run out of pool before it reaches its target. */
  thin: boolean
}

/**
 * WHERE THE POOL IS ABOUT TO RUN OUT.
 *
 * Under the constrained planner the subject pool is a CEILING, not a seed list:
 * a shelf can only ever hold as many patterns as it has unused subjects. A shelf
 * fifty short of its target with eight subjects left is not a generation problem
 * and no amount of firing the cron will fix it — the fix is more subjects in
 * `subject-pool.ts`, which is work only a session can do. This is how the
 * routine finds out, rather than discovering it as a run of duplicates.
 *
 * `thin` is deliberately blunt: unused subjects fewer than the deficit. A shelf
 * at its target is never thin however empty its pool is.
 */
export async function poolCheck(): Promise<PoolShelfCheck[]> {
  const [counts, spent] = await Promise.all([liveShelfCountsForPool(), spentSubjectKeys()])
  const deficits = new Map(shelfDeficits(CROSS_STITCH_SHELVES, counts).map((d) => [d.slug, d]))

  const byShelf = new Map<string, string[]>()
  for (const theme of CROSS_STITCH_THEMES) {
    const list = byShelf.get(theme.shelf) ?? []
    list.push(...theme.examples)
    byShelf.set(theme.shelf, list)
  }

  const out: PoolShelfCheck[] = []
  for (const shelf of CROSS_STITCH_SHELVES) {
    const subjects = byShelf.get(shelf.slug) ?? []
    let unused = 0
    for (const subject of subjects) {
      const key = subjectKey(subject)
      if (!key) continue
      if (spent.has(key) || findSubjectKeyMatch(key, spent)) continue
      unused++
    }
    const count = counts[shelf.slug] ?? 0
    // `shelfDeficits` drops HOLD shelves and shelves already at target, and a
    // shelf it dropped owes nothing — so a missing entry is a zero, never a
    // recomputed gap.
    const deficit = deficits.get(shelf.slug)?.deficit ?? 0
    out.push({
      slug: shelf.slug,
      name: shelf.name,
      count,
      target: shelf.target,
      deficit,
      poolSubjects: subjects.length,
      unused,
      thin: deficit > 0 && unused < deficit,
    })
  }
  // Thinnest first: the shelf with the biggest gap between what it owes and what
  // it can still be given is the one a session should write subjects for.
  return out.sort((a, b) => Number(b.thin) - Number(a.thin) || b.deficit - b.unused - (a.deficit - a.unused))
}

/**
 * Live PUBLIC house pattern count per shelf. A local copy rather than an import
 * of `dedupe-guard.liveShelfCounts`, which is `server-only` and would stop the
 * judging CLI importing this module at all.
 */
async function liveShelfCountsForPool(): Promise<Record<string, number>> {
  const cat = await prisma.category.findUnique({ where: { slug: 'cross-stitch' }, select: { id: true } })
  if (!cat) return {}
  const [subs, counts] = await Promise.all([
    prisma.subCategory.findMany({ where: { categoryId: cat.id }, select: { id: true, slug: true } }),
    prisma.pattern.groupBy({
      by: ['subCategoryId'],
      where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC },
      _count: { _all: true },
    }),
  ])
  const bySubId = new Map(counts.map((c) => [c.subCategoryId, c._count._all]))
  const out: Record<string, number> = {}
  for (const s of subs) out[s.slug] = bySubId.get(s.id) ?? 0
  for (const s of CROSS_STITCH_SHELVES) out[s.slug] ??= 0
  return out
}

/**
 * Every subject the catalogue has already spent: published, culled or parked.
 * The same three populations the planner's avoid list reads, because "how much
 * runway is left" and "what may the planner still ask for" must be the same
 * question.
 */
async function spentSubjectKeys(): Promise<Set<string>> {
  const rows = await prisma.pattern.findMany({
    where: {
      type: 'CROSS_STITCH',
      ownerUserId: null,
      OR: [
        { visibility: Visibility.PUBLIC },
        { visibility: Visibility.PRIVATE, NOT: { qcBlockReason: { equals: Prisma.DbNull } } },
        { visibility: Visibility.UNLISTED, candidateStatus: 'PENDING' },
      ],
    },
    select: { subjectKey: true, name: true },
  })
  const out = new Set<string>()
  for (const r of rows) {
    const key = r.subjectKey || subjectKey(r.name)
    if (key) out.add(key)
  }
  return out
}

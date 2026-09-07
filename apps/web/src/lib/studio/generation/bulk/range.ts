/**
 * THE SIZE RANGE — the lane arithmetic and the rule that spreads a batch across
 * it.
 *
 * Split out of `planner.ts` for the same reason `duplicate-match.ts` was split
 * out of `dedupe-guard.ts`: the planner is `server-only` because it calls
 * Anthropic, which makes it unimportable from a plain test runner, and the
 * range rule is the part of it that most needs testing. Nothing here touches a
 * model, a database or the network — briefs in, briefs out.
 *
 * The rule itself is the catalogue's central promise, restated as arithmetic:
 * a batch spans quick → mini → small/medium → large → one expensive Flux 1.1
 * Pro piece, and it is enforced after the fact rather than hoped for, because
 * every previous bulk-authoring effort drifted to one complexity level and had
 * to be culled.
 */

import type { StyleKey } from './cross-stitch-style'
import { applyWarmFurGuard } from './brief-rules'
import { lanesForSubject, capTextRiskBriefs, type ThemeLaneTags } from './brief-filter'
import { CROSS_STITCH_SHELF_BY_SLUG } from '../categories'
import {
  CROSS_STITCH_THEMES,
  CROSS_STITCH_SIZE_LANES,
  LANES_ALL,
  SIZE_LANE_BY_NAME,
  isTextRiskSubject,
  settleLane,
  type CrossStitchTheme,
} from './subject-pool'
import type { CrossStitchBrief, PlannerMode } from './planner'

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, Math.round(n)))

/** Styles that need a real canvas — never placed in the `mini` lane. */
export const DETAIL_STYLES: StyleKey[] = ['dogportrait', 'artface', 'icon']

/**
 * Detailed styles (realistic pet portraits, fine-art faces) need a size + colour
 * floor — under-resolved they turn to mush (a 120-cell realistic collie has muddy
 * eyes). Raise the brief to at least a medium canvas. Flat/graphic styles are fine
 * small, so they're untouched.
 */
function applyStyleFloors(b: CrossStitchBrief): CrossStitchBrief {
  if (!DETAIL_STYLES.includes(b.style)) return b
  return {
    ...b,
    w: Math.max(b.w, 160),
    h: Math.max(b.h, 160),
    colours: Math.max(b.colours, 34),
  }
}

/** Every size/colour correction a finished brief gets, in one place. */
export function settleBrief(b: CrossStitchBrief): CrossStitchBrief {
  return applyWarmFurGuard(applyStyleFloors(b))
}


/** A shelf that is already the size it should be — never planned into. */
function isHoldShelf(slug: string): boolean {
  return Boolean(CROSS_STITCH_SHELF_BY_SLUG[slug]?.hold)
}

/** Every theme that still has a generation lane. */
export const PLANNABLE_THEMES: CrossStitchTheme[] = CROSS_STITCH_THEMES.filter((t) => !isHoldShelf(t.shelf))


/** The size lanes each theme's subjects survive — the pool's own tags, as data. */
export const LANE_TAGS_BY_THEME: Record<string, ThemeLaneTags> = Object.fromEntries(
  CROSS_STITCH_THEMES.map((t) => [
    t.id,
    { examples: t.examples, lanes: t.lanes ?? LANES_ALL, ...(t.laneOverrides ? { overrides: t.laneOverrides } : {}) },
  ]),
)

/** Is this brief in a lane its subject can survive? */
export function laneFits(themeId: string, subject: string, lane: string): boolean {
  const allowed = lanesForSubject(subject, LANE_TAGS_BY_THEME[themeId])
  return !allowed || allowed.includes(lane)
}

/**
 * Put a brief in a lane its subject can actually survive.
 *
 * PROMOTION, not rejection: a shopfront asked for in the mini lane is a fine
 * subject in the wrong canvas, and moving it to the smallest lane that holds it
 * keeps the brief and costs nothing. Only a subject with no allowed lane at all
 * is beyond help, and the pool has none of those.
 */
export function settleLaneFor(b: CrossStitchBrief): CrossStitchBrief {
  if (laneFits(b.themeId, b.subject, b.lane)) return b
  const allowed = lanesForSubject(b.subject, LANE_TAGS_BY_THEME[b.themeId])
  const lane = allowed ? settleLane(allowed as never) : null
  return lane ? applyLane(b, lane) : b
}


/** Mid canvas per lane for the fallback — keeps the sampler honest to each lane. */
export const FALLBACK_MID_CELLS: Record<string, number> = {
  quick: 52,
  mini: 68,
  small: 120,
  medium: 155,
  large: 210,
  dense: 215,
  // The heirloom tier. 480 on the long side sits in the middle of the 400–600
  // band the tier is defined by, and is the size the proof run measured end to
  // end (chart, thumbnail, print tiling and page weight) before the lane was
  // wired into the planner at all.
  showpiece: 480,
}

/** The smallest and largest a chart may be, in cells on a side. */
export const MIN_CELLS = 36
export const MAX_CELLS = 600

/** The floss-count bounds a brief may ask for, across every lane. */
export const MIN_COLOURS = 6
export const MAX_COLOURS = 320

/** Batches of this size or larger carry exactly one dense showpiece. */
export const DENSE_BATCH_FLOOR = 8

/**
 * Batches of this size or larger carry at least one QUICK WIN.
 *
 * Low, because the quick tier is the cheap end of the range: a 48-cell motif is
 * one schnell generation and a single evening's stitching, and the audit found
 * the catalogue had nothing at all under 60 cells. A batch of four can carry
 * one; a batch of two is a repair run and is left alone.
 */
export const QUICK_BATCH_FLOOR = 4

/**
 * How often the batch's ONE expensive Flux 1.1 Pro slot goes to a showpiece
 * rather than to the dense tier.
 *
 * A batch never carries two Pro pieces: the dense lane and the showpiece lane
 * share one slot, so the daily Pro spend is exactly what it was before the
 * heirloom tier existed (about twelve generations a day against a cap of 24)
 * and the cap does not have to move.
 *
 * At a quarter, twelve firings a day yield roughly three heirlooms and nine
 * dense pieces — which is the right proportion for a tier whose pieces are a
 * year of stitching each, and keeps the average pattern payload down: a
 * 480-cell full-coverage chart is two hundred times the cells of a quick win.
 */
export const SHOWPIECE_SHARE = 0.25


// ─────────────────────── the quick-win reservation ───────────────────────

/**
 * Every pool subject tagged to survive the quick lane, with its theme.
 *
 * The quick tier is opt-in per subject, so this is the whole vocabulary the
 * reservation below may draw on — sixteen small makes plus a handful of single
 * motifs spread across the animal, food, floral, seasonal, Christmas, coastal
 * and folk shelves, so reserving a slot for one does not always take it from
 * the same shelf.
 */
export function quickCapableSubjects(): Array<{ theme: CrossStitchTheme; subject: string }> {
  const out: Array<{ theme: CrossStitchTheme; subject: string }> = []
  for (const theme of PLANNABLE_THEMES) {
    for (const subject of theme.examples) {
      const allowed = lanesForSubject(subject, LANE_TAGS_BY_THEME[theme.id])
      if (allowed?.includes('quick')) out.push({ theme, subject })
    }
  }
  return out
}

/** Can any brief in this set be built as a quick win? */
function batchHasQuickCandidate(briefs: CrossStitchBrief[]): boolean {
  return briefs.some((b) => laneFits(b.themeId, b.subject, 'quick'))
}

/**
 * RESERVE THE QUICK SLOT.
 *
 * The range rule can only promote a brief into the quick lane if the batch
 * happens to carry a subject written for 48 cells, and a deficit-weighted shelf
 * draw does not guarantee one. So when the batch has none, one is swapped in.
 *
 * The swap is deliberately shelf-neutral where it can be: it takes the slot off
 * a shelf that already has more than one brief in this batch — the surplus, not
 * the shelf's only representative — and only falls back to the last brief when
 * every shelf has exactly one. A batch too small to carry a quick win, or a
 * catalogue that already has every quick subject, is left alone.
 */
export interface QuickWinReservation {
  /** Mints a unique slug for a fresh brief (the planner's own minter). */
  mintSlug: (themeId: string, subject: string) => string
  /** The normalised subject key for a subject. */
  subjectKey: (subject: string) => string
  /** Which planner wrote the batch — carried onto the brief unchanged. */
  plannerMode: PlannerMode
  /** Is this subject already the catalogue's, or already this batch's? */
  taken: (key: string) => boolean
  /** Picks a style for the theme. Injected so a test can be deterministic. */
  pickStyle?: (theme: CrossStitchTheme) => StyleKey
}

export function reserveQuickWin(
  briefs: CrossStitchBrief[],
  count: number,
  ctx: QuickWinReservation,
): CrossStitchBrief[] {
  if (count < QUICK_BATCH_FLOOR || briefs.length === 0) return briefs
  if (batchHasQuickCandidate(briefs)) return briefs

  const shelfCounts = new Map<string, number>()
  for (const b of briefs) shelfCounts.set(b.shelf, (shelfCounts.get(b.shelf) ?? 0) + 1)
  // Prefer a quick subject on a shelf the batch is already serving, so the
  // reservation does not quietly rewrite the shelf quota.
  const choices = quickCapableSubjects()
    .filter(({ subject }) => !ctx.taken(ctx.subjectKey(subject)))
    .sort((a, b) => (shelfCounts.get(b.theme.shelf) ?? 0) - (shelfCounts.get(a.theme.shelf) ?? 0))
  const choice = choices[0]
  if (!choice) return briefs

  const surplusIdx = briefs.findIndex((b, i) => (shelfCounts.get(b.shelf) ?? 0) > 1 && i > 0)
  const replaceIdx = surplusIdx >= 0 ? surplusIdx : briefs.length - 1
  const out = briefs.slice()
  out[replaceIdx] = applyLane(
    settleBrief({
      slug: ctx.mintSlug(choice.theme.id, choice.subject),
      subject: choice.subject,
      subjectKey: ctx.subjectKey(choice.subject),
      source: 'sampler',
      plannerMode: ctx.plannerMode,
      dressed: false,
      style: (ctx.pickStyle ?? ((t: CrossStitchTheme) => t.styles[0]!))(choice.theme),
      w: FALLBACK_MID_CELLS.quick!,
      h: FALLBACK_MID_CELLS.quick!,
      colours: 10,
      lane: 'quick',
      shelf: choice.theme.shelf,
      shelfName: choice.theme.shelfName,
      themeId: choice.theme.id,
    }),
    'quick',
  )
  return out
}


// ───────────────────────────── the size range ─────────────────────────────

export function laneByName(name: string): (typeof CROSS_STITCH_SIZE_LANES)[number] {
  return SIZE_LANE_BY_NAME[name] ?? SIZE_LANE_BY_NAME.medium!
}

/** Re-size a brief into a lane, keeping its aspect ratio and its subject. */
export function applyLane(b: CrossStitchBrief, laneName: string): CrossStitchBrief {
  const lane = laneByName(laneName)
  const [loC, hiC] = lane.colours.split('–').map((s) => parseInt(s, 10))
  const mid = FALLBACK_MID_CELLS[lane.lane] ?? 155
  const ratio = b.h > 0 ? b.w / b.h : 1
  const w = ratio >= 1 ? mid : Math.round(mid * ratio)
  const h = ratio >= 1 ? Math.round(mid / ratio) : mid
  // Re-settle after a lane change: a brief demoted INTO mini may now need the
  // warm-fur saturation it did not need as a large piece.
  return settleBrief({
    ...b,
    lane: lane.lane,
    w: clamp(w, MIN_CELLS, MAX_CELLS),
    h: clamp(h, MIN_CELLS, MAX_CELLS),
    colours: clamp((loC! + hiC!) / 2, MIN_COLOURS, MAX_COLOURS),
  })
}

/**
 * Hold the batch to the RANGE rule.
 *
 * The catalogue's whole point is that it spans the range in BOTH directions, so
 * the spread is enforced after the fact rather than hoped for:
 *
 *   · at least one QUICK WIN — a 40–60 cell single motif, the one-evening make
 *     the catalogue had nothing of at all before September 2026;
 *   · at least one mini and one large;
 *   · a couple of small/medium in between;
 *   · and exactly ONE expensive Flux 1.1 Pro piece, which is either the dense
 *     100+ colour showpiece or, a quarter of the time, the 400–600 cell
 *     heirloom. One slot, not two: the Pro spend per batch is unchanged by the
 *     heirloom tier existing.
 */
export function enforceRange(
  briefs: CrossStitchBrief[],
  count: number,
  opts: { rng?: () => number } = {},
): CrossStitchBrief[] {
  if (briefs.length === 0) return briefs
  const rng = opts.rng ?? Math.random
  const wantDense = count >= DENSE_BATCH_FLOOR
  const wantQuick = count >= QUICK_BATCH_FLOOR

  // ── text risk: the Pro slot or nothing ───────────────────────────────────
  // A subject that invites lettering is buildable in exactly the two biggest
  // lanes, and a batch has exactly one big slot — so at most one text-risk
  // brief can be built, and none at all in a batch too small to carry one.
  // The rest are DROPPED here rather than demoted: `applyLane` would otherwise
  // quietly move one into `large`, which is the lane the 6 September haberdashery
  // window died in. `finaliseBriefs` refills the hole from the pool, which never
  // samples a text-risk subject.
  const out = capTextRiskBriefs(briefs, { wantDense }).kept
  if (out.length === 0) return out
  const idxOf = (lane: string): number[] => out.map((b, i) => (b.lane === lane ? i : -1)).filter((i) => i >= 0)
  const proIdxs = (): number[] => [...idxOf('dense'), ...idxOf('showpiece')]

  // ── the one Pro slot: dense, or the heirloom showpiece ────────────────────
  const riskIdx = out.findIndex((b) => isTextRiskSubject(b.subject))
  if (wantDense) {
    // Who holds it. A text-risk subject takes it outright — those two lanes are
    // the only ones it has. Otherwise the biggest canvas that can carry one.
    let holder: number | null = riskIdx >= 0 ? riskIdx : null
    if (holder == null) {
      const existing = proIdxs()
      holder = existing[0] ?? null
    }
    if (holder == null) {
      // Promote the biggest canvas that can hold a dense piece. Promotion used
      // to be unconditional — every lane rule was a FLOOR, so a bigger canvas
      // was never the wrong one. `small-makes` (September 2026) is the first
      // SIZE-CAPPED theme: an ornament motif is mini or small and nothing else,
      // so promotion now has to ask, exactly as demotion always did. If nothing
      // in the batch can hold it the batch simply runs without one rather than
      // blowing a bookmark motif up to 150 colours.
      const candidates = out
        .map((b, i) => ({ b, i, area: b.w * b.h }))
        .filter(({ b }) => laneFits(b.themeId, b.subject, 'dense') || laneFits(b.themeId, b.subject, 'showpiece'))
        .sort((a, b) => b.area - a.area)
      holder = candidates[0]?.i ?? null
    }
    if (holder != null) {
      // Which tier the slot spends itself on. The heirloom wins it a quarter of
      // the time, and only when this subject is actually tagged for 400–600
      // cells of full coverage.
      const heirloom = laneFits(out[holder]!.themeId, out[holder]!.subject, 'showpiece') && rng() < SHOWPIECE_SHARE
      const lane = heirloom ? 'showpiece' : laneFits(out[holder]!.themeId, out[holder]!.subject, 'dense') ? 'dense' : 'showpiece'
      if (out[holder]!.lane !== lane) out[holder] = applyLane(out[holder]!, lane)
    }
    // Anything else that landed in a Pro lane comes back down to large.
    for (const i of proIdxs()) if (i !== holder) out[i] = applyLane(out[i]!, 'large')
  } else {
    for (const i of proIdxs()) out[i] = applyLane(out[i]!, 'large')
  }

  const proIdx = out.findIndex((b) => b.lane === 'dense' || b.lane === 'showpiece')

  // ── quick: at least one, and only a subject tagged to read at 48 cells ────
  // Unlike the mini rule this cannot fall back on "the smallest thing here":
  // a 48-cell canvas holds one silhouette, so a brief that was not written for
  // it is a guaranteed kill. When the batch carries no such subject it runs
  // without a quick win rather than mushing one.
  if (wantQuick && !out.some((b) => b.lane === 'quick')) {
    const candidate = out
      .map((b, i) => ({ b, i }))
      .filter(({ b, i }) => i !== proIdx && !DETAIL_STYLES.includes(b.style) && laneFits(b.themeId, b.subject, 'quick'))
      .sort((a, b) => a.b.w * a.b.h - b.b.w * b.b.h)[0]
    if (candidate) out[candidate.i] = applyLane(candidate.b, 'quick')
  }
  const quickIdx = out.findIndex((b) => b.lane === 'quick')
  const reserved = (i: number): boolean => i === proIdx || i === quickIdx

  // ── mini: at least one, and never a detail style ─────────────────────────
  // Only a subject that can SURVIVE mini is eligible. Batch 7 demoted a shopfront
  // into it and got mush; the range rule is worth having, but not at the price of
  // a guaranteed kill.
  if (!out.some((b) => b.lane === 'mini')) {
    const candidate = out
      .map((b, i) => ({ b, i }))
      .filter(({ b, i }) => !reserved(i) && !DETAIL_STYLES.includes(b.style) && laneFits(b.themeId, b.subject, 'mini'))
      .sort((a, b) => a.b.w * a.b.h - b.b.w * b.b.h)[0]
    if (candidate) out[candidate.i] = applyLane(candidate.b, 'mini')
  }

  // ── large: at least one (the Pro showpiece does not count) ────────────────
  if (!out.some((b, i) => b.lane === 'large' && i !== proIdx)) {
    const candidate = out
      .map((b, i) => ({ b, i }))
      .filter(({ b, i }) => !reserved(i) && b.lane !== 'mini' && laneFits(b.themeId, b.subject, 'large'))
      .sort((a, b) => b.b.w * b.b.h - a.b.w * a.b.h)[0]
    if (candidate) out[candidate.i] = applyLane(candidate.b, 'large')
  }

  // ── a couple of small/medium in between ──────────────────────────────────
  // Take from the SURPLUS at either end — a second large, a second mini — never
  // the single piece each extreme of the range needs.
  const midCount = (): number => out.filter((b) => b.lane === 'small' || b.lane === 'medium').length
  if (out.length >= 4) {
    for (const lane of ['small', 'medium'] as const) {
      if (midCount() >= 2) break
      const surplus = [...idxOf('large').filter((i) => i !== proIdx).slice(1), ...idxOf('mini').slice(1)].filter(
        (i) => !reserved(i) && laneFits(out[i]!.themeId, out[i]!.subject, lane),
      )
      const i = surplus[0]
      if (i == null) break
      out[i] = applyLane(out[i]!, lane)
    }
  }
  return out
}


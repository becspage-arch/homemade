/**
 * SHELF PLANNING — how many of this batch's briefs each shelf gets.
 *
 * The old planner let the model pick whatever themes it fancied, which is how
 * `animals` reached 197 while `nursery` sat at 0 and `cocktails` at 2. Shelves
 * now get briefs in proportion to how far they are from their target, so the
 * catalogue fills evenly and stops on its own.
 *
 * The allocation is the largest-remainder (Hamilton) method: deterministic given
 * the live counts, which makes it testable and self-correcting — every published
 * gem moves the counts, so the next batch re-weights automatically.
 *
 * Pure (no `server-only`, no Prisma) apart from the clearly-marked DB loader at
 * the bottom, so the maths is unit-testable on its own.
 */

import type { ShelfTarget } from '../categories'

export interface ShelfDeficit {
  slug: string
  name: string
  target: number
  count: number
  /** target − count, floored at 0. Hold shelves never appear. */
  deficit: number
}

/**
 * The shelves still wanting patterns, biggest gap first. HOLD shelves are
 * excluded outright (they have no generation lane), as is any shelf already at
 * or over its target.
 */
export function shelfDeficits(shelves: ShelfTarget[], counts: Record<string, number>): ShelfDeficit[] {
  return shelves
    .filter((s) => !s.hold)
    .map((s) => ({ slug: s.slug, name: s.name, target: s.target, count: counts[s.slug] ?? 0, deficit: Math.max(0, s.target - (counts[s.slug] ?? 0)) }))
    .filter((s) => s.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit || a.slug.localeCompare(b.slug))
}

export interface ShelfAllocation {
  slug: string
  name: string
  briefs: number
  deficit: number
}

/**
 * Split `count` briefs across the deficit shelves in proportion to their gaps.
 *
 * Largest-remainder: floor the exact proportional share, then hand the leftover
 * briefs to the largest fractional remainders. Every allocated shelf gets at
 * least the share its gap earns, and the totals always add to exactly `count`.
 * Returns [] when nothing is wanting — the caller reads that as "at target".
 */
export function allocateShelves(deficits: ShelfDeficit[], count: number): ShelfAllocation[] {
  if (count <= 0 || deficits.length === 0) return []
  const total = deficits.reduce((n, d) => n + d.deficit, 0)
  if (total <= 0) return []

  const exact = deficits.map((d) => ({ d, share: (d.deficit / total) * count }))
  const alloc = exact.map((e) => ({ slug: e.d.slug, name: e.d.name, deficit: e.d.deficit, briefs: Math.floor(e.share), rem: e.share - Math.floor(e.share) }))
  let left = count - alloc.reduce((n, a) => n + a.briefs, 0)
  // Leftovers to the biggest fractional remainders; ties to the bigger gap, then
  // slug, so the split is stable run to run.
  const order = [...alloc].sort((a, b) => b.rem - a.rem || b.deficit - a.deficit || a.slug.localeCompare(b.slug))
  for (const a of order) {
    if (left <= 0) break
    a.briefs++
    left--
  }
  return alloc
    .filter((a) => a.briefs > 0)
    .map(({ slug, name, briefs, deficit }) => ({ slug, name, briefs, deficit }))
    .sort((a, b) => b.briefs - a.briefs || a.slug.localeCompare(b.slug))
}

/**
 * How many briefs ONE shelf may take in a batch — one fifth of it, so two in a
 * batch of ten.
 *
 * Batch 6 (September 2026) sent three of ten briefs to `celestial` because the
 * shelf sits at 6 patterns against a large target, so the deficit maths handed it
 * the biggest share. Two of the three were the same picture — an animal in flight
 * across a moon — which is a COMPOSITION repeat that neither the token overlap
 * nor the head-noun test can see. Rather than teach the collision rule about
 * composition, the batch simply stops putting that many eggs in one shelf: a
 * shelf that is far behind catches up over successive batches, not inside one.
 */
export const SHELF_SHARE = 5

/** Shelves that may never exceed the cap, whatever their deficit says. */
const HARD_CAPPED = new Set(['celestial'])

/**
 * SET SHELVES — the deliberate exception to the share.
 *
 * A small-makes ornament set IS six related minis; shipping them one a batch
 * would take six weeks to fill a shelf that customers buy a set at a time. So a
 * shelf whose theme carries a `setOf` tag in the subject pool may take up to
 * that many briefs in one batch. It is a CAP, not a floor: the shelf still only
 * gets what its deficit earns, so this only bites while the shelf is far behind.
 * A set cap never lowers the ordinary share, and never exceeds the batch.
 */
export type SetShelfCaps = Record<string, number>

/**
 * Hold every shelf to its share of the batch, moving the excess to the neediest
 * shelf that still has room.
 *
 * A soft-capped shelf keeps its overflow when there is genuinely nowhere to put
 * it (a nearly-finished catalogue with two shelves left); a hard-capped one gives
 * it up regardless, and the batch runs one brief short rather than shipping three
 * celestial pieces at once. `count` is the batch size the allocation was made for.
 * `setCaps` raises the share for set shelves (see above) and is empty for crafts
 * that have none.
 */
export function capShelfBriefs(alloc: ShelfAllocation[], count: number, setCaps: SetShelfCaps = {}): ShelfAllocation[] {
  const share = Math.max(1, Math.floor(count / SHELF_SHARE))
  // A hard-capped shelf is never a set shelf — the two rules would contradict.
  const capFor = (slug: string): number =>
    HARD_CAPPED.has(slug) ? share : Math.max(share, Math.min(setCaps[slug] ?? 0, count))
  const out = alloc.map((a) => ({ ...a }))
  let spare = 0
  for (const a of out) {
    const cap = capFor(a.slug)
    if (a.briefs <= cap) continue
    spare += a.briefs - cap
    a.briefs = cap
  }
  if (spare === 0) return out.filter((a) => a.briefs > 0)

  // Room goes to the biggest remaining gap first — the same rule the allocation
  // itself uses, so the cap re-weights rather than randomising.
  const room = out
    .filter((a) => a.briefs < capFor(a.slug) && !HARD_CAPPED.has(a.slug))
    .sort((a, b) => b.deficit - a.deficit || a.slug.localeCompare(b.slug))
  for (const a of room) {
    if (spare <= 0) break
    const take = Math.min(spare, capFor(a.slug) - a.briefs)
    a.briefs += take
    spare -= take
  }
  // Nowhere left under the cap — a short catalogue with few shelves still wanting
  // patterns. This is the "unless its deficit share demands more" case: the soft
  // shelves take the overflow back, but ONE AT A TIME in gap order, so the batch
  // widens evenly instead of handing a single shelf four slots again. A
  // hard-capped shelf never takes any of it back; if only hard-capped shelves
  // remain, the batch simply runs short.
  const soft = out.filter((a) => !HARD_CAPPED.has(a.slug)).sort((a, b) => b.deficit - a.deficit || a.slug.localeCompare(b.slug))
  while (spare > 0 && soft.length > 0) {
    for (const a of soft) {
      if (spare <= 0) break
      a.briefs++
      spare--
    }
  }
  return out.filter((a) => a.briefs > 0).sort((a, b) => b.briefs - a.briefs || a.slug.localeCompare(b.slug))
}

/** Expand an allocation into one shelf slug per brief, biggest shelf first. */
export function shelfSlots(alloc: ShelfAllocation[]): string[] {
  const out: string[] = []
  for (const a of alloc) for (let i = 0; i < a.briefs; i++) out.push(a.slug)
  return out
}

/**
 * The batch's shelf quota as a lookup: how many briefs each shelf may have.
 *
 * `shelfSlots` is the same information as a list; this is the form the brief
 * post-filter enforces against, because the allocation is only a REQUEST until
 * something checks it. Batch 6 was allocated one celestial slot and the planner
 * returned three.
 */
export function shelfQuotaCounts(slots: readonly string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of slots) out[s] = (out[s] ?? 0) + 1
  return out
}

/** True when every non-hold shelf has reached its target. */
export function allShelvesAtTarget(shelves: ShelfTarget[], counts: Record<string, number>): boolean {
  return shelfDeficits(shelves, counts).length === 0
}

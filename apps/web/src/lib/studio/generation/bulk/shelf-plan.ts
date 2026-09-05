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

/** Expand an allocation into one shelf slug per brief, biggest shelf first. */
export function shelfSlots(alloc: ShelfAllocation[]): string[] {
  const out: string[] = []
  for (const a of alloc) for (let i = 0; i < a.briefs; i++) out.push(a.slug)
  return out
}

/** True when every non-hold shelf has reached its target. */
export function allShelvesAtTarget(shelves: ShelfTarget[], counts: Record<string, number>): boolean {
  return shelfDeficits(shelves, counts).length === 0
}

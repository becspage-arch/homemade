/**
 * The duplicate DECISION, separated from the database that feeds it.
 *
 * `dedupe-guard.ts` is `server-only` — it loads the catalogue through Prisma —
 * which makes it unimportable from a plain test runner. The comparison itself is
 * pure: a candidate's fingerprints against a list of stored ones. It lives here
 * so it can be tested directly, and `dedupe-guard` re-exports it so callers
 * still see one module.
 */

import { nearDuplicateVerdict, type ChartFingerprint, type PatternFingerprint } from './similarity'
import { findSubjectKeyMatch, SUBJECT_JACCARD_MATCH } from './subject-key'

/** Everything the guard computes about a candidate before it publishes. */
export interface CandidateFingerprints extends PatternFingerprint {
  /** Normalised subject phrase — the text half of the check. */
  subjectKey: string
  /** sha256 of the Flux PNG the chart was converted from. */
  sourceSha256?: string
}

/**
 * One stored pattern, in the shape the verdict needs.
 *
 * `image` is null for rows that carry no comparable picture: a row the backfill
 * has not reached, and — deliberately — every CULLED row. A cull means the idea
 * is spent, so a culled row still blocks by SUBJECT; but its picture is
 * known-bad output and comparing against it would tell us nothing.
 */
export interface CatalogueEntry {
  id: string
  slug: string | null
  name: string
  subjectKey: string | null
  image: PatternFingerprint | null
}

export interface DuplicateHit {
  /** Slug (or id, for the rare slugless row) of what it duplicates. */
  slug: string
  name: string
  /** Which rule fired, with its measurement. */
  reason: string
}

/**
 * Compare one candidate against the catalogue. Text first — it is free, and it
 * is the signal the old pipeline was missing — then the image + chart
 * fingerprints. First hit wins and names itself.
 */
export function findDuplicate(candidate: CandidateFingerprints, catalogue: CatalogueEntry[]): DuplicateHit | null {
  // ── text: the same idea, however it was drawn ──────────────────────────────
  if (candidate.subjectKey) {
    const byKey = new Map<string, CatalogueEntry>()
    for (const e of catalogue) if (e.subjectKey) byKey.set(e.subjectKey, e)
    const match = findSubjectKeyMatch(candidate.subjectKey, byKey.keys())
    if (match) {
      const e = byKey.get(match.key)!
      return {
        slug: e.slug ?? e.id,
        name: e.name,
        reason:
          match.overlap >= 1
            ? `same subject as “${e.name}” (subject key “${match.key}”)`
            : `same subject as “${e.name}” (subject overlap ${match.overlap.toFixed(2)} ≥ ${SUBJECT_JACCARD_MATCH})`,
      }
    }
  }

  // ── image + chart: the same picture ────────────────────────────────────────
  for (const e of catalogue) {
    if (!e.image) continue
    let verdict
    try {
      verdict = nearDuplicateVerdict(candidate, e.image)
    } catch {
      continue // a malformed stored fingerprint must never block a publish
    }
    if (verdict.duplicate) return { slug: e.slug ?? e.id, name: e.name, reason: `${verdict.reason} as “${e.name}”` }
  }
  return null
}

// ─────────────────────── re-rolls and remembered kills ───────────────────────

/**
 * The slugs of the earlier rolls of a re-rolled idea.
 *
 * A re-roll is minted as `<the row it replaces>-r<n>`, so the chain of rolls
 * before this one is exactly the chain of slugs left when those suffixes are
 * peeled off: `sun-moon-a1b2-r1-r2` came from `sun-moon-a1b2-r1`, which came
 * from `sun-moon-a1b2`.
 *
 * WHY THIS EXISTS. A re-roll is the same brief by design — same subject, same
 * subject key — and the row it replaces is retired PRIVATE with a reason when
 * the request is taken off the queue, which puts it in the CULLED population
 * this module matches subjects against. So the guard killed every re-roll as a
 * duplicate of the very row a judging session had just asked to have rolled
 * again ("duplicate of coastal-a-seagull-on-a-weathered-mooring-post-6vtd"),
 * and no re-roll could ever land. The ancestors are therefore taken out of the
 * comparison set for that one candidate, and only for it.
 */
export function rerollAncestorSlugs(slug: string): string[] {
  const out: string[] = []
  let s = slug
  for (;;) {
    const m = /^(.+)-r\d+$/.exec(s)
    if (!m?.[1]) break
    s = m[1]
    out.push(s)
  }
  return out
}

/** Drop the named slugs from a comparison set. Rows with no slug are kept: a
 *  slugless row cannot be the one being re-rolled. */
export function withoutSlugs(entries: CatalogueEntry[], slugs: readonly string[]): CatalogueEntry[] {
  if (slugs.length === 0) return entries
  const skip = new Set(slugs)
  return entries.filter((e) => !e.slug || !skip.has(e.slug))
}

/**
 * The planner's avoid list: the subject keys drawn from ROWS, plus the keys of
 * ideas recent runs killed as duplicates.
 *
 * A duplicate kill leaves no row at all — the candidate is discarded before it
 * is written — so the row-derived list has no memory of it and the planner
 * re-commissions the same subject on the next firing, pays for another Flux
 * generation, and is told the same thing. Two subjects went round that loop
 * twice each across three of the September 2026 firings.
 */
export function avoidListWithDuplicateKills(
  rowKeys: readonly string[],
  duplicateKillKeys: readonly string[],
): string[] {
  return [...new Set([...rowKeys, ...duplicateKillKeys].filter(Boolean))]
}

export type { ChartFingerprint }

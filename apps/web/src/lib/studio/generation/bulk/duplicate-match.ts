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

export type { ChartFingerprint }

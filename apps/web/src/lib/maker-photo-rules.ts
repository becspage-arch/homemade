/**
 * The pure rules behind maker photos: what a photo attaches to, when it may be
 * shown, and how a gate reply becomes a decision. No database, no network, no
 * `server-only` — so the rules can be tested on their own and imported from
 * either side of the client boundary.
 */

import type { PatternType } from '@homemade/db'

/** The made thing a photo belongs to. Exactly one shape, never both. */
export type PhotoTarget =
  | { kind: 'tutorial'; tutorialId: string }
  | { kind: 'pattern'; patternId: string; patternType: PatternType }

/** Plain-English label for a pattern type, used in the gate prompt and headings. */
export const PATTERN_TYPE_LABEL: Record<PatternType, string> = {
  CROSS_STITCH: 'cross-stitch pattern',
  KNITTING_CHART: 'knitting pattern',
  CROCHET_CHART: 'crochet pattern',
  NEEDLEWORK: 'needlework pattern',
  SEWING: 'sewing pattern',
}

/**
 * Whether one photo may be shown on a public surface. The single rule every
 * surface goes through, so "removed and rejected never show" is decided once.
 */
export function isPubliclyVisible(photo: {
  status: string
  removedAt: Date | null
}): boolean {
  return photo.status === 'APPROVED' && photo.removedAt === null
}

/** The `where` fragment that scopes a query to one target. */
export function targetWhere(target: PhotoTarget) {
  return target.kind === 'tutorial'
    ? { tutorialId: target.tutorialId }
    : { patternId: target.patternId, patternType: target.patternType }
}

/** The fields written on a new photo row for one target. */
export function targetData(target: PhotoTarget) {
  return target.kind === 'tutorial'
    ? { tutorialId: target.tutorialId, patternId: null, patternType: null }
    : {
        tutorialId: null,
        patternId: target.patternId,
        patternType: target.patternType,
      }
}

export type GateDecision = 'approve' | 'reject' | 'pending'

/**
 * Turns whatever the model replied with into a decision. Fail closed:
 * everything that is not an unambiguous "approve" or "reject" with the shape we
 * asked for is "pending", never a silent approval and never a rejection the
 * member cannot be given a reason for.
 */
export function parseGateVerdict(raw: unknown): {
  decision: GateDecision
  reasons: string[]
} {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { decision: 'pending', reasons: [] }
  }
  const v = raw as { decision?: unknown; reasons?: unknown }
  const reasons = Array.isArray(v.reasons)
    ? v.reasons
        .filter((r): r is string => typeof r === 'string')
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
        .slice(0, 2)
    : []

  if (v.decision === 'approve') return { decision: 'approve', reasons: [] }
  if (v.decision === 'reject') {
    // A rejection with no reason cannot be shown to the member, and inventing
    // one would misrepresent what the gate said. Hold it as pending instead.
    if (reasons.length === 0) return { decision: 'pending', reasons: [] }
    return { decision: 'reject', reasons }
  }
  return { decision: 'pending', reasons: [] }
}

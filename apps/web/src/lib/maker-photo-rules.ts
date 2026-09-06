/**
 * The pure rules behind maker photos: what a photo attaches to, when it may be
 * shown, and how a gate reply becomes a decision. No database, no network, no
 * `server-only` — so the rules can be tested on their own and imported from
 * either side of the client boundary.
 */

import type { PatternType } from '@homemade/db'

/**
 * THE BAR — the three rules a maker photo has to pass, and the only thing
 * either judge is allowed to judge on.
 *
 * They live here, free of `server-only`, so the API gate
 * (`maker-photo-gate.ts`, which builds its SYSTEM prompt out of them) and the
 * routine's judging CLI (`scripts/maker-photos-judge.ts`, which prints them)
 * read the SAME words. Two modes, one bar: the rules must not be able to drift
 * apart depending on who is looking.
 */
export const MAKER_PHOTO_RULES = [
  'REAL PHOTOGRAPH OF A REAL FINISHED THING. A camera photograph of a physical object that exists. Reject a screenshot, a chart or pattern diagram, a digital render or mock-up, a drawing, a stock or catalogue product photo, a photo of a screen, or an image lifted from a shop listing.',
  "PLAUSIBLY THE RIGHT THING. It shows the item described, or something a person could reasonably have made from it. You are given the item's title, and for a pattern you are also given the chart or design as a second image. Judge whether the photograph plausibly depicts that item. Colours, finishing, framing, styling and skill all vary between makers, so allow wide latitude: reject only when it clearly shows something else.",
  'SAFE TO SHOW. No nudity or sexual content. No identifiable children. Nothing hateful, violent or abusive. Incidental adults in the background are fine. A photograph whose main subject is a person rather than the made thing is a reject.',
] as const

/** What is explicitly NOT a reject — the half of the bar that is easiest to get wrong. */
export const MAKER_PHOTO_NOT_A_REJECT =
  'Work in progress is fine if the piece is real and recognisable. A dark, blurry or badly lit photo is still a real photo: approve it. Judge whether the photo is true, not whether it is good.'

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

/**
 * Tutorial types that produce nothing a person can photograph.
 *
 * Maker photos belong on anything with a made thing: a dish, a remedy, a crop,
 * a pattern, and the technique and stitch tutorials that leave a worked sample
 * behind. They do not belong on a piece you only read or only do.
 *
 *  - PRACTICE is a mindset exercise. It is done, not made, and it is the whole
 *    of the mindset category (every mindset tutorial is PRACTICE or READING),
 *    so this is how mindset is excluded: by what the piece is, not by a
 *    hard-coded category slug.
 *  - READING is a text piece. It appears across nine categories and none of
 *    them leaves an object behind.
 *  - HERB_PROFILE is a materia-medica entry about a plant, not a preparation.
 *    The herbal REMEDY tutorials next to it are makes and keep their photos.
 */
const NO_MADE_THING: readonly string[] = ['PRACTICE', 'READING', 'HERB_PROFILE']

/**
 * Whether a tutorial has a made thing, and so whether the maker-photo strip
 * belongs on its page. Everything else is in: RECIPE, REMEDY, GROWING_GUIDE,
 * PATTERN, TECHNIQUE and STITCH, across every tutorial-led category.
 */
export function tutorialTakesMakerPhotos(type: string): boolean {
  return !NO_MADE_THING.includes(type)
}

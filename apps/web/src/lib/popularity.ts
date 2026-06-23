/**
 * Pattern popularity signal (phase_pattern_popularity_001).
 *
 * A pattern's popularityScore is a denormalised, indexed sort key kept exactly
 * equal to the formula
 *
 *   popularityScore = viewCount + 3*saveCount + 5*completionCount
 *
 * by bumping the score by the SAME weighted delta as the counter, in one atomic
 * UPDATE per event. The migration seeds counters + score consistently, so as
 * long as every mutation goes through here they never drift — no periodic
 * recompute needed. Sorting reads one integer column.
 *
 * Weights: a finished project (5) counts most, a save (3) next, a view (1)
 * least. Pre-launch everything is 0, so a popularityScore sort falls back to
 * publishedAt (most-recent) and auto-fills as real usage lands.
 */

import { prisma } from '@homemade/db'

const SAVE_WEIGHT = 3
const COMPLETION_WEIGHT = 5

/** Record a detail-page view: +1 view, +1 score. Fire-and-forget safe. */
export async function bumpPatternView(patternId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Pattern"
    SET "viewCount" = "viewCount" + 1,
        "popularityScore" = "popularityScore" + 1
    WHERE id = ${patternId}`
}

/** Apply a save/unsave to a pattern's counters. delta is +1 (save) or -1. */
export async function bumpPatternSave(patternId: string, delta: 1 | -1): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Pattern"
    SET "saveCount" = GREATEST("saveCount" + ${delta}, 0),
        "popularityScore" = GREATEST("popularityScore" + ${delta * SAVE_WEIGHT}, 0)
    WHERE id = ${patternId}`
}

/** Apply a completion/un-completion to a pattern's counters. delta is +1 or -1. */
export async function bumpPatternCompletion(patternId: string, delta: 1 | -1): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Pattern"
    SET "completionCount" = GREATEST("completionCount" + ${delta}, 0),
        "popularityScore" = GREATEST("popularityScore" + ${delta * COMPLETION_WEIGHT}, 0)
    WHERE id = ${patternId}`
}

/** Record a detail-page view for a crochet pattern: +1 view, +1 score. */
export async function bumpCrochetPatternView(crochetPatternId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "CrochetPattern"
    SET "viewCount" = "viewCount" + 1,
        "popularityScore" = "popularityScore" + 1
    WHERE id = ${crochetPatternId}`
}

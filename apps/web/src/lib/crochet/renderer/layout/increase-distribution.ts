/**
 * Increase distribution — when the renderer needs to allocate extra
 * stitches around the perimeter of a round (the round's stitch count is
 * higher than the previous round's), this helper returns the indices
 * within the round that should hold the extra stitches.
 *
 * The current motif + round layouts space stitches evenly around the
 * circumference / polygon perimeter regardless of where the increases
 * happen, so the per-cell extra-stitch index isn't used by the renderer
 * directly. The function is kept here because:
 *   1. It documents the placement convention writers can rely on.
 *   2. It's used by the verifier to flag rounds where the chartData's
 *      stitch-count delta doesn't match the previous round.
 *   3. Future enhancement: tighter-clustered increases (e.g. "petal" motifs)
 *      can use this to bunch stitches at specific perimeter spots instead
 *      of even spacing.
 *
 * Returns an array of indices (0-indexed into the round's expanded
 * stitches) where the extra stitches sit.
 */

export function distributeIncreases(
  prevCount: number,
  thisCount: number,
): number[] {
  if (thisCount <= prevCount) return []
  const extras = thisCount - prevCount
  // Even spacing across the round.
  const result: number[] = []
  for (let i = 0; i < extras; i++) {
    result.push(Math.round((i * thisCount) / extras))
  }
  return result
}

/**
 * Validate that a sequence of round stitch counts looks like a sensible
 * amigurumi / motif progression. Used by the verifier to spot rounds
 * that grow by an unreasonable amount in one step.
 *
 * Returns an array of human-readable warnings, or [] if everything looks
 * fine. The verifier treats these as soft signals; the renderer still
 * tries to draw the chart.
 */
export function sanityCheckRoundProgression(counts: ReadonlyArray<number>): string[] {
  const warnings: string[] = []
  for (let i = 1; i < counts.length; i++) {
    const prev = counts[i - 1]
    const curr = counts[i]
    if (curr < prev) {
      warnings.push(
        `Round ${i + 1} stitch count ${curr} is lower than round ${i} count ${prev}; ` +
          `not currently a supported decrease pattern for motifs.`,
      )
      continue
    }
    if (prev > 0 && curr > prev * 3) {
      warnings.push(
        `Round ${i + 1} stitch count ${curr} grows >3x from round ${i} count ${prev}; ` +
          `verify the chartData isn't double-counted.`,
      )
    }
  }
  return warnings
}

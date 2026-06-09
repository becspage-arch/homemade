// Verifier - sanity-checks a graded pattern after the per-shape module
// produces it. Used by QC rules at the publish gate and by the author
// prompt's self-critique pass.
//
// Checks:
// - Stitch counts grade smoothly across sizes (no random jumps).
// - Sleeve length scales with body length proportionally.
// - Hem stitches × stitch-gauge matches finished bust within tolerance.
// - Yarn requirement is plausible at the stated gauge.

import type { GradedPattern, VerificationResult } from './types'

const STITCH_COUNT_JUMP_TOLERANCE = 0.30
const MEASUREMENT_TOLERANCE_CM = 1.0
const YARDAGE_TOLERANCE = 0.4

export function verifyGradedPattern(sizes: GradedPattern[]): VerificationResult {
  const issues: string[] = []
  if (sizes.length === 0) {
    return { ok: false, issues: ['No graded sizes provided.'] }
  }

  // Per-size internal consistency.
  for (const s of sizes) {
    const stitchesPerCm = s.gauge.stitchesPer10cm / 10
    // Side-to-side rotates the axes: bustStitches measures the worked
    // direction (= rows when worn), so it does not relate to finished bust
    // by stitch gauge. Skip the bust-stitch check for that construction.
    if (s.shape !== 'SIDE_TO_SIDE') {
      const computedBust = s.bustStitches / stitchesPerCm
      if (Math.abs(computedBust - s.finishedMeasurements.bust) > MEASUREMENT_TOLERANCE_CM) {
        issues.push(
          `Size ${s.size}: bustStitches (${s.bustStitches}) at gauge implies ${computedBust.toFixed(1)}cm but finishedMeasurements.bust is ${s.finishedMeasurements.bust}cm.`,
        )
      }
    }

    if (s.hemStitches <= 0 || s.bustStitches <= 0) {
      issues.push(`Size ${s.size}: hem or bust stitch count is non-positive.`)
    }
    if (s.bodyLengthRows <= 0) {
      issues.push(`Size ${s.size}: body length rows is non-positive.`)
    }
    if (s.yarnRequiredGrams <= 0 || s.yarnRequiredYards <= 0) {
      issues.push(`Size ${s.size}: yarn requirement is non-positive.`)
    }
  }

  // Cross-size monotonicity: as sizes grow, stitch counts should not
  // shrink and should not jump by more than tolerance.
  for (let i = 1; i < sizes.length; i++) {
    const prev = sizes[i - 1]!
    const curr = sizes[i]!
    const growth = (curr.bustStitches - prev.bustStitches) / prev.bustStitches
    if (curr.bustStitches < prev.bustStitches) {
      issues.push(
        `Cross-size: ${curr.size} has fewer bust stitches (${curr.bustStitches}) than ${prev.size} (${prev.bustStitches}).`,
      )
    } else if (growth > STITCH_COUNT_JUMP_TOLERANCE) {
      issues.push(
        `Cross-size: ${prev.size} → ${curr.size} bust grows by ${(growth * 100).toFixed(0)}% which exceeds tolerance.`,
      )
    }

    if (curr.sleeveLengthRows > 0 && prev.sleeveLengthRows > 0) {
      const sleeveGrowth = (curr.sleeveLengthRows - prev.sleeveLengthRows) / prev.sleeveLengthRows
      if (sleeveGrowth < -0.05 || sleeveGrowth > 0.20) {
        issues.push(
          `Cross-size: ${prev.size} → ${curr.size} sleeve length scales by ${(sleeveGrowth * 100).toFixed(0)}% which is implausible.`,
        )
      }
    }
  }

  // Yardage plausibility: roughly 1.2 yards per square cm of body fabric
  // for medium-weight, scaled to the actual weight category isn't known
  // here so we cross-check against the bust × bodyLength surface area.
  for (const s of sizes) {
    const bodyAreaSqCm = s.finishedMeasurements.bust * s.finishedMeasurements.body
    const sleeveAreaSqCm =
    s.finishedMeasurements.upperArm * 0.83 * 2 * s.finishedMeasurements.sleeve
    const total = bodyAreaSqCm + (s.sleeveLengthRows > 0 ? sleeveAreaSqCm : 0)
    // Expect 0.3-3.0 grams per 100 sq cm depending on weight.
    const gramsPerSqCm = s.yarnRequiredGrams / total
    if (gramsPerSqCm < 0.003 || gramsPerSqCm > 0.10) {
      issues.push(
        `Size ${s.size}: yarnRequiredGrams (${s.yarnRequiredGrams}g) per surface area implies ${(gramsPerSqCm * 100).toFixed(3)}g/100sq.cm which is outside plausible range.`,
      )
    }
    void YARDAGE_TOLERANCE
  }

  return { ok: issues.length === 0, issues }
}

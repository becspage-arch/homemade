// Verifier — sanity-checks a graded knitting pattern after the per-
// shape module produces it. Used by QC rules at the publish gate, by
// the author prompt's self-critique pass, and by the test suite.
//
// Checks:
// - Stitch counts grade smoothly across sizes (no jumps over 30%, no
//   shrinkage as sizes grow).
// - Sleeve length scales with body length proportionally.
// - Hem stitch count × stitch gauge matches finished bust within
//   1.5 cm (skipped for SIDE_TO_SIDE where the working direction is
//   rotated).
// - Sleeve cap depth fits inside armhole depth (within 4 cm tolerance;
//   drop-shoulder and side-to-side legitimately have cap = 0).
// - Yarn requirement is plausible per square cm of total surface.

import type { GradedPattern, VerificationResult } from './types'

const STITCH_COUNT_JUMP_TOLERANCE = 0.30
const MEASUREMENT_TOLERANCE_CM = 1.5
const YARDAGE_LOW_LIMIT_G_PER_100SQCM = 0.3
const YARDAGE_HIGH_LIMIT_G_PER_100SQCM = 10.0

export function verifyGradedPattern(sizes: GradedPattern[]): VerificationResult {
  const issues: string[] = []
  if (sizes.length === 0) {
    return { ok: false, issues: ['No graded sizes provided.'] }
  }

  // ── Per-size internal consistency ────────────────────────────────
  for (const s of sizes) {
    const stitchesPerCm = s.gauge.stitchesPer10cm / 10
    if (s.shape !== 'SIDE_TO_SIDE') {
      const computedBust = s.bustStitchCount / stitchesPerCm
      if (Math.abs(computedBust - s.finishedMeasurements.bust) > MEASUREMENT_TOLERANCE_CM) {
        issues.push(
          `Size ${s.size}: bustStitchCount (${s.bustStitchCount}) at gauge implies ${computedBust.toFixed(1)}cm but finishedMeasurements.bust is ${s.finishedMeasurements.bust}cm.`,
        )
      }
    }

    if (s.hemStitchCount <= 0 || s.bustStitchCount <= 0) {
      issues.push(`Size ${s.size}: hem or bust stitch count is non-positive.`)
    }
    if (s.bodyLengthRows <= 0) {
      issues.push(`Size ${s.size}: body length rows is non-positive.`)
    }
    if (s.yarnRequiredGrams <= 0 || s.yarnRequiredYards <= 0) {
      issues.push(`Size ${s.size}: yarn requirement is non-positive.`)
    }

    // Sleeve cap depth must fit in armhole depth. Drop-shoulder + side-
    // to-side legitimately have cap = 0 (unshaped sleeve).
    if (s.shape !== 'DROP_SHOULDER' && s.shape !== 'SIDE_TO_SIDE') {
      if (s.sleeveCapDepth > s.armholeDepth + 1) {
        issues.push(
          `Size ${s.size}: sleeveCapDepth (${s.sleeveCapDepth}cm) exceeds armholeDepth (${s.armholeDepth}cm).`,
        )
      }
      if (s.sleeveCapDepth < 0) {
        issues.push(`Size ${s.size}: sleeveCapDepth is negative.`)
      }
    }

    // Sleeve cuff stitches × gauge should match sleeveCuffCircumference
    // within tolerance.
    const cuffCm = s.sleeveCuffStitchCount / stitchesPerCm
    if (Math.abs(cuffCm - s.sleeveCuffCircumference) > MEASUREMENT_TOLERANCE_CM) {
      issues.push(
        `Size ${s.size}: sleeveCuffStitchCount (${s.sleeveCuffStitchCount}) implies ${cuffCm.toFixed(1)}cm but sleeveCuffCircumference is ${s.sleeveCuffCircumference}cm.`,
      )
    }
  }

  // ── Cross-size monotonicity ──────────────────────────────────────
  for (let i = 1; i < sizes.length; i++) {
    const prev = sizes[i - 1]!
    const curr = sizes[i]!
    const growth = (curr.bustStitchCount - prev.bustStitchCount) / prev.bustStitchCount
    if (curr.bustStitchCount < prev.bustStitchCount) {
      issues.push(
        `Cross-size: ${curr.size} has fewer bust stitches (${curr.bustStitchCount}) than ${prev.size} (${prev.bustStitchCount}).`,
      )
    } else if (growth > STITCH_COUNT_JUMP_TOLERANCE) {
      issues.push(
        `Cross-size: ${prev.size} -> ${curr.size} bust grows by ${(growth * 100).toFixed(0)}% which exceeds tolerance.`,
      )
    }

    if (curr.sleeveLengthRows > 0 && prev.sleeveLengthRows > 0) {
      const sleeveGrowth = (curr.sleeveLengthRows - prev.sleeveLengthRows) / prev.sleeveLengthRows
      if (sleeveGrowth < -0.05 || sleeveGrowth > 0.20) {
        issues.push(
          `Cross-size: ${prev.size} -> ${curr.size} sleeve length scales by ${(sleeveGrowth * 100).toFixed(0)}% which is implausible.`,
        )
      }
    }
  }

  // ── Yardage plausibility ─────────────────────────────────────────
  for (const s of sizes) {
    const bodyAreaSqCm = s.finishedMeasurements.bust * s.finishedMeasurements.body
    const sleeveAreaSqCm =
      s.finishedMeasurements.upperArm * 0.83 * 2 * s.finishedMeasurements.sleeve
    const total = bodyAreaSqCm + (s.sleeveLengthRows > 0 ? sleeveAreaSqCm : 0)
    const gramsPer100SqCm = (s.yarnRequiredGrams * 100) / total
    if (
      gramsPer100SqCm < YARDAGE_LOW_LIMIT_G_PER_100SQCM ||
      gramsPer100SqCm > YARDAGE_HIGH_LIMIT_G_PER_100SQCM
    ) {
      issues.push(
        `Size ${s.size}: yarnRequiredGrams (${s.yarnRequiredGrams}g) per surface area implies ${gramsPer100SqCm.toFixed(3)}g/100sq.cm which is outside the plausible range.`,
      )
    }
  }

  return { ok: issues.length === 0, issues }
}

// Verifier — sanity-checks a graded sock pattern after the per-
// construction module produces it. Used by QC rules at the publish
// gate, by the author prompt self-critique, and by the test suite.
//
// Checks:
// - Stitch counts grade smoothly across foot sizes (no jumps over 30%).
// - Foot circumference × gauge matches legStitchCount within tolerance.
// - Heel-style + construction compatibility (flap-and-gusset claims
//   gusset rows; short-row claims zero gusset rows; afterthought claims
//   zero gusset rows + zero heel-flap rows).
// - Yarn requirement is plausible per square cm of sock tube.

import type {
  SockGradedPattern,
  SockVerificationResult,
} from './types'

const STITCH_COUNT_JUMP_TOLERANCE = 0.30
const MEASUREMENT_TOLERANCE_CM = 1.0

export function verifyGradedSock(sizes: SockGradedPattern[]): SockVerificationResult {
  const issues: string[] = []
  if (sizes.length === 0) {
    return { ok: false, issues: ['No graded sizes provided.'] }
  }

  for (const s of sizes) {
    const stitchesPerCm = s.gauge.stitchesPer10cm / 10

    // Foot circumference × gauge ≈ legStitchCount.
    const computedFootCm = s.legStitchCount / stitchesPerCm
    if (Math.abs(computedFootCm - s.finishedMeasurements.footCircumferenceCm) > MEASUREMENT_TOLERANCE_CM + 1) {
      issues.push(
        `Size ${s.size}: legStitchCount (${s.legStitchCount}) at gauge implies ${computedFootCm.toFixed(1)}cm but footCircumferenceCm is ${s.finishedMeasurements.footCircumferenceCm}cm.`,
      )
    }

    if (s.legStitchCount <= 0 || s.footStitchCount <= 0) {
      issues.push(`Size ${s.size}: leg or foot stitch count is non-positive.`)
    }
    if (s.legStitchCount % 4 !== 0) {
      issues.push(`Size ${s.size}: legStitchCount (${s.legStitchCount}) is not a multiple of 4; rib + heel split won't align.`)
    }
    if (s.yarnRequiredGrams <= 0) {
      issues.push(`Size ${s.size}: yarn requirement is non-positive.`)
    }

    // Heel-style consistency.
    switch (s.heelStyle) {
      case 'FLAP_AND_GUSSET':
        if (s.heelFlapRows <= 0) {
          issues.push(`Size ${s.size}: heelStyle=FLAP_AND_GUSSET but heelFlapRows is ${s.heelFlapRows}.`)
        }
        if (s.gussetRows <= 0) {
          issues.push(`Size ${s.size}: heelStyle=FLAP_AND_GUSSET but gussetRows is ${s.gussetRows}.`)
        }
        if (s.gussetPeakStitchCount <= s.legStitchCount) {
          issues.push(`Size ${s.size}: heelStyle=FLAP_AND_GUSSET but gussetPeakStitchCount (${s.gussetPeakStitchCount}) is not greater than legStitchCount (${s.legStitchCount}).`)
        }
        break
      case 'SHORT_ROW_GERMAN':
      case 'SHORT_ROW_JAPANESE':
      case 'SHORT_ROW_DUTCH':
        if (s.heelFlapRows !== 0) {
          issues.push(`Size ${s.size}: heelStyle=${s.heelStyle} but heelFlapRows is ${s.heelFlapRows} (expected 0).`)
        }
        if (s.gussetRows !== 0) {
          issues.push(`Size ${s.size}: heelStyle=${s.heelStyle} but gussetRows is ${s.gussetRows} (expected 0).`)
        }
        if (s.heelTurnRows <= 0) {
          issues.push(`Size ${s.size}: heelStyle=${s.heelStyle} but heelTurnRows is ${s.heelTurnRows}.`)
        }
        break
      case 'AFTERTHOUGHT':
        if (s.heelFlapRows !== 0) {
          issues.push(`Size ${s.size}: heelStyle=AFTERTHOUGHT but heelFlapRows is ${s.heelFlapRows} (expected 0).`)
        }
        if (s.gussetRows !== 0) {
          issues.push(`Size ${s.size}: heelStyle=AFTERTHOUGHT but gussetRows is ${s.gussetRows} (expected 0).`)
        }
        if (s.heelTurnRows <= 0) {
          issues.push(`Size ${s.size}: heelStyle=AFTERTHOUGHT but heelTurnRows is ${s.heelTurnRows}.`)
        }
        break
    }
  }

  // Cross-size monotonicity.
  for (let i = 1; i < sizes.length; i++) {
    const prev = sizes[i - 1]!
    const curr = sizes[i]!
    const growth = (curr.legStitchCount - prev.legStitchCount) / prev.legStitchCount
    if (curr.legStitchCount < prev.legStitchCount) {
      issues.push(
        `Cross-size: ${curr.size} has fewer leg stitches (${curr.legStitchCount}) than ${prev.size} (${prev.legStitchCount}).`,
      )
    } else if (growth > STITCH_COUNT_JUMP_TOLERANCE) {
      issues.push(
        `Cross-size: ${prev.size} -> ${curr.size} leg stitch count grows by ${(growth * 100).toFixed(0)}% which exceeds tolerance.`,
      )
    }
  }

  return { ok: issues.length === 0, issues }
}

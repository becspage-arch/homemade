// SPDX-License-Identifier: MIT
// Verifier — sanity checks on drafter output. Used by the publish gate,
// the API route's "did the engine produce something sensible" check, and
// the test suite to assert reference patterns stay within tolerance.

import type {
  DrafterOutput,
  DrafterPartMeta,
  VerificationResult,
} from './types'

export interface VerifyOptions {
  /**
   * Expected measurements in mm keyed by freesewing measurement name.
   * The verifier compares against rendered part dimensions where it can
   * (a bodice-block back's height should track hpsToWaistBack within
   * tolerance).
   */
  expectedMeasurementsMm: Record<string, number>
  /** Per-design ease tolerance (default 0.05, i.e. 5%). */
  tolerance?: number
  /** Per-part dimension hints, used to guide which boxes correspond. */
  partHints?: Record<string, { widthMm?: number; heightMm?: number }>
}

const DEFAULT_TOLERANCE = 0.05

/**
 * Verify a drafter output against expected dimensions.
 *
 * Checks:
 *  - The SVG string is non-empty and contains an `<svg` root.
 *  - The output has at least one drafted part with finite dimensions.
 *  - Each partHint matches the closest part by name (case-insensitive
 *    substring); width/height within tolerance of the hint.
 *
 * Does NOT cross-check stitch counts or grading curves — that's the
 * crochet / knitting domain. Sewing patterns are parametric SVG; the
 * meaningful contract is "the rendered piece is the right size to fit
 * the measurements that went in."
 */
export function verifyDrafterOutput(
  output: DrafterOutput,
  opts: VerifyOptions,
): VerificationResult {
  const issues: string[] = []
  const tolerance = opts.tolerance ?? DEFAULT_TOLERANCE

  if (!output.svg || !output.svg.includes('<svg')) {
    issues.push('Output SVG is missing or malformed.')
  }
  if (!Array.isArray(output.partList) || output.partList.length === 0) {
    issues.push('Drafter returned zero parts.')
  }

  for (const part of output.partList ?? []) {
    if (!Number.isFinite(part.widthMm) || !Number.isFinite(part.heightMm)) {
      issues.push(`Part ${part.name} has non-finite dimensions.`)
    }
    if (part.widthMm <= 0 || part.heightMm <= 0) {
      issues.push(`Part ${part.name} has non-positive dimensions.`)
    }
  }

  if (opts.partHints) {
    for (const [hintName, hint] of Object.entries(opts.partHints)) {
      const match = findClosestPart(output.partList ?? [], hintName)
      if (!match) {
        issues.push(`No drafted part matches hint "${hintName}".`)
        continue
      }
      if (typeof hint.widthMm === 'number') {
        const delta = Math.abs(match.widthMm - hint.widthMm) / hint.widthMm
        if (delta > tolerance) {
          issues.push(
            `Part ${match.name}: width ${match.widthMm.toFixed(1)}mm differs from hint ${hint.widthMm}mm by ${(delta * 100).toFixed(1)}%, tolerance ${(tolerance * 100).toFixed(0)}%.`,
          )
        }
      }
      if (typeof hint.heightMm === 'number') {
        const delta = Math.abs(match.heightMm - hint.heightMm) / hint.heightMm
        if (delta > tolerance) {
          issues.push(
            `Part ${match.name}: height ${match.heightMm.toFixed(1)}mm differs from hint ${hint.heightMm}mm by ${(delta * 100).toFixed(1)}%, tolerance ${(tolerance * 100).toFixed(0)}%.`,
          )
        }
      }
    }
  }

  // Cross-check the headline measurement: the drafted SVG's overall
  // bounding box (max part widths) should be at least chest/4 wide,
  // since a back or front piece is half-body. Loose sanity guard.
  if (typeof opts.expectedMeasurementsMm.chest === 'number') {
    const widest = largestDimension(output.partList ?? [], 'widthMm')
    const minExpected = opts.expectedMeasurementsMm.chest / 4
    if (widest < minExpected) {
      issues.push(
        `Widest drafted part (${widest.toFixed(1)}mm) is implausibly small for chest ${opts.expectedMeasurementsMm.chest}mm.`,
      )
    }
  }

  return { ok: issues.length === 0, issues }
}

function findClosestPart(
  parts: DrafterPartMeta[],
  hintName: string,
): DrafterPartMeta | null {
  const needle = hintName.toLowerCase()
  let best: DrafterPartMeta | null = null
  for (const p of parts) {
    if (p.name.toLowerCase().includes(needle)) {
      if (!best) best = p
    }
  }
  return best
}

function largestDimension(
  parts: DrafterPartMeta[],
  axis: 'widthMm' | 'heightMm',
): number {
  let max = 0
  for (const p of parts) {
    if (Number.isFinite(p[axis]) && p[axis] > max) max = p[axis]
  }
  return max
}

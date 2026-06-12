// SPDX-License-Identifier: MIT
// Trim-seam-allowance helper. Takes a closed polyline that represents a
// pattern piece with seam allowance baked in and shrinks it inward by
// the allowance distance, producing the finished-piece silhouette.
//
// Used by archetypes that consume freesewing pattern-piece geometry
// (paths from Pattern.parts[part].topLeft / bottomRight bounding boxes)
// where the seam allowance is added at draft time. The finished
// silhouette is what shows in a tech-pack flat.
//
// Algorithm: for each vertex, compute the inward-pointing bisector of
// the two adjacent edges (averaged unit normals) and step inward by
// `allowanceMm`. Sharp corners get clamped so the bisector doesn't blow
// up at near-180-degree angles.

export interface Point2D {
  x: number
  y: number
}

/** Shrink a closed polyline inward by `allowanceMm`. The polyline is
 *  assumed to be wound clockwise; counter-clockwise input produces a
 *  silhouette that grows outward instead — caller's responsibility. */
export function trimSeamAllowance(
  poly: readonly Point2D[],
  allowanceMm: number,
): Point2D[] {
  if (poly.length < 3) return [...poly]
  if (allowanceMm <= 0) return [...poly]

  // Pre-compute unit normals for each edge (pointing inward for CW poly).
  const n = poly.length
  const normals: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const a = poly[i]!
    const b = poly[(i + 1) % n]!
    const ex = b.x - a.x
    const ey = b.y - a.y
    const len = Math.hypot(ex, ey)
    if (len === 0) {
      normals.push({ x: 0, y: 0 })
      continue
    }
    // Inward normal for a clockwise polygon in screen-space (y grows
    // down). Rotate edge vector +90° about the origin:
    //   (ex, ey) -> (-ey, ex)
    // For the top edge of a CW square (ex>0, ey=0) the inward normal
    // points down (+y), as expected.
    normals.push({ x: -ey / len, y: ex / len })
  }

  // For each vertex, bisector = average of the two adjacent edge normals.
  const out: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const nPrev = normals[(i - 1 + n) % n]!
    const nNext = normals[i]!
    let bx = nPrev.x + nNext.x
    let by = nPrev.y + nNext.y
    const bLen = Math.hypot(bx, by)
    if (bLen === 0) {
      // Edge case: 180-degree corner. Pick either adjacent normal.
      bx = nNext.x
      by = nNext.y
    } else {
      bx /= bLen
      by /= bLen
    }
    // Compute the bisector scaling so the perpendicular distance from
    // the original edges is `allowanceMm`. cos(theta/2) where theta is
    // the corner's interior angle.
    const cosHalf = bx * nNext.x + by * nNext.y
    // Clamp sharply acute corners so the offset point stays sane.
    const scale = allowanceMm / Math.max(cosHalf, 0.25)
    out.push({
      x: poly[i]!.x + bx * scale,
      y: poly[i]!.y + by * scale,
    })
  }
  return out
}

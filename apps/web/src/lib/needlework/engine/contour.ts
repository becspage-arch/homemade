/**
 * Region -> geometry. Two shapes the loom contract needs:
 *   - an OUTLINE polygon for fills (satin / long-and-short clip to it);
 *   - a CENTRELINE polyline for lines (stem / back stitch lay thread along it).
 *
 * The centreline reuses the loom's own skeletoniser (Zhang-Suen thin + walk),
 * the same code that traces a printed chart, so a wispy region resolves to the
 * single path a stitcher would actually work.
 */

import { thin, type Mask } from '../../loom/trace/skeleton'
import { trace, simplify } from '../../loom/trace/vectorize'

/** The minimal region shape the contour/centreline helpers need. */
export interface MaskRegion {
  pixels: number[]
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Build a padded crop mask of a region (1 = region pixel). `pad` px border. */
function cropMask(region: MaskRegion, srcWidth: number, pad = 1): { mask: Mask; ox: number; oy: number } {
  const ox = region.minX - pad
  const oy = region.minY - pad
  const w = region.maxX - region.minX + 1 + 2 * pad
  const h = region.maxY - region.minY + 1 + 2 * pad
  const data = new Uint8Array(w * h)
  for (const p of region.pixels) {
    const x = (p % srcWidth) - ox
    const y = ((p / srcWidth) | 0) - oy
    data[y * w + x] = 1
  }
  return { mask: { w, h, data }, ox, oy }
}

/** Grow a mask by `iters` px (4-neighbour dilation), in place on a copy. */
function dilate(mask: Mask, iters: number): Mask {
  let data = mask.data
  const { w, h } = mask
  for (let it = 0; it < iters; it++) {
    const next = Uint8Array.from(data)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[y * w + x] === 1) continue
        if (
          (x > 0 && data[y * w + x - 1] === 1) ||
          (x < w - 1 && data[y * w + x + 1] === 1) ||
          (y > 0 && data[(y - 1) * w + x] === 1) ||
          (y < h - 1 && data[(y + 1) * w + x] === 1)
        ) {
          next[y * w + x] = 1
        }
      }
    }
    data = next
  }
  return { w, h, data }
}

/**
 * Outer contour of a region as an ordered polygon (working px), simplified.
 * Moore-neighbour boundary following on the crop mask, then Douglas-Peucker.
 */
export function regionContour(
  region: MaskRegion,
  srcWidth: number,
  epsPx = 1.4,
  dilatePx = 0,
): [number, number][] {
  const base = cropMask(region, srcWidth, Math.max(1, dilatePx + 1))
  const mask = dilatePx > 0 ? dilate(base.mask, dilatePx) : base.mask
  const { ox, oy } = base
  const { w, h, data } = mask
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[y * w + x] === 1

  // Find the top-left-most region pixel as the start.
  let sx = -1
  let sy = -1
  for (let y = 0; y < h && sy < 0; y++) {
    for (let x = 0; x < w; x++) {
      if (data[y * w + x] === 1) {
        sx = x
        sy = y
        break
      }
    }
  }
  if (sx < 0) return []

  // Moore-neighbour tracing (clockwise), Jacob's stopping criterion.
  const dirs: Array<[number, number]> = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ]
  const contour: [number, number][] = []
  let cx = sx
  let cy = sy
  let backDir = 6 // came from the west initially
  const startX = sx
  const startY = sy
  let steps = 0
  const maxSteps = w * h * 8
  do {
    contour.push([cx + ox, cy + oy])
    // Search clockwise starting just after the back-direction.
    let found = false
    for (let i = 0; i < 8; i++) {
      const d = (backDir + 1 + i) % 8
      const nx = cx + dirs[d]![0]
      const ny = cy + dirs[d]![1]
      if (at(nx, ny)) {
        backDir = (d + 4) % 8 // reverse points back to current cell
        cx = nx
        cy = ny
        found = true
        break
      }
    }
    if (!found) break // isolated pixel
    steps++
  } while ((cx !== startX || cy !== startY) && steps < maxSteps)

  if (contour.length < 3) return contour
  const simp = simplify(contour, epsPx)
  // Drop a duplicated closing point if present.
  if (
    simp.length > 3 &&
    simp[0]![0] === simp[simp.length - 1]![0] &&
    simp[0]![1] === simp[simp.length - 1]![1]
  ) {
    simp.pop()
  }
  return simp
}

/**
 * Centreline of a thin region as a single polyline (working px), simplified.
 * Returns the longest walked path through the region's skeleton.
 */
export function regionCenterline(region: MaskRegion, srcWidth: number, epsPx = 1.4): [number, number][] {
  const all = regionCenterlines(region, srcWidth, epsPx, 0)
  if (all.length === 0) return []
  let best = all[0]!
  let bestLen = pathLen(best)
  for (const p of all) {
    const l = pathLen(p)
    if (l > bestLen) {
      bestLen = l
      best = p
    }
  }
  return best
}

/**
 * ALL centreline branches of a region as separate polylines (working px),
 * simplified and filtered to those at least `minLenPx` long. An outline network
 * (e.g. the dark line-art of a whole motif) is one connected region but many
 * worked lines, so we keep every branch rather than only the spine.
 */
export function regionCenterlines(
  region: MaskRegion,
  srcWidth: number,
  epsPx = 1.4,
  minLenPx = 4,
): [number, number][][] {
  const { mask, ox, oy } = cropMask(region, srcWidth)
  const skel = thin(mask)
  const polys = trace(skel)
  const out: [number, number][][] = []
  for (const p of polys) {
    if (p.pts.length < 2) continue
    const offset = p.pts.map(([x, y]) => [x + ox, y + oy] as [number, number])
    const simp = simplify(offset, epsPx)
    if (simp.length >= 2 && pathLen(simp) >= minLenPx) out.push(simp)
  }
  return out
}

function pathLen(pts: [number, number][]): number {
  let l = 0
  for (let i = 1; i < pts.length; i++) {
    l += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1])
  }
  return l
}

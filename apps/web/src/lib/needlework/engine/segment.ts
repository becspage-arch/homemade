/**
 * Connected-component segmentation. Each quantised colour layer is split into
 * its separate blobs; every blob becomes a Region carrying the shape stats the
 * classifier needs to decide which stitch works it (fill / line / point / wheel)
 * and which way the stitches run.
 */

import type { QuantResult } from './quantize'

export interface Region {
  /** Cluster (colour) index this region belongs to. */
  cluster: number
  /** Pixel indices (into the label array) that make up the region. */
  pixels: number[]
  /** Pixel count. */ area: number
  /** Bounding box in working px. */
  minX: number
  minY: number
  maxX: number
  maxY: number
  /** Centroid in working px. */ cx: number
  cy: number
  /** Orientation of the long axis in degrees (from image moments), 0 = +x. */
  orientationDeg: number
  /** max(bbox side) / min(bbox side); >1, higher = more elongated. */
  elongation: number
  /** area / bbox-area; ~1 = solid blob, low = wispy/holey. */
  fillRatio: number
  /** Mean stroke width estimate (px): 2 * area / boundary length proxy. */
  meanWidth: number
}

const N4: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/** Split every non-background cluster into connected regions above a min area. */
export function segment(q: QuantResult, minArea: number): Region[] {
  const { labels, width, height, background } = q
  const n = width * height
  const seen = new Uint8Array(n)
  const regions: Region[] = []
  const stack: number[] = []

  for (let start = 0; start < n; start++) {
    if (seen[start]) continue
    const cl = labels[start]!
    if (cl < 0 || background[start] === 1) {
      seen[start] = 1
      continue
    }
    // Flood this blob.
    const pixels: number[] = []
    stack.length = 0
    stack.push(start)
    seen[start] = 1
    while (stack.length) {
      const p = stack.pop()!
      pixels.push(p)
      const x = p % width
      const y = (p / width) | 0
      for (const [dx, dy] of N4) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const np = ny * width + nx
        if (seen[np]) continue
        if (labels[np] !== cl) continue
        seen[np] = 1
        stack.push(np)
      }
    }
    if (pixels.length < minArea) continue
    regions.push(buildRegion(cl, pixels, width))
  }
  return regions
}

function buildRegion(cluster: number, pixels: number[], width: number): Region {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  let sx = 0,
    sy = 0
  for (const p of pixels) {
    const x = p % width
    const y = (p / width) | 0
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    sx += x
    sy += y
  }
  const area = pixels.length
  const cx = sx / area
  const cy = sy / area

  // Second moments -> orientation of the long axis.
  let mxx = 0,
    myy = 0,
    mxy = 0
  for (const p of pixels) {
    const x = (p % width) - cx
    const y = ((p / width) | 0) - cy
    mxx += x * x
    myy += y * y
    mxy += x * y
  }
  mxx /= area
  myy /= area
  mxy /= area
  const orientationDeg = (Math.atan2(2 * mxy, mxx - myy) / 2) * (180 / Math.PI)

  const bw = maxX - minX + 1
  const bh = maxY - minY + 1
  const elongation = Math.max(bw, bh) / Math.max(1, Math.min(bw, bh))
  const fillRatio = area / Math.max(1, bw * bh)
  // Stroke-width proxy: a line of length L and width w has area ~ L*w and the
  // longer bbox side ~ L, so w ~ area / longSide.
  const meanWidth = area / Math.max(1, Math.max(bw, bh))

  return {
    cluster,
    pixels,
    area,
    minX,
    minY,
    maxX,
    maxY,
    cx,
    cy,
    orientationDeg,
    elongation,
    fillRatio,
    meanWidth,
  }
}

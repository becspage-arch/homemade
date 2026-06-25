/**
 * SHAPE-FIRST stage 2: a clean line drawing -> the shapes between the lines.
 *
 * The drawing's black lines define real shapes (a petal area, a leaf, a stem).
 * We find them as the connected white regions ENCLOSED by the lines, drop the
 * outer background, and keep the lines themselves as the drawn outlines/veins.
 * Each shape becomes a region we later colour + stitch; each line becomes a
 * stitched outline. No colour-patch guessing — the shapes come straight from
 * the drawing, so they stay whole and the template matches by construction.
 */

import { thin, type Mask } from '../../loom/trace/skeleton'
import { trace, simplify } from '../../loom/trace/vectorize'
import { regionContour, type MaskRegion } from './contour'

export interface Shape {
  region: MaskRegion
  area: number
  cx: number
  cy: number
  /** Outer outline in working px. */
  contourPx: [number, number][]
}

export interface ShapeResult {
  shapes: Shape[]
  /** The drawn lines (skeletonised ink) as polylines, working px. */
  lines: [number, number][][]
  width: number
  height: number
  /** Ink mask (1 = a drawn line) for debugging / overlays. */
  ink: Uint8Array
}

export interface ShapeOptions {
  /** Working resolution (longest side). Default 700. */
  workPx?: number
  /** Ink threshold 0-255 (darker = line). Default 128. */
  inkMax?: number
  /** Dilate the ink by this many px to close small gaps in the drawing. Default 2. */
  closeGapsPx?: number
  /** Drop shapes smaller than this fraction of the canvas. Default 0.0006. */
  minAreaFrac?: number
}

const N4: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/** Box-average downscale to a working resolution (keeps lines crisp enough). */
function downscale(rgba: Uint8Array, width: number, height: number, target: number) {
  const long = Math.max(width, height)
  if (long <= target) return { rgba, width, height }
  const s = target / long
  const w = Math.max(1, Math.round(width * s))
  const h = Math.max(1, Math.round(height * s))
  const out = new Uint8Array(w * h * 4)
  const sx = width / w
  const sy = height / h
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * sx)
      const y0 = Math.floor(y * sy)
      const x1 = Math.min(width, Math.floor((x + 1) * sx))
      const y1 = Math.min(height, Math.floor((y + 1) * sy))
      let r = 0,
        g = 0,
        b = 0,
        n = 0
      for (let yy = y0; yy < Math.max(y0 + 1, y1); yy++) {
        for (let xx = x0; xx < Math.max(x0 + 1, x1); xx++) {
          const o = (yy * width + xx) * 4
          r += rgba[o]!
          g += rgba[o + 1]!
          b += rgba[o + 2]!
          n++
        }
      }
      const o = (y * w + x) * 4
      out[o] = r / n
      out[o + 1] = g / n
      out[o + 2] = b / n
      out[o + 3] = 255
    }
  }
  return { rgba: out, width: w, height: h }
}

function dilateMask(src: Uint8Array, w: number, h: number, iters: number): Uint8Array {
  let data = src
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
  return data
}

export function extractShapes(
  rgbaIn: Uint8Array,
  widthIn: number,
  heightIn: number,
  opts: ShapeOptions = {},
): ShapeResult {
  const work = downscale(rgbaIn, widthIn, heightIn, opts.workPx ?? 700)
  const { rgba, width, height } = work
  const n = width * height
  const inkMax = opts.inkMax ?? 128

  // 1. Ink mask from the drawing's dark lines.
  const ink = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    const o = i * 4
    const luma = 0.2126 * rgba[o]! + 0.7152 * rgba[o + 1]! + 0.0722 * rgba[o + 2]!
    if (luma < inkMax) ink[i] = 1
  }

  // 2a. Background reach: flood from the image border across the RAW (un-dilated)
  //     non-ink pixels. This captures the cloth AND any negative-space "bay"
  //     tucked between parts that is open to the outside in the actual drawing —
  //     so we never fill bare cloth, even when gap-closing later seals its mouth.
  const bgReach = new Uint8Array(n)
  {
    const q: number[] = []
    const seed = (i: number) => {
      if (ink[i] === 0 && bgReach[i] === 0) {
        bgReach[i] = 1
        q.push(i)
      }
    }
    for (let x = 0; x < width; x++) {
      seed(x)
      seed((height - 1) * width + x)
    }
    for (let y = 0; y < height; y++) {
      seed(y * width)
      seed(y * width + width - 1)
    }
    while (q.length) {
      const i = q.pop()!
      const x = i % width
      const y = (i / width) | 0
      if (x > 0) seed(i - 1)
      if (x < width - 1) seed(i + 1)
      if (y > 0) seed(i - width)
      if (y < height - 1) seed(i + width)
    }
  }

  // 2b. Close small gaps so nearly-closed shapes don't leak into each other.
  const wall = dilateMask(ink, width, height, opts.closeGapsPx ?? 2)

  // 3. Connected components of NON-wall pixels = candidate regions.
  const label = new Int32Array(n).fill(-1)
  const comps: number[][] = []
  const isBackground: boolean[] = []
  const stack: number[] = []
  for (let start = 0; start < n; start++) {
    if (wall[start] === 1 || label[start] !== -1) continue
    const id = comps.length
    const px: number[] = []
    // Background if it touches the border OR overlaps the cloth/negative-space
    // the border-flood reached in the raw drawing.
    let isBg = false
    stack.length = 0
    stack.push(start)
    label[start] = id
    while (stack.length) {
      const p = stack.pop()!
      px.push(p)
      const x = p % width
      const y = (p / width) | 0
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) isBg = true
      if (bgReach[p] === 1) isBg = true
      for (const [dx, dy] of N4) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const np = ny * width + nx
        if (wall[np] === 1 || label[np] !== -1) continue
        label[np] = id
        stack.push(np)
      }
    }
    comps.push(px)
    isBackground.push(isBg)
  }

  // 4. Everything that isn't background (cloth / negative space) is a shape.
  const minArea = Math.max(20, Math.round(n * (opts.minAreaFrac ?? 0.0006)))
  const shapes: Shape[] = []
  for (let id = 0; id < comps.length; id++) {
    if (isBackground[id]) continue
    const px = comps[id]!
    if (px.length < minArea) continue
    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0,
      sx = 0,
      sy = 0
    for (const p of px) {
      const x = p % width
      const y = (p / width) | 0
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
      sx += x
      sy += y
    }
    const region: MaskRegion = { pixels: px, minX, minY, maxX, maxY }
    const contourPx = regionContour(region, width, 1.4, 0)
    if (contourPx.length < 3) continue
    shapes.push({ region, area: px.length, cx: sx / px.length, cy: sy / px.length, contourPx })
  }

  // 5. The drawn lines themselves (skeletonised ink) -> polylines.
  const mask: Mask = { w: width, h: height, data: ink }
  const skel = thin(mask)
  const minLineLen = Math.max(width, height) * 0.02
  const lines: [number, number][][] = []
  for (const poly of trace(skel)) {
    if (poly.pts.length < 2) continue
    const simp = simplify(poly.pts, 1.4)
    let len = 0
    for (let i = 1; i < simp.length; i++) len += Math.hypot(simp[i]![0] - simp[i - 1]![0], simp[i]![1] - simp[i - 1]![1])
    if (simp.length >= 2 && len >= minLineLen) lines.push(simp)
  }

  return { shapes, lines, width, height, ink }
}

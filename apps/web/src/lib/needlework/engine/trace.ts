/**
 * Vectorise CLEAN OUTLINE line art into per-element closed polygons — the front
 * half of the surface-embroidery pattern-maker. The source is real, already-clean
 * public-domain (or original) OUTLINE art, so the enclosed white CELLS bounded by
 * the black ink lines ARE the design's shapes (petals, leaves, buds). We:
 *   threshold off any faint grid -> keep the black ink
 *   seal hairline anti-alias gaps (dilate the ink)
 *   flood-fill the white cells (4-conn so ink lines block)
 *   drop the border-touching background + speckle below a min area
 *   Moore-trace + RDP-simplify each cell -> a clean closed polygon
 *
 * Pure: takes a GRAYSCALE bitmap (the caller loads the image), returns cells in
 * source-pixel coordinates. The semantic step that follows (which cell is a petal
 * vs a leaf, and the floss/stitch plan) is authored per design — see author.ts.
 */

export interface TracedCell {
  index: number
  areaPx: number
  centroid: [number, number]
  /** [minX, minY, maxX, maxY] in source px. */ bbox: [number, number, number, number]
  /** Simplified closed boundary, source px. */ polygon: [number, number][]
}

export interface TraceResult {
  width: number
  height: number
  cells: TracedCell[]
}

export interface TraceOptions {
  /** Pixels darker than this (0–255) are ink. Default 120. Lower to drop a grey grid. */
  inkBelow?: number
  /** Dilations of the ink mask, to seal hairline gaps. Default 1. */
  dilate?: number
  /** Drop cells smaller than this fraction of the canvas. Default 0.001. */
  minAreaFrac?: number
  /** RDP simplification tolerance (px). Default 1.6. */
  simplifyPx?: number
}

function inkMask(g: Uint8Array, W: number, H: number, thresh: number, dilate: number): Uint8Array {
  let ink = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) ink[i] = g[i]! < thresh ? 1 : 0
  for (let d = 0; d < dilate; d++) {
    const out = new Uint8Array(W * H)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        if (ink[i]) { out[i] = 1; continue }
        if ((x > 0 && ink[i - 1]) || (x < W - 1 && ink[i + 1]) || (y > 0 && ink[i - W]) || (y < H - 1 && ink[i + W])) out[i] = 1
      }
    }
    ink = out
  }
  return ink
}

function labelCells(ink: Uint8Array, W: number, H: number): { labels: Int32Array; count: number } {
  const labels = new Int32Array(W * H).fill(-1)
  let next = 0
  const stack: number[] = []
  for (let s = 0; s < W * H; s++) {
    if (ink[s] || labels[s] !== -1) continue
    const id = next++
    labels[s] = id
    stack.length = 0
    stack.push(s)
    while (stack.length) {
      const p = stack.pop()!
      const x = p % W
      const y = (p - x) / W
      if (x > 0) { const q = p - 1; if (!ink[q] && labels[q] === -1) { labels[q] = id; stack.push(q) } }
      if (x < W - 1) { const q = p + 1; if (!ink[q] && labels[q] === -1) { labels[q] = id; stack.push(q) } }
      if (y > 0) { const q = p - W; if (!ink[q] && labels[q] === -1) { labels[q] = id; stack.push(q) } }
      if (y < H - 1) { const q = p + W; if (!ink[q] && labels[q] === -1) { labels[q] = id; stack.push(q) } }
    }
  }
  return { labels, count: next }
}

function traceBoundary(labels: Int32Array, W: number, H: number, id: number, start: number): [number, number][] {
  const nb: [number, number][] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
  const inCell = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && labels[y * W + x] === id
  const sx = start % W
  const sy = (start - sx) / W
  const ring: [number, number][] = []
  let cx = sx
  let cy = sy
  let dir = 6
  let guard = 0
  const maxGuard = W * H * 4 + 1000
  do {
    ring.push([cx, cy])
    let found = false
    for (let k = 0; k < 8; k++) {
      const d = (dir + k) % 8
      const nx = cx + nb[d]![0]
      const ny = cy + nb[d]![1]
      if (inCell(nx, ny)) { cx = nx; cy = ny; dir = (d + 5) % 8; found = true; break }
    }
    if (!found) break
    if (++guard > maxGuard) break
  } while (!(cx === sx && cy === sy) || ring.length < 2)
  return ring
}

function rdp(points: [number, number][], eps: number): [number, number][] {
  if (points.length < 3) return points
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const stack: [number, number][] = [[0, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()!
    let dmax = 0
    let idx = -1
    const [ax, ay] = points[a]!
    const [bx, by] = points[b]!
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i]!
      const dist = Math.abs((px - ax) * dy - (py - ay) * dx) / len
      if (dist > dmax) { dmax = dist; idx = i }
    }
    if (dmax > eps && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]) }
  }
  const out: [number, number][] = []
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]!)
  return out
}

/** Trace clean outline line art (grayscale, 1 byte/px) into per-element cells. */
export function traceLineArt(gray: Uint8Array, width: number, height: number, opts: TraceOptions = {}): TraceResult {
  const W = width
  const H = height
  const thresh = opts.inkBelow ?? 120
  const dilate = opts.dilate ?? 1
  const ink = inkMask(gray, W, H, thresh, dilate)
  const { labels, count } = labelCells(ink, W, H)

  const isBg = new Uint8Array(count)
  for (let x = 0; x < W; x++) { const a = labels[x]!; if (a >= 0) isBg[a] = 1; const b = labels[(H - 1) * W + x]!; if (b >= 0) isBg[b] = 1 }
  for (let y = 0; y < H; y++) { const a = labels[y * W]!; if (a >= 0) isBg[a] = 1; const b = labels[y * W + W - 1]!; if (b >= 0) isBg[b] = 1 }

  const area = new Int32Array(count)
  const start = new Int32Array(count).fill(-1)
  const sumx = new Float64Array(count)
  const sumy = new Float64Array(count)
  const minx = new Int32Array(count).fill(W)
  const miny = new Int32Array(count).fill(H)
  const maxx = new Int32Array(count).fill(-1)
  const maxy = new Int32Array(count).fill(-1)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const id = labels[y * W + x]!
      if (id < 0) continue
      area[id] = area[id]! + 1
      sumx[id]! += x
      sumy[id]! += y
      if (x < minx[id]!) minx[id] = x
      if (y < miny[id]!) miny[id] = y
      if (x > maxx[id]!) maxx[id] = x
      if (y > maxy[id]!) maxy[id] = y
      if (start[id] === -1) start[id] = y * W + x
    }
  }

  const minArea = Math.max(40, Math.round(W * H * (opts.minAreaFrac ?? 0.001)))
  const eps = opts.simplifyPx ?? 1.6
  const cells: TracedCell[] = []
  for (let id = 0; id < count; id++) {
    if (isBg[id] || area[id]! < minArea) continue
    const ring = traceBoundary(labels, W, H, id, start[id]!)
    const poly = rdp(ring, eps)
    if (poly.length < 3) continue
    cells.push({
      index: cells.length,
      areaPx: area[id]!,
      centroid: [sumx[id]! / area[id]!, sumy[id]! / area[id]!],
      bbox: [minx[id]!, miny[id]!, maxx[id]!, maxy[id]!],
      polygon: poly,
    })
  }
  return { width: W, height: H, cells }
}
